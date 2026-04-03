# Enhancement Handler Lambda
import boto3
import json
import os
from datetime import datetime, timezone
from langchain_aws import ChatBedrock
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field
from typing import List, Optional
from utils import api_response

# Env variables
BEDROCK_MODEL_ID = os.environ.get("BEDROCK_MODEL_ID", "anthropic.claude-3-5-sonnet-20240620-v1:0")
GENERATEDBUCKET_BUCKET_NAME = os.environ.get("GENERATEDBUCKET_BUCKET_NAME")
PARSED_BUCKET_NAME = os.environ.get("PARSED_BUCKET_NAME")
RESUMES_TABLE_NAME = os.environ.get("RESUMES_TABLE_NAME")

s3 = boto3.client("s3")
dynamodb = boto3.resource("dynamodb")


class BulletSuggestion(BaseModel):
    original: str = Field(description="Original bullet point text, empty string if new")
    improved: str = Field(description="Improved bullet point text")
    reason: str = Field(description="Why this change improves the resume")

class SectionFeedback(BaseModel):
    section: str = Field(description="Section name, e.g. 'Work Experience', 'Skills'")
    score: int = Field(description="Section quality score from 0 to 100")
    suggestions: List[BulletSuggestion] = Field(description="List of specific suggestions for this section")

class EnhancementOutput(BaseModel):
    overall_score: int = Field(description="Overall resume quality score from 0 to 100")
    ats_score: int = Field(description="ATS compatibility score from 0 to 100")
    job_match_score: Optional[int] = Field(description="How well resume matches job description, 0-100. Null if no job description provided")
    summary_suggestion: str = Field(description="Rewritten professional summary optimized for the role")
    section_feedback: List[SectionFeedback] = Field(description="Feedback and improvements per section")
    missing_keywords: List[str] = Field(description="Important keywords missing from the resume, based on job description or general best practices")
    top_wins: List[str] = Field(description="3-5 things the candidate is already doing well")



