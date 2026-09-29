/**
 * Domain Models for Authentication
 * Follows Clean Architecture - Pure domain definitions independent of external frameworks.
 */

export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  isAnonymous?: boolean;
  createdAt: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface SignUpData extends AuthCredentials {
  newsletterConsent?: boolean;
}

export type OAuthProvider = 'google' | 'apple' | 'binance' | 'wallet';

export interface AuthResult {
  user: User;
  token: string;
}
