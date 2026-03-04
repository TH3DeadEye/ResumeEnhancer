# Download Handler Lambda
import boto3
import json
import os

GENERATEDBUCKET_BUCKET_NAME = os.environ.get("GENERATED_BUCKET_NAME")
RESUMES_TABLE_NAME = os.environ.get("RESUMES_TABLE_NAME")

s3 = boto3.client("s3")
dynamodb = boto3.resource("dynamodb")


def handler(event, context):
    # 1. Auth
    try:
        claims = event.get("requestContext", {}).get("authorizer", {}).get("claims", {})
        user_id = claims.get("sub")
        if not user_id:
            return _response(401, {"error": "Unauthorized - No user ID found"})
    except Exception as e:
        print(f"Auth error: {str(e)}")
        return _response(500, {"error": "Auth check failed"})

    # 2. Get resume_id from query params
    query_params = event.get("queryStringParameters") or {}
    resume_id = query_params.get("resume_id")
    if not resume_id:
        return _response(400, {"error": "Missing resume_id query parameter"})

    # 3. Look up DynamoDB
    try:
        table = dynamodb.Table(RESUMES_TABLE_NAME)
        result = table.get_item(Key={"user_id": user_id, "resume_id": resume_id})
        item = result.get("Item")
        if not item:
            return _response(404, {"error": f"Resume {resume_id} not found for this user"})

        enhanced_s3_key = item.get("enhanced_s3_key")
        if not enhanced_s3_key:
            current_status = item.get("status", "unknown")
            return _response(409, {
                "error": f"Resume has not been enhanced yet. Current status: {current_status}",
                "status": current_status
            })
    except Exception as e:
        print(f"DynamoDB lookup error: {str(e)}")
        return _response(500, {"error": f"Failed to retrieve resume metadata: {str(e)}"})

    # 4. Fetch enhancement JSON from S3
    try:
        s3_response = s3.get_object(Bucket=GENERATEDBUCKET_BUCKET_NAME, Key=enhanced_s3_key)
        enhancement_file = json.loads(s3_response["Body"].read().decode("utf-8"))
    except Exception as e:
        print(f"S3 read error: {str(e)}")
        return _response(500, {"error": f"Failed to load enhancement results: {str(e)}"})

    # 5. Return enhancement data
    return _response(200, {
        "resume_id": resume_id,
        "filename": item.get("filename", ""),
        "status": item.get("status"),
        "enhanced_at": enhancement_file.get("enhanced_at"),
        "job_description_provided": enhancement_file.get("job_description_provided", False),
        "enhancement": enhancement_file.get("enhancement", {})
    })


def _response(status_code: int, body: dict) -> dict:
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        },
        "body": json.dumps(body)
    }
