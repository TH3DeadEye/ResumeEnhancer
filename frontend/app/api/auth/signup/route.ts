import { NextRequest, NextResponse } from 'next/server';

/**
 * SIGN UP API ROUTE
 *
 * 🔴 AWS Integration Required:
 * - Amazon Cognito user registration
 *
 * Steps to implement:
 * 1. npm install @aws-sdk/client-cognito-identity-provider
 * 2. Use SignUpCommand to create new user
 * 3. Handle email verification flow
 */

const ROUTE = 'POST /api/auth/signup';

export async function POST(request: NextRequest) {
  const start = Date.now();
  console.log(`[${ROUTE}] ← request received | ${new Date().toISOString()}`);

  try {
    const { name, email, password } = await request.json();

    // TODO: Implement Cognito sign up
    // const client = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });
    // const command = new SignUpCommand({
    //   ClientId: process.env.COGNITO_CLIENT_ID,
    //   Username: email,
    //   Password: password,
    //   UserAttributes: [
    //     { Name: 'name',  Value: name },
    //     { Name: 'email', Value: email },
    //   ],
    // });
    // await client.send(command);

    const elapsed = Date.now() - start;
    console.log(`[${ROUTE}] → 501 Not Implemented | ${elapsed}ms`);
    return NextResponse.json(
      {
        success: false,
        message: '🔴 AWS Cognito not connected yet. Please implement user registration.',
      },
      { status: 501 },
    );

  } catch (error) {
    const elapsed = Date.now() - start;
    console.log(`[${ROUTE}] → 500 ERROR | ${elapsed}ms`);
    return NextResponse.json(
      {
        success: false,
        message: 'Registration error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
