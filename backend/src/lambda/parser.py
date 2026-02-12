# Parser Handler Lambda
import boto3 
import urllib.parse
import json
import os
from datetime import datetime
from langchain_aws import ChatBedrock
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field
from typing import List, Optional

# Initialize Clients
s3 = boto3.client("s3")
dynamodb = boto3.resource("dynamodb")

# Env Variables
PARSED_BUCKET_NAME = os.environ.get("PARSED_BUCKET_NAME")
RESUMES_TABLE_NAME = os.environ.get("RESUMES_TABLE_NAME") 
BEDROCK_MODEL_ID = os.environ.get("BEDROCK_MODEL_ID", "anthropic.claude-3-5-sonnet-20240620-v1:0")

# --- Pydantic Models ---
class WorkExperience(BaseModel):
    role: str = Field(description="Job title")
    company: str = Field(description="Company name")
    duration: str = Field(description="Time period, e.g. 'Jan 2020 - Present'")
    location: Optional[str] = Field(description="City/State")
    achievements: List[str] = Field(description="List of bullet points/key achievements")

class Education(BaseModel):
    degree: str = Field(description="Degree name, e.g. 'BSc Computer Science'")
    institution: str = Field(description="University or School name")
    year: str = Field(description="Graduation year or range")

class Skills(BaseModel):
    languages: List[str] = Field(description="Programming languages like Python, Java")
    frameworks: List[str] = Field(description="Frameworks like React, Django")
    tools: List[str] = Field(description="Tools like Git, Docker, AWS")

class ContactInfo(BaseModel):
    name: str = Field(description="Full name")
    email: Optional[str] = Field(description="Email address")
    phone: Optional[str] = Field(description="Phone number")
    linkedin: Optional[str] = Field(description="LinkedIn URL")
    location: Optional[str] = Field(description="City, Country")

class ResumeSchema(BaseModel):
    contact_info: ContactInfo
    professional_summary: str = Field(description="Brief summary of the candidate")
    work_experience: List[WorkExperience]
    education: List[Education]
    skills: Skills

def handler(event, context):  
    try:  
        # 1. Download file from S3
        records = event["Records"][0]
        bucket = records['s3']['bucket']['name']
        key = urllib.parse.unquote_plus(records['s3']['object']['key'])

        print(f"Processing file: {bucket}/{key}")

        # 2. Read the JSON file
        response = s3.get_object(Bucket=bucket, Key=key)
        file_content = response['Body'].read().decode('utf-8')
        data = json.loads(file_content)

        # 3. Get Raw Data
        raw_text = data.get('raw_text')
        user_id = data.get('user_id', 'unknown')
        resume_id = data.get('resume_id', 'unknown')

        if not raw_text:    
            print("No raw_text found in file.")
            return {"statusCode": 404, "body": "No raw data found"}
        
        # 4. Setup Bedrock Model
        model = ChatBedrock(
            model_id=BEDROCK_MODEL_ID,
            model_kwargs={"temperature": 0.0}
        )
        
        # 5. Setup Parser & Prompt
        parser = JsonOutputParser(pydantic_object=ResumeSchema)

        # We inject format_instructions so the AI knows the JSON schema
        prompt = PromptTemplate(
            template="""You are an expert Resume Parser.
            Extract information from the following resume text.
            
            {format_instructions}
            
            RESUME TEXT:
            {resume_text}
            """,
            input_variables=["resume_text"],
            partial_variables={"format_instructions": parser.get_format_instructions()}
        )
        
        # 6. Run the Chain (Pipe Syntax)
        chain = prompt | model | parser
        
        print("Invoking LangChain...")
        # Use .invoke() for modern chains, not .run()
        structured_data = chain.invoke({"resume_text": raw_text})
        print("Parsing complete.")

        # 7. Save Clean Data to S3
        output_key = key.replace("raw/", "clean/")
            
        final_output = {
            "user_id": user_id,
            "resume_id": resume_id,
            "parsed_data": structured_data,
            "parsed_at": datetime.utcnow().isoformat()
        }

        s3.put_object(
            Bucket=PARSED_BUCKET_NAME,
            Key=output_key,
            Body=json.dumps(final_output),
            ContentType='application/json'
        )
        print(f"Saved clean JSON to {output_key}")
        
        # 8. Update DynamoDB
        table = dynamodb.Table(RESUMES_TABLE_NAME)
        table.update_item(
            Key={'user_id': user_id, 'resume_id': resume_id},
            UpdateExpression='SET #status = :status, clean_s3_key = :clean_key, updated_at = :ts',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={
                ':status': 'PARSED',
                ':clean_key': output_key,
                ':ts': datetime.utcnow().isoformat()
            }
        )
        print("DynamoDB updated.")

        return {"statusCode": 200, "body": "Parsing Complete"}

    except Exception as e:
        print(f"ERROR: {str(e)}")
        raise e