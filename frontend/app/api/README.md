# API Routes - AWS Integration Points

This directory contains Next.js API routes that will connect to your AWS backend infrastructure.

## Architecture Overview

Based on your AWS infrastructure diagram, the following services will be integrated:

### Authentication Flow
- **Amazon Cognito** - User authentication and authorization
- **API Gateway** - REST API entry point

### Resume Upload Flow  
1. Browser uploads resume (PDF) via presigned S3 URL
2. **S3** triggers Lambda on upload
3. **Extraction Lambda** uses Amazon Textract to parse resume
4. **Parser Lambda** processes and stores data in DynamoDB
5. Metadata stored in **DynamoDB MasterResumes table**

### Resume Enhancement Flow
1. User provides job description
2. **Enhancement Lambda** combines resume + job description
3. **Scoring Lambda** analyzes and scores match
4. **Amazon Bedrock (Claude 3.5 Sonnet)** generates enhanced resume
5. Enhanced resume stored in **S3 Parsed Bucket**

### Download Flow
1. **Download Handler Lambda** generates presigned S3 URL
2. Browser downloads enhanced resume (PDF/DOCX)

## Integration Status

🟡 **Routes Created** - API structure ready
🔴 **AWS Not Connected** - Awaiting backend implementation

## When Ready to Connect Backend

1. Add AWS SDK dependencies
2. Configure environment variables in `.env.local`
3. Implement AWS service calls in each route
4. Update CORS settings
5. Add authentication middleware
