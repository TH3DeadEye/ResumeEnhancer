import { NextRequest, NextResponse } from 'next/server';

/**
 * RESUME UPLOAD API ROUTE
 *
 * 🔴 AWS Integration Required:
 * - S3 presigned URL generation
 * - API Gateway integration
 *
 * Flow (from your architecture):
 * 1. Generate presigned S3 URL
 * 2. Return URL to client for direct upload
 * 3. S3 event triggers Extraction Lambda
 * 4. Extraction Lambda uses Amazon Textract
 * 5. Parser Lambda processes and stores in DynamoDB
 *
 * Steps to implement:
 * 1. npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
 * 2. Configure S3 bucket name
 * 3. Use getSignedUrl with PutObjectCommand
 */

const ROUTE = 'POST /api/resume/upload';

export async function POST(request: NextRequest) {
  const start = Date.now();
  console.log(`[${ROUTE}] ← request received | ${new Date().toISOString()}`);

  try {
    const { fileName, fileType } = await request.json();

    // TODO: Generate presigned URL for S3 upload
    // const client = new S3Client({ region: process.env.AWS_REGION });
    // const command = new PutObjectCommand({
    //   Bucket: process.env.S3_UPLOADS_BUCKET,
    //   Key: `uploads/${userId}/${fileName}`,
    //   ContentType: fileType,
    // });
    // const presignedUrl = await getSignedUrl(client, command, { expiresIn: 3600 });

    const elapsed = Date.now() - start;
    console.log(`[${ROUTE}] → 501 Not Implemented | ${elapsed}ms`);
    return NextResponse.json(
      {
        success: false,
        message: '🔴 AWS S3 not connected yet. Please implement presigned URL generation.',
        // When implemented, return:
        // presignedUrl: presignedUrl,
        // uploadId: generatedId,
      },
      { status: 501 },
    );

  } catch (error) {
    const elapsed = Date.now() - start;
    console.log(`[${ROUTE}] → 500 ERROR | ${elapsed}ms`);
    return NextResponse.json(
      {
        success: false,
        message: 'Upload initialization error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
