# List Resumes Handler Lambda
import boto3
import json
import os
from boto3.dynamodb.conditions import Key
from decimal import Decimal

RESUMES_TABLE_NAME = os.environ.get("RESUMES_TABLE_NAME")

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

    # 2. Query DynamoDB for all resumes belonging to this user
    try:
        table = dynamodb.Table(RESUMES_TABLE_NAME)
        result = table.query(
            KeyConditionExpression=Key("user_id").eq(user_id)
        )
        items = result.get("Items", [])
    except Exception as e:
        print(f"DynamoDB query error: {str(e)}")
        return _response(500, {"error": f"Failed to list resumes: {str(e)}"})

    # 3. Shape the response — include only the fields the frontend needs
    resumes = []
    for item in items:
        resumes.append({
            "resume_id": item.get("resume_id"),
            "filename": item.get("filename", ""),
            "status": item.get("status", "unknown"),
            "uploaded_at": item.get("uploaded_at"),
            "updated_at": item.get("updated_at"),
            "overall_score": item.get("overall_score"),
            "ats_score": item.get("ats_score"),
        })

    # Sort by uploaded_at descending (newest first)
    resumes.sort(key=lambda r: r.get("uploaded_at") or "", reverse=True)

    return _response(200, {"resumes": resumes})


def _response(status_code: int, body: dict) -> dict:
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        },
        "body": json.dumps(body, default=lambda o: int(o) if isinstance(o, Decimal) else str(o))
    }
