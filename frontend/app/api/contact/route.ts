import { NextRequest, NextResponse } from 'next/server';

/**
 * CONTACT FORM API ROUTE
 *
 * 🟡 Optional AWS Integration:
 * - Amazon SES for email sending
 * - DynamoDB for storing contact submissions
 *
 * Steps to implement:
 * 1. npm install @aws-sdk/client-ses
 * 2. Configure SES sender email
 * 3. Send email notification
 */

const ROUTE = 'POST /api/contact';

export async function POST(request: NextRequest) {
  const start = Date.now();
  console.log(`[${ROUTE}] ← request received | ${new Date().toISOString()}`);

  try {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      const elapsed = Date.now() - start;
      console.log(`[${ROUTE}] → 400 Bad Request | ${elapsed}ms`);
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 },
      );
    }

    // TODO: Send email via Amazon SES
    // const sesClient = new SESClient({ region: process.env.AWS_REGION });
    // const command = new SendEmailCommand({ ... });
    // await sesClient.send(command);

    console.log('Contact form submission:', { name, email, message });

    const elapsed = Date.now() - start;
    console.log(`[${ROUTE}] → 200 OK | ${elapsed}ms`);
    return NextResponse.json({
      success: true,
      message: 'Message received! (Email integration pending)',
    });

  } catch (error) {
    const elapsed = Date.now() - start;
    console.log(`[${ROUTE}] → 500 ERROR | ${elapsed}ms`);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to send message',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
