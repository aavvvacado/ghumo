/**
 * Authentication Repository Interface
 * Defines contracts following the Dependency Inversion Principle (DIP).
 * Allows switching seamlessly between Mock, Firebase Auth, or custom REST Auth backends.
 */

import { AuthCredentials, AuthResult, OAuthProvider, SignUpData, User } from '../models/auth';

export interface IAuthRepository {
  login(credentials: AuthCredentials): Promise<AuthResult>;
  signUp(data: SignUpData): Promise<AuthResult>;
  loginWithOAuth(provider: OAuthProvider): Promise<AuthResult>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  getIdToken(): Promise<string | null>;
  onAuthStateChanged(callback: (user: User | null) => void): () => void;
}
