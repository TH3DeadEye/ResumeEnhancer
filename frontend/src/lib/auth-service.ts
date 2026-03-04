/**
 * AWS Cognito Authentication Service
 * 
 * Provides functions for user authentication using AWS Amplify
 * - Sign In / Sign Up
 * - Email verification
 * - Password reset
 * - Session management
 */

import { 
  signIn, 
  signUp, 
  signOut, 
  confirmSignUp,
  getCurrentUser,
  fetchAuthSession,
  resetPassword,
  confirmResetPassword,
  resendSignUpCode
} from 'aws-amplify/auth';

// ============================================================
// TYPE DEFINITIONS
// ============================================================

export interface SignUpParams {
  email: string;
  password: string;
  name: string;
}

export interface SignInParams {
  email: string;
  password: string;
}

export interface ConfirmSignUpParams {
  email: string;
  code: string;
}

export interface AuthResult<T = any> {
  success: boolean;
  result?: T;
  error?: string;
}

// ============================================================
// SIGN UP FUNCTIONS
// ============================================================

/**
 * Sign up a new user
 */
export async function handleSignUp({ email, password, name }: SignUpParams): Promise<AuthResult> {
  try {
    const result = await signUp({
      username: email,
      password,
      options: {
        userAttributes: {
          email,
          name,
        },
      },
    });
    return { success: true, result };
  } catch (error: any) {
    console.error('Sign up error:', error);
    return { success: false, error: error.message || 'Sign up failed' };
  }
}

/**
 * Confirm sign up with verification code
 */
export async function handleConfirmSignUp({ email, code }: ConfirmSignUpParams): Promise<AuthResult> {
  try {
    const result = await confirmSignUp({
      username: email,
      confirmationCode: code,
    });
    return { success: true, result };
  } catch (error: any) {
    console.error('Confirm sign up error:', error);
    return { success: false, error: error.message || 'Verification failed' };
  }
}

/**
 * Resend verification code
 */
export async function handleResendCode(email: string): Promise<AuthResult> {
  try {
    const result = await resendSignUpCode({ username: email });
    return { success: true, result };
  } catch (error: any) {
    console.error('Resend code error:', error);
    return { success: false, error: error.message || 'Failed to resend code' };
  }
}

// ============================================================
// SIGN IN / SIGN OUT FUNCTIONS
// ============================================================

/**
 * Sign in an existing user
 */
export async function handleSignIn({ email, password }: SignInParams): Promise<AuthResult> {
  try {
    const result = await signIn({
      username: email,
      password,
    });
    return { success: true, result };
  } catch (error: any) {
    console.error('Sign in error:', error);
    return { success: false, error: error.message || 'Sign in failed' };
  }
}

/**
 * Sign out the current user
 */
export async function handleSignOut(): Promise<AuthResult> {
  try {
    await signOut();
    return { success: true };
  } catch (error: any) {
    console.error('Sign out error:', error);
    return { success: false, error: error.message || 'Sign out failed' };
  }
}

// ============================================================
// SESSION / USER FUNCTIONS
// ============================================================

/**
 * Get the current authenticated user
 */
export async function getCurrentAuthUser(): Promise<AuthResult> {
  try {
    const user = await getCurrentUser();
    return { success: true, result: user };
  } catch (error: any) {
    // Not logged in is not necessarily an error
    return { success: false, error: 'Not authenticated' };
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    await getCurrentUser();
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the current session tokens (for API calls)
 */
export async function getAuthToken(): Promise<AuthResult<string>> {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    if (!token) {
      return { success: false, error: 'No token available' };
    }
    return { success: true, result: token };
  } catch (error: any) {
    console.error('Get token error:', error);
    return { success: false, error: error.message || 'Failed to get token' };
  }
}

/**
 * Get full auth session
 */
export async function getAuthSession(): Promise<AuthResult> {
  try {
    const session = await fetchAuthSession();
    return { success: true, result: session };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to get session' };
  }
}

/**
 * User info interface
 */
export interface UserInfo {
  username: string;
  userId: string;
  email?: string;
  name?: string;
}

/**
 * Get current user info with attributes
 */
export async function getUserInfo(): Promise<AuthResult<UserInfo>> {
  try {
    const user = await getCurrentUser();
    const session = await fetchAuthSession();
    
    // Extract name from ID token payload
    const idToken = session.tokens?.idToken;
    const payload = idToken?.payload;
    
    return { 
      success: true, 
      result: {
        username: user.username,
        userId: user.userId,
        email: payload?.email as string | undefined,
        name: payload?.name as string | undefined,
      }
    };
  } catch (error: any) {
    return { success: false, error: 'Not authenticated' };
  }
}

// ============================================================
// PASSWORD RESET FUNCTIONS
// ============================================================

/**
 * Request password reset - sends code to email
 */
export async function handleForgotPassword(email: string): Promise<AuthResult> {
  try {
    const result = await resetPassword({ username: email });
    return { success: true, result };
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return { success: false, error: error.message || 'Failed to send reset code' };
  }
}

/**
 * Confirm password reset with code and new password
 */
export async function handleConfirmResetPassword(
  email: string, 
  code: string, 
  newPassword: string
): Promise<AuthResult> {
  try {
    await confirmResetPassword({
      username: email,
      confirmationCode: code,
      newPassword,
    });
    return { success: true };
  } catch (error: any) {
    console.error('Reset password error:', error);
    return { success: false, error: error.message || 'Password reset failed' };
  }
}
