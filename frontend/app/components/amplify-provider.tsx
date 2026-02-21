'use client';

import { useEffect } from 'react';
import { Amplify } from 'aws-amplify';

// Amplify configuration with SSR support
const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: 'us-west-2_qhPzQQqYA',
      userPoolClientId: 'jsb637fsid2puaed9mnavgsio',
      signUpVerificationMethod: 'code' as const,
      loginWith: {
        email: true,
      },
    }
  },
  ssr: true, // Enable SSR support for Next.js
};

export function AmplifyProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Configure Amplify on client side
    Amplify.configure(awsConfig, { ssr: true });
    console.log('Amplify configured successfully');
  }, []);

  return <>{children}</>;
}
