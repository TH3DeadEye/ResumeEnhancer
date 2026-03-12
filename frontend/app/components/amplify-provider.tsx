'use client';
import { useEffect } from 'react';
import { Amplify } from 'aws-amplify';

const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
      userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
      signUpVerificationMethod: 'code' as const,
      loginWith: {
        email: true,
      },
    }
  },
  ssr: true,
};

export function AmplifyProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    Amplify.configure(awsConfig, { ssr: true });
  }, []);
  return <>{children}</>;
}
