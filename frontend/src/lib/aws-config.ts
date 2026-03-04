import { Amplify } from 'aws-amplify';

// AWS Cognito Configuration
export const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: 'us-west-2_qhPzQQqYA',
      userPoolClientId: 'jsb637fsid2puaed9mnavgsio',
      signUpVerificationMethod: 'code' as const,
    }
  }
};

// Initialize Amplify
Amplify.configure(awsConfig);

export default awsConfig;