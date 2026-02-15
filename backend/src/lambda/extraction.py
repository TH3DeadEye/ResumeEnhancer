# Extraction Handler Lambda
import boto3
import json
import os
import urllib.parse
from datetime import datetime
from io import BytesIO
from pypdf import PdfReader

# Initialize Clients
PARSED_BUCKET_NAME = os.environ.get("PARSED_BUCKET_NAME")
RESUMES_TABLE_NAME = os.environ.get("RESUMES_TABLE_NAME") 

s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')

def handler(event, context):
    timestamp = datetime.utcnow().isoformat()
    try:
        # 1. Parse Event Data
        records = event["Records"][0]
        bucket = records['s3']['bucket']['name']
        key = urllib.parse.unquote_plus(records['s3']['object']['key'])
        print(f"Processing bucket: {bucket}, key: {key}")
        
        if not key.lower().endswith(".pdf"):
            print(f"Skipping non-PDF file: {key}")
            return {'statusCode': 200, 'body': 'Skipped - not a PDF'}

        # 2. Extract IDs from Key (users/{user_id}/resumes/{resume_id}.pdf)
        key_parts = key.split('/')
        if len(key_parts) >= 4 and key_parts[0] == "users":
            user_id = key_parts[1]
            resume_filename = key_parts[3]
            resume_id = os.path.splitext(resume_filename)[0]
        else:
            user_id = "unknown"
            resume_id = key.replace('/', '_')
            
        print(f" identified user_id: {user_id}, resume_id: {resume_id}")
        
        # 3. Download & Extract Text 

        # Fetch file bytes from S3
        response = s3.get_object(Bucket=bucket, Key=key)
        pdf_bytes = response['Body'].read()
        
        # Parse with pypdf
        reader = PdfReader(BytesIO(pdf_bytes))
        extracted_lines = []
        
        for page in reader.pages:
            text = page.extract_text()
            if text:
                extracted_lines.extend(text.split('\n'))
                
        # Join lines back into a single string
        extracted_text = '\n'.join(extracted_lines)
        print(f"Extracted {len(extracted_lines)} lines of text")

        # 4. Prepare Data for Saving
        output_key = f"raw/{user_id}/{resume_id}.json"

        raw_data = {
            'user_id': user_id, 
            'resume_id': resume_id,
            'raw_text': extracted_text,
            'line_count': len(extracted_lines),
            'source_bucket': bucket,
            'source_key': key,
            'extracted_at': timestamp
        }

        # 5. Save JSON to S3
        s3.put_object(
            Bucket=PARSED_BUCKET_NAME,
            Key=output_key,
            Body=json.dumps(raw_data),
            ContentType='application/json'
        )
        print(f"Saved raw text to s3://{PARSED_BUCKET_NAME}/{output_key}")

        # 6. Update DynamoDB
        table = dynamodb.Table(RESUMES_TABLE_NAME)
        table.update_item(
            Key={
                'user_id': user_id,       
                'resume_id': resume_id      
            },
            UpdateExpression='SET #status = :status, raw_s3_key = :raw_key, updated_at = :ts',
            ExpressionAttributeNames={
                '#status': 'status'  
            },
            ExpressionAttributeValues={
                ':status': 'EXTRACTED',
                ':raw_key': output_key,
                ':ts': timestamp
            }
        )
        print(f"Updated DynamoDB status to EXTRACTED for {resume_id}")

        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Text extraction complete',
                'user_id': user_id,
                'resume_id': resume_id,
                'raw_s3_key': output_key
            })
        }

    except Exception as e:
        print(f"ERROR: {str(e)}")
        raise e