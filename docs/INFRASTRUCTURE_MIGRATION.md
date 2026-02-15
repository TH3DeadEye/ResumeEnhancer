# Infrastructure Migration: S3 Sidecar Workflow

## Overview

This document outlines all infrastructure changes made to `template.yaml` to implement the **S3 Sidecar Workflow** pattern. This separates content (resume text) from metadata, uses S3 for large data storage, and creates an event-driven pipeline.

---

## Architecture: Before vs After

### Before (Broken Chain)
```
Upload → ExtractionHandler → ExtractionTextDB (DynamoDB) → ??? → ParserHandler (NEVER TRIGGERED!)
```

### After (S3 Sidecar Workflow)
```
┌────────────┐     ┌──────────────┐     ┌─────────────────────┐
│  Upload    │────▶│ uploadBucket │────▶│  ExtractionHandler  │
│  (API)     │     │   (PDF)      │     │  - Textract OCR     │
└────────────┘     └──────────────┘     └──────────┬──────────┘
                                                   │
                   ┌───────────────────────────────┼────────────────┐
                   ▼                               ▼                ▼
           ┌─────────────┐              ┌─────────────────┐  ┌──────────────┐
           │ ResumesTable│              │  ParsedText S3  │  │ S3 Trigger   │
           │  status:    │              │  raw/{user_id}/ │──│ prefix: raw/ │
           │  EXTRACTED  │              │  {resume_id}.json  └──────┬───────┘
           └─────────────┘              └─────────────────┘         │
                                                                    ▼
                                                             ┌──────────────┐
                                                             │ParserHandler │
                                                             │ - Claude AI  │
                                                             └──────┬───────┘
                   ┌───────────────────────────────┼────────────────┘
                   ▼                               ▼
           ┌─────────────┐              ┌─────────────────┐
           │ ResumesTable│              │  ParsedText S3  │
           │  status:    │              │  clean/{user_id}/│
           │  READY      │              │  {resume_id}.json│
           └─────────────┘              └─────────────────┘
                   │                               │
                   └───────────────┬───────────────┘
                                   ▼
                    ┌─────────────────────────────┐
                    │     EnhancementHandler      │
                    │  - Lookup clean_s3_key      │
                    │  - Fetch JSON from S3       │
                    │  - Call Bedrock Claude      │
                    └─────────────────────────────┘
```

---

## Changes Summary

| # | Change Type | Resource | Description |
|---|-------------|----------|-------------|
| 1 | **ADDED** | `Globals` section | Shared environment variables for all functions |
| 2 | **ADDED** | `BedrockModelId` Parameter | Configurable AI model ID |
| 3 | **ADDED** | `FrontendUrl` Parameter | Configurable callback URLs |
| 4 | **DELETED** | `ExtractionTextDB` | No longer needed - using S3 instead |
| 5 | **UPDATED** | `ParsedText` bucket | Added S3 trigger for ParserHandler + lifecycle rule |
| 6 | **UPDATED** | `ExtractionHandler` | New env vars, policies for ResumesTable |
| 7 | **UPDATED** | `ParserHandler` | Added S3 trigger, new policies |
| 8 | **UPDATED** | `ScoringHandler` | Updated to use ResumesTable |
| 9 | **UPDATED** | `EnhancementHandler` | Updated to use ResumesTable, configurable model |
| 10 | **UPDATED** | `UserPoolClient` | Uses FrontendUrl parameter |
| 11 | **UPDATED** | `Metadata` section | Removed ExtractionTextDB reference |

---

## Detailed Changes

### 1. NEW: Globals Section

Added at the top of `Resources` section to share common environment variables:

```yaml
Globals:
  Function:
    Runtime: python3.13
    MemorySize: 3008
    Tracing: Active
    Environment:
      Variables:
        PARSED_BUCKET_NAME: !Ref ParsedText
        RESUMES_TABLE_NAME: !Ref ResumesTable
```

**Why?** Reduces duplication - every Lambda needs these variables.

---

### 2. NEW: BedrockModelId Parameter

```yaml
Parameters:
  BedrockModelId:
    Type: String
    Default: anthropic.claude-3-5-sonnet-20240620-v1:0
    Description: Bedrock model ID for AI enhancement
```

**Why?** Makes it easy to switch AI models without code changes.

---

### 3. NEW: FrontendUrl Parameter

```yaml
Parameters:
  FrontendUrl:
    Type: String
    Default: http://localhost:3000
    Description: Frontend URL for Cognito callbacks
```

**Why?** Easy to switch between localhost (dev) and production domain.