def handler(event, context):
    timestamp = datetime.now(timezone.utc).isoformat()
    try:
        #auth
        claims = event.get("requestContext", {}).get("authorizer", {}).get("claims", {})
        user_id = claims.get("sub")

        if not user_id:
            return _response(401, {"error": "Unauthorized - No user ID found"})
    except Exception as e:
        print(f"Auth error: {str(e)}")
        return _response(500, {"error": "Auth check failed"})
    
    # 2. Parse request body
    try:
        body = json.loads(event.get("body", "{}"))
        resume_id = body.get("resume_id")
        job_description = body.get("job_description", "").strip()
        MAX_JD_LENGTH = 10000   #added job description valiudation for token usage
        if len(job_description) > MAX_JD_LENGTH:
            return _response(400, {'error':f"Job description exceeds {MAX_JD_LENGTH} character limit"})

        if not resume_id:
            return _response(400, {"error": "Missing resume_id in request body"})
    except json.JSONDecodeError:
        return _response(400, {"error": "Invalid JSON in request body"})

    # 3. Look up DynamoDB to find the clean_s3_key
    try:
        table = dynamodb.Table(RESUMES_TABLE_NAME)
        result = table.get_item(Key={"user_id": user_id, "resume_id": resume_id})
        item = result.get("Item")

        if not item:
            return _response(404, {"error": f"Resume {resume_id} not found for this user"})

        clean_s3_key = item.get("clean_s3_key")
        if not clean_s3_key:
            current_status = item.get("status", "unknown")
            return _response(409, {
                "error": f"Resume is not ready for enhancement yet. Current status: {current_status}",
                "status": current_status
            })
    except Exception as e:
        print(f"DynamoDB lookup error: {str(e)}")
        return _response(500, {"error": "Failed to retrieve resume metadata"})

    # 4. Load parsed resume JSON from S3
    try:
        s3_response = s3.get_object(Bucket=PARSED_BUCKET_NAME, Key=clean_s3_key)
        parsed_file = json.loads(s3_response["Body"].read().decode("utf-8"))
        parsed_data = parsed_file.get("parsed_data", {})

        if not parsed_data:
            return _response(422, {"error": "Parsed resume data is empty"})
    except Exception as e:
        print(f"S3 read error: {str(e)}")
        return _response(500, {"error": "Failed to load parsed resume"})


    # 5. Call Bedrock via LangChain
    try:
        model = ChatBedrock(
            model_id=BEDROCK_MODEL_ID,
            model_kwargs={"temperature": 0.3, "max_tokens": 4096}
        )

        parser = JsonOutputParser(pydantic_object=EnhancementOutput)

        job_section = (
            f"\nJOB DESCRIPTION TO TARGET:\n{job_description}\n"
            if job_description
            else "\nNo job description provided — optimize for general best practices and ATS compatibility.\n"
        )

        prompt = PromptTemplate(
            template="""You are an elite Resume Coach and Applicant Tracking System (ATS) Optimization Expert. Your objective is to critically analyze the provided resume data against the target job description to maximize ATS parseability, keyword match rate, and overall recruiter impact.

INPUTS:
Target Job Description / Context: 
{job_section}

Parsed Resume Data (JSON): 
{resume_json}

OUTPUT FORMAT:
{format_instructions}

CORE DIRECTIVES:

1. ATS Optimization & Keyword Alignment:
- Keyword Gap Analysis: Identify missing hard skills, soft skills, and exact-match phrases from the job description. Differentiate between mandatory requirements and preferred qualifications.
- ATS Best Practices: Flag non-standard section headings (e.g., suggest "Work Experience" instead of "My Career Journey") and warn against ATS-unfriendly terminology. 
- Acronym Optimization: Ensure acronyms are spelled out at least once (e.g., "Search Engine Optimization (SEO)") so the ATS catches both variations.

2. Bullet Point Engineering (Impact & Action):
- Rewrite weak bullet points using the XYZ formula: "Accomplished [X] as measured by [Y], by doing [Z]."
- Replace passive language and weak verbs (e.g., "helped with," "responsible for") with powerful, high-impact action verbs.
- Provide a clear "Before" and "After" for any bullet point you rewrite to show the exact improvement.

3. Structural & Strategic Feedback:
- Identify gaps in employment, missing education details, or overly dense text blocks that need breaking down.
- Ensure the summary/objective statement (if present) is tailored specifically to the target role rather than being generic.

STRICT RULES & CONSTRAINTS:
- Ground in Reality: Never fabricate metrics, skills, or experiences. If quantifiable data is missing, suggest where the user *could* add it (e.g., "Add the exact budget size here if you know it").
- Be Hyper-Specific: Always quote the exact text from the parsed resume when offering critiques. Do not give generic advice.
- Authentic Scoring: Your assessment scores must be rigorous and reflect the genuine quality of the current resume. Do not inflate scores; if the resume is a 4/10 for ATS compatibility, score it a 4/10 and justify why.""",
            input_variables=["resume_json", "job_section"],
            partial_variables={"format_instructions": parser.get_format_instructions()}
        )

        chain = prompt | model | parser

        print(f"Invoking Bedrock for resume {resume_id}...")
        enhancement_result = chain.invoke({
            "resume_json": json.dumps(parsed_data, indent=2),
            "job_section": job_section
        })
        print("Enhancement complete.")

    except Exception as e:
        print(f"Bedrock error: {str(e)}")
        return _response(500, {"error": "AI enhancement failed"})


    # 6. Save result to GeneratedBucket

    try:
        output_key = f"enhanced/{user_id}/{resume_id}.json"

        final_output = {
            "user_id": user_id,
            "resume_id": resume_id,
            "job_description_provided": bool(job_description),
            "enhancement": enhancement_result,
            "enhanced_at": timestamp
        }

        s3.put_object(
            Bucket=GENERATEDBUCKET_BUCKET_NAME,
            Key=output_key,
            Body=json.dumps(final_output),
            ContentType="application/json"
        )
        print(f"Saved enhancement to s3://{GENERATEDBUCKET_BUCKET_NAME}/{output_key}")
    except Exception as e:
        print(f"S3 save error: {str(e)}")
        return _response(500, {"error": "Failed to save enhancement results"})


    # 7. Update DynamoDB

    try:
        table.update_item(
            Key={"user_id": user_id, "resume_id": resume_id},
            UpdateExpression=(
                "SET #status = :status, enhanced_s3_key = :ekey, "
                "updated_at = :ts, overall_score = :score, ats_score = :ats"
            ),
            ExpressionAttributeNames={"#status": "status"},
            ExpressionAttributeValues={
                ":status": "ENHANCED",
                ":ekey": output_key,
                ":ts": timestamp,
                ":score": enhancement_result.get("overall_score", 0),
                ":ats": enhancement_result.get("ats_score", 0)
            }
        )
        print(f"DynamoDB updated to ENHANCED for {resume_id}")
    except Exception as e:
        print(f"DynamoDB update error: {str(e)}")
        # Non-fatal — enhancement already saved to S3, still return success

    # 8. Return response

    return _response(200, {
        "message": "Resume enhancement complete",
        "resume_id": resume_id,
        "enhanced_s3_key": output_key,
        "overall_score": enhancement_result.get("overall_score"),
        "ats_score": enhancement_result.get("ats_score"),
        "job_match_score": enhancement_result.get("job_match_score"),
        "summary_suggestion": enhancement_result.get("summary_suggestion"),
        "section_feedback": enhancement_result.get("section_feedback", []),
        "missing_keywords": enhancement_result.get("missing_keywords", []),
        "top_wins": enhancement_result.get("top_wins", []),
        "enhanced_at": timestamp
    })


# ============================================================
# HELPERS
# ============================================================

def _response(status_code: int, body: dict) -> dict:
    return api_response(status_code=status_code, body=body)