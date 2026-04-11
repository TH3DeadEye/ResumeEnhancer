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

    // Input length limits (RFC 5321 max email length is 254; name and message capped for safety)
    if (name.length > 100 || email.length > 254 || message.length > 2000) {
      const elapsed = Date.now() - start;
      console.log(`[${ROUTE}] → 400 Input too long | ${elapsed}ms`);
      return NextResponse.json(
        { success: false, message: 'Input too long' },
        { status: 400 },
      );
    }

    // Basic email format: must contain @ with at least one dot after it
    const atIdx = email.indexOf('@');
    if (atIdx < 1 || !email.slice(atIdx + 1).includes('.')) {
      const elapsed = Date.now() - start;
      console.log(`[${ROUTE}] → 400 Invalid email | ${elapsed}ms`);
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 },
      );
    }

    // TODO: Send email via Amazon SES
    // const sesClient = new SESClient({ region: process.env.AWS_REGION });
    // const command = new SendEmailCommand({ ... });
    // await sesClient.send(command);

    console.log('Contact form submission received');

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
        error: 'An error occurred. Please try again.',
      },
      { status: 500 },
    );
  }
}
