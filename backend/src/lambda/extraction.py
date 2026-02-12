# Extraction Handler Lambda
import boto3
import json
import os
import urllib.parse
from datetime import datetime


#initializing env variables 
PARSED_BUCKET_NAME = os.environ.get("PARSED_BUCKET_NAME")
RESUMES_TABLE_NAME = os.environ.get("TABLE_NAME")
s3 = boto3.client('s3')
textract = boto3.client('textract')
dynamodb = boto3.resource('dynamodb')



def handler(event, context):
    timestamp = datetime.utcnow().isoformat()
    try:
        # getting the data from s3
        records = event["Records"][0]
        bucket = records['s3']['bucket']['name']
        key = urllib.parse.unquote_plus(records['s3']['object']['key'])
        print(f"getting the data from s3 bucket: {bucket} and key {key}")
        
        if not key.lower().endswith(".pdf"):
            print(f"file {key} is not supported. skipping")
            return {'statusCode': 200, 'body': 'Skipped - not a supported file type'}
        

        #extracting user_id and resume_id from s3
        key_parts = key.split('/')
        if (len(key_parts) >= 5 and key_parts[0] == "users"):
            user_id = key_parts[1]
            resume_id = key_parts[3]

        else:
            user_id = "unknown"
            resume_id = key.replace('/', '_')
        print(f"Extracted user_id: {user_id}, resume_id: {resume_id}")
        
        # setting up textract
        textract_response = textract.detect_document_text(
            Document={
                'S3Object':{
                    'Bucket': bucket, 
                    'Name': key
                }
            }
        )
        extracted_lines = []
        for block in textract_response.get('Blocks', []): 
            if block["BlockType"] == "LINE":
                extracted_lines.append(block["Text"])  

        extracted_text = '\n'.join(extracted_lines)
        print(f"Extracted {len(extracted_lines)} lines of text")

        #saving texts into textract
        raw_key = f"raw/{user_id}/{resume_id}.json"

        raw_data ={
            'user_id': user_id, 
            'resume_id': resume_id,
            'raw_text': extracted_text, 
            'line_count': len(extracted_lines),
            'source_bucket': bucket,
            'source_key': key,
            'extracted_at': timestamp

        }

        #uploading raw data to s3 parsedText bucket
        s3.put_object(
            Bucket = PARSED_BUCKET_NAME,
            Key = raw_key,
            Body = json.dumps(raw_data),
            ContentType = 'application/json'
        )

        print(f"saved the raw text to s3://{PARSED_BUCKET_NAME}/{raw_key}")


        #saving the raw location in dynamoDB

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
                ':raw_key': raw_key,    # Hint: raw_key
                ':ts': timestamp
            }
        )
        
        print(f"Update Raw DynamoDB status to Extracted for {resume_id} ")

        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Text extraction complete',
                'user_id': user_id,
                'resume_id': resume_id,
                'raw_s3_key': raw_key,
                'line_count': len(extracted_lines)
            })
        }
    except Exception as e :
        print(e)
        print(f'Error getting object ${records}')
        raise e 
    

