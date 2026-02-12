# Parser Handler Lambda
import boto3 
import urllib.parse
import json
from datetime import datetime
import os

s3 = boto3.client("s3")
dynamodb = boto3.resource("dynamodb")
bedrock = boto3.client("bedrock-runtime")

PARSED_BUCKET_NAME = os.environ.get("PARSED_BUCKET_NAME")
RESUMES_TABLE_NAME = os.environ.get("TABLE_NAME")
BEDROCK_MODEL_ID = os.environ.get("BEDROCK_MODEL_ID", 'anthropic.claude-3-5-sonnet-20240620-v1:0')

def handler(event, context):   
    try:
        for record in event['Records']:
            print(record)
    except Exception as e:
        raise e