---

### 4. DELETED: ExtractionTextDB

**Removed entirely.** DynamoDB is too expensive for storing large text blobs.

**Before:**
```yaml
ExtractionTextDB:
  Type: AWS::DynamoDB::Table
  Properties:
    AttributeDefinitions:
      - AttributeName: id
        AttributeType: S
    # ... etc
```

**After:** Deleted. Use S3 instead.

---

### 5. UPDATED: ParsedText Bucket

Added:
- **Lifecycle Rule** to delete `raw/` files after 90 days (cost savings)

**Note:** The S3 trigger for ParserHandler is defined on the **function**, not the bucket. This avoids circular dependency issues.

```yaml
ParsedText:
  Type: AWS::S3::Bucket
  Properties:
    # ... encryption config ...
    
    # Lifecycle rule to clean up raw files
    LifecycleConfiguration:
      Rules:
        - Id: DeleteRawFilesAfter90Days
          Prefix: raw/
          Status: Enabled
          ExpirationInDays: 90
```

---

### 6. UPDATED: ParserHandler (Critical Fix!)

**Added S3 Event trigger** directly on the function (SAM best practice):

```yaml
ParserHandler:
  Type: AWS::Serverless::Function
  Properties:
    # ... other properties ...
    Events:
      S3NewRawFile:
        Type: S3
        Properties:
          Bucket: !Ref ParsedText
          Events: s3:ObjectCreated:*
          Filter:
            S3Key:
              Rules:
                - Name: prefix
                  Value: raw/
                - Name: suffix
                  Value: .json
    Policies:
      - DynamoDBCrudPolicy:
          TableName: !Ref ResumesTable
      - S3CrudPolicy:
          BucketName: !Ref ParsedText
      - Statement:  # Bedrock permission for Claude parsing
          - Effect: Allow
            Action:
              - bedrock:InvokeModel
            Resource: '*'
```

**Why this approach?** Defining the trigger on the function (not the bucket) lets SAM automatically:
- Create the Lambda permission
- Handle the dependency order
- Avoid circular reference errors

---

### 8. UPDATED: ScoringHandler

**Environment Variables:**
| Old | New |
|-----|-----|
| `TABLE_NAME: !Ref ExtractionTextDB` | Removed |
| - | `RESUMES_TABLE_NAME` (from Globals) |
| `PARSED_BUCKET_NAME` | From Globals |

**Policies:**
| Old | New |
|-----|-----|
| `DynamoDBCrudPolicy` for `ExtractionTextDB` | `DynamoDBReadPolicy` for `ResumesTable` |

---

### 9. UPDATED: EnhancementHandler

**Environment Variables:**
| Old | New |
|-----|-----|
| `TABLE_NAME: !Ref ExtractionTextDB` | Removed |
| `BEDROCK_MODEL_ID: anthropic.claude-3-5-sonnet...` | `BEDROCK_MODEL_ID: !Ref BedrockModelId` |
| - | `RESUMES_TABLE_NAME` (from Globals) |

**Policies:**
| Old | New |
|-----|-----|
| `DynamoDBCrudPolicy` for `ExtractionTextDB` | `DynamoDBCrudPolicy` for `ResumesTable` |

---

### 10. UPDATED: UserPoolClient

Callback URLs now use the `FrontendUrl` parameter:

```yaml
CallbackURLs:
  - !Sub ${FrontendUrl}/authorize
  - !Sub ${FrontendUrl}/callback
LogoutURLs:
  - !Sub ${FrontendUrl}/logout
  - !Sub ${FrontendUrl}
```

---

## Lambda Code Requirements

Now that the infrastructure is updated, here's what each Lambda needs to do:

### extraction.py

**Input:** S3 event from `uploadBucket` (PDF uploaded)

**Process:**
1. Get bucket/key from S3 event
2. Extract `user_id` and `resume_id` from key path
3. Call Textract `detect_document_text()`
4. Extract all LINE blocks into text

**Output:**
1. Save raw text to S3: `s3://ParsedText/raw/{user_id}/{resume_id}.json`
   ```json
   {
     "user_id": "...",
     "resume_id": "...",
     "raw_text": "John Smith\nSoftware Engineer\n...",
     "line_count": 45,
     "extracted_at": "2026-02-07T..."
   }
   ```
2. Update `ResumesTable`:
   ```python
   table.update_item(
       Key={'user_id': user_id, 'resume_id': resume_id},
       UpdateExpression='SET #status = :status, raw_s3_key = :key, updated_at = :ts',
       ExpressionAttributeNames={'#status': 'status'},
       ExpressionAttributeValues={
           ':status': 'EXTRACTED',
           ':key': f'raw/{user_id}/{resume_id}.json',
           ':ts': timestamp
       }
   )
   ```

