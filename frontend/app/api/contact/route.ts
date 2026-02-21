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
export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json();

    // Validate input
    if (!name || !email || !message) {
      return NextResponse.json({
        success: false,
        message: 'All fields are required'
      }, { status: 400 });
    }

    // TODO: Send email via Amazon SES
    // const sesClient = new SESClient({ region: process.env.AWS_REGION });
    // const command = new SendEmailCommand({
    //   Source: process.env.SES_SENDER_EMAIL,
    //   Destination: {
    //     ToAddresses: [process.env.CONTACT_EMAIL],
    //   },
    //   Message: {
    //     Subject: { Data: `Contact Form: ${name}` },
    //     Body: { Text: { Data: `From: ${email}\n\n${message}` } },
    //   },
    // });
    // await sesClient.send(command);

    // For now, just log it
    console.log('Contact form submission:', { name, email, message });

    return NextResponse.json({
      success: true,
      message: 'Message received! (Email integration pending)',
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to send message',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
