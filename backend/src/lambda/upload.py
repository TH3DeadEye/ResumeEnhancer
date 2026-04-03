# Upload Handler Lambda
import boto3
import os
import json
import base64
import uuid
import re
from datetime import datetime, timezone
from utils import api_response

S3_BUCKET_NAME = os.environ.get('UPLOADBUCKET_BUCKET_NAME')
DYNAMODB_TABLE = os.environ.get('RESUMES_TABLE_NAME')

s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')

def handler(event, context):
    try:
        # 1. Auth
        claims = event.get('requestContext', {}).get('authorizer', {}).get('claims', {})
        user_id = claims.get('sub')
        user_email = claims.get('email', 'unknown')

        if not user_id:
            return _response(401, {'error': 'Unauthorized - No user ID found'})

        # 2. Parse request body
        body = json.loads(event.get('body', '{}'))
        file_data = body.get('file_data')
        filename = body.get('filename')

        # Null check BEFORE any processing — os.path.basename(None) would crash
        if not file_data or not filename:
            return _response(400, {"error": "Missing file_data or filename"})

        # Sanitize filename to prevent path traversal
        filename = os.path.basename(filename)
        if not re.match(r'^[\w\-. ]+$', filename):
            return _response(400, {"error": "Invalid filename — only letters, numbers, hyphens, dots allowed"})

        # 3. Decode and validate file content
        decoded_data = base64.b64decode(file_data)
        MAX_FILE_SIZE = 5 * 1024 * 1024
        if len(decoded_data) > MAX_FILE_SIZE:
            return _response(400, {"error": f"File exceeds {MAX_FILE_SIZE // (1024*1024)}MB limit"})
        if decoded_data[:5] != b'%PDF-':
            return _response(400, {"error": "Only PDF files are accepted"})

        content_type = body.get('content_type', 'application/pdf')
        file_size = len(decoded_data)

        # 4. Generate unique resume ID & S3 key
        resume_id = str(uuid.uuid4())
        timestamp = datetime.now(timezone.utc).isoformat()
        s3_key = f"users/{user_id}/resumes/{resume_id}/{filename}"

        # 5. Upload to S3
        s3.put_object(
            Bucket=S3_BUCKET_NAME,
            Key=s3_key,
            Body=decoded_data,
            ContentType=content_type,
            Metadata={
                'user_id': user_id,
                'resume_id': resume_id,
                'original_filename': filename,
                'uploaded_at': timestamp
            }
        )

        s3_url = f"s3://{S3_BUCKET_NAME}/{s3_key}"

        # 6. Store metadata in DynamoDB
        table = dynamodb.Table(DYNAMODB_TABLE)
        resume_item = {
            'user_id': user_id,
            'resume_id': resume_id,
            'filename': filename,
            's3_bucket': S3_BUCKET_NAME,
            's3_key': s3_key,
            's3_url': s3_url,
            'content_type': content_type,
            'file_size': file_size,
            'uploaded_at': timestamp,
            'updated_at': timestamp,
            'status': 'UPLOADED',
            'user_email': user_email,
            'parsed_text_key': None,
            'enhanced_versions': [],
            'scores': {}
        }
        table.put_item(Item=resume_item)

        return _response(200, {
            'message': 'Resume uploaded successfully',
            'user_id': user_id,
            'resume_id': resume_id,
            'filename': filename,
            's3_url': s3_url,
            'uploaded_at': timestamp
        })

    except json.JSONDecodeError:
        return _response(400, {'error': 'Invalid JSON in request body'})
    except Exception as e:
        print(f"Error uploading resume: {str(e)}")
        return _response(500, {"error": "Failed to upload the resume"})


def _response(status_code: int, body: dict) -> dict:
    return api_response(status_code=status_code, body=body)