---

### parser.py

**Input:** S3 event from `ParsedText` bucket (raw/ file created)

**Process:**
1. Get bucket/key from S3 event
2. Download raw JSON from S3
3. Use Claude to parse into structured format
4. Extract: contact info, summary, experience, education, skills

**Output:**
1. Save clean JSON to S3: `s3://ParsedText/clean/{user_id}/{resume_id}.json`
   ```json
   {
     "contact": {"name": "John Smith", "email": "...", "phone": "..."},
     "summary": "Experienced software engineer...",
     "experience": [...],
     "education": [...],
     "skills": ["Python", "AWS", ...]
   }
   ```
2. Update `ResumesTable`:
   ```python
   table.update_item(
       Key={'user_id': user_id, 'resume_id': resume_id},
       UpdateExpression='SET #status = :status, clean_s3_key = :key, updated_at = :ts',
       ExpressionAttributeNames={'#status': 'status'},
       ExpressionAttributeValues={
           ':status': 'READY',
           ':key': f'clean/{user_id}/{resume_id}.json',
           ':ts': timestamp
       }
   )
   ```

---

### enhancement.py

**Input:** API Gateway POST `/resume/enhance` with `resume_id` and `job_description`

**Process:**
1. Get `user_id` from Cognito token
2. Look up resume in `ResumesTable` to get `clean_s3_key`
3. Download clean JSON from S3
4. Send to Claude with job description for tailoring
5. Generate enhanced resume

**Output:**
1. Save enhanced resume to `GeneratedBucket`
2. Update `ResumesTable` with `enhanced_s3_key` and `status: ENHANCED`
3. Return success response

---

### scoring.py (Optional)

Can be triggered after parsing or on-demand via API.

**Process:**
1. Get clean JSON from S3
2. Calculate scores (completeness, ATS-friendliness, keyword match)
3. Store scores in `ResumesTable`

---

### download.py

**Input:** API Gateway GET `/resume/download` with `resume_id`

**Process:**
1. Look up resume in `ResumesTable` to get `enhanced_s3_key`
2. Generate presigned URL for S3 download
3. Return URL to frontend

---

## S3 Key Structure

```
ParsedText Bucket
├── raw/
│   └── {user_id}/
│       └── {resume_id}.json      # Raw Textract output (auto-deleted after 90 days)
└── clean/
    └── {user_id}/
        └── {resume_id}.json      # Structured resume data

GeneratedBucket
└── {user_id}/
    └── {resume_id}/
        └── enhanced_resume.pdf   # AI-enhanced resume
```

---

## ResumesTable Schema

| Attribute | Type | Description |
|-----------|------|-------------|
| `user_id` | String (PK) | Cognito user ID |
| `resume_id` | String (SK) | Unique resume identifier |
| `filename` | String | Original uploaded filename |
| `upload_key` | String | S3 key in uploadBucket |
| `raw_s3_key` | String | S3 key for raw extracted text |
| `clean_s3_key` | String | S3 key for parsed JSON |
| `enhanced_s3_key` | String | S3 key for enhanced resume |
| `status` | String | `UPLOADED` → `EXTRACTED` → `READY` → `ENHANCED` |
| `created_at` | String | ISO timestamp |
| `updated_at` | String | ISO timestamp |

---

## Deployment

After making these changes, deploy with:

```bash
cd backend
sam build
sam deploy --parameter-overrides \
  Environment=dev \
  BedrockModelId=anthropic.claude-3-5-sonnet-20240620-v1:0 \
  FrontendUrl=http://localhost:3000
```

For production:
```bash
sam deploy --parameter-overrides \
  Environment=prod \
  BedrockModelId=anthropic.claude-3-5-sonnet-20240620-v1:0 \
  FrontendUrl=https://your-production-domain.com
```

---

## Testing the Pipeline

1. **Upload a PDF** via API → triggers ExtractionHandler
2. **Check S3** for `raw/{user_id}/{resume_id}.json`
3. **Check DynamoDB** for `status: EXTRACTED`
4. **S3 trigger** should automatically invoke ParserHandler
5. **Check S3** for `clean/{user_id}/{resume_id}.json`
6. **Check DynamoDB** for `status: READY`
7. **Call enhance API** → triggers EnhancementHandler
8. **Check GeneratedBucket** for enhanced resume
