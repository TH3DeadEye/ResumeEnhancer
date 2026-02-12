# Upload Handler Lambda
import boto3
import os
import json
import base64
import uuid
from datetime import datetime

S3_BUCKET_NAME = os.environ.get('UPLOADBUCKET_BUCKET_NAME')
DYNAMODB_TABLE = os.environ.get('RESUMES_TABLE_NAME')

s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')

def handler(event, context):
    try:
        # GET USER ID FROM COGNITO
        claims = event.get('requestContext', {}).get('authorizer', {}).get('claims', {})
        user_id = claims.get('sub')
        user_email = claims.get('email', 'unknown')
        
        if not user_id:
            return {
                'statusCode': 401,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Unauthorized - No user ID found'})
            }
        
        # ============================================================
        # PARSE REQUEST BODY
        # ============================================================
        
        body = json.loads(event.get('body', '{}'))
        file_data = body.get('file_data')  # Base64 encoded file
        filename = body.get('filename')
        content_type = body.get('content_type', 'application/pdf')
        
        if not file_data or not filename:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Missing file_data or filename'})
            }
        
        # ============================================================
        # GENERATE UNIQUE RESUME ID & S3 KEY
        # ============================================================
        
        resume_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().isoformat()
        
        # S3 key structure: users/{user_id}/resumes/{resume_id}/{filename}
        s3_key = f"users/{user_id}/resumes/{resume_id}/{filename}"
        
        # Decode base64 file data
        decoded_data = base64.b64decode(file_data)
        file_size = len(decoded_data)
        
        # ============================================================
        # UPLOAD TO S3
        # ============================================================
        
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
        
        # ============================================================
        # STORE METADATA IN DYNAMODB
        # ============================================================
        
        table = dynamodb.Table(DYNAMODB_TABLE)
        
        resume_item = {
            'user_id': user_id,           # Partition Key
            'resume_id': resume_id,        # Sort Key
            'filename': filename,
            's3_bucket': S3_BUCKET_NAME,
            's3_key': s3_key,
            's3_url': s3_url,
            'content_type': content_type,
            'file_size': file_size,
            'uploaded_at': timestamp,
            'updated_at': timestamp,
            'status': 'uploaded',          # uploaded, parsing, parsed, enhanced
            'user_email': user_email,
            # These will be populated by other lambdas
            'parsed_text_key': None,
            'enhanced_versions': [],
            'scores': {}
        }
        
        table.put_item(Item=resume_item)
        
        # ============================================================
        # RETURN SUCCESS RESPONSE
        # ============================================================
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'message': 'Resume uploaded successfully',
                'user_id': user_id,
                'resume_id': resume_id,
                'filename': filename,
                's3_url': s3_url,
                'uploaded_at': timestamp
            })
        }
        
    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Invalid JSON in request body'})
        }
    except Exception as e:
        print(f"Error uploading resume: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': f'Upload failed: {str(e)}'})
        }

