/**
 * Auth Context & State Management
 * Clean state provider with dependency injection for IAuthRepository.
 */

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { AuthCredentials, OAuthProvider, SignUpData, User } from '@/domain/models/auth';
import { IAuthRepository } from '@/domain/repositories/authRepository.interface';
import { defaultAuthRepository } from '@/data/repositories/authRepository';
import { logger } from '@/utils/logger';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  authAction: 'login' | 'logout' | 'signup' | 'oauth' | null;
  loadingMessage: string | null;
  error: string | null;
  login: (credentials: AuthCredentials) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  loginWithOAuth: (provider: OAuthProvider) => Promise<void>;
  skipAuth: () => void;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
  repository?: IAuthRepository;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  repository = defaultAuthRepository,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authAction, setAuthAction] = useState<'login' | 'logout' | 'signup' | 'oauth' | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    logger.auth('Initializing Auth Provider listener...');
    // Subscribe to repository auth changes
    const unsubscribe = repository.onAuthStateChanged((activeUser) => {
      if (!isMounted) return;
      setUser(activeUser);
      if (activeUser) {
        setIsGuest(false);
        logger.auth(`Auth State Updated: Authenticated as ${activeUser.email} (ID: ${activeUser.id})`);
      } else {
        logger.auth('Auth State Updated: Unauthenticated / Logged Out');
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [repository]);

  const clearError = () => setError(null);

  const login = async (credentials: AuthCredentials) => {
    logger.auth(`Attempting email login for: ${credentials.email}`);
    setIsLoading(true);
    setAuthAction('login');
    setLoadingMessage('Logging you in securely...');
    setError(null);
    try {
      await repository.login(credentials);
      setIsGuest(false);
      logger.auth('Email login successful');
    } catch (err: any) {
      logger.error('AUTH', 'Email login failed', err?.message);
      setError(err?.message || 'Login failed. Please check your credentials.');
      throw err;
    } finally {
      setIsLoading(false);
      setAuthAction(null);
      setLoadingMessage(null);
    }
  };

  const signUp = async (data: SignUpData) => {
    logger.auth(`Attempting sign up for: ${data.email}`);
    setIsLoading(true);
    setAuthAction('signup');
    setLoadingMessage('Creating your Ghumo account...');
    setError(null);
    try {
      await repository.signUp(data);
      setIsGuest(false);
      logger.auth('Sign up successful');
    } catch (err: any) {
      logger.error('AUTH', 'Sign up failed', err?.message);
      setError(err?.message || 'Sign up failed. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
      setAuthAction(null);
      setLoadingMessage(null);
    }
  };

  const loginWithOAuth = async (provider: OAuthProvider) => {
    logger.auth(`Initiating OAuth login with provider: ${provider}`);
    setIsLoading(true);
    setAuthAction('oauth');
    const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);
    setLoadingMessage(`Authenticating with ${providerName}...`);
    setError(null);
    try {
      await repository.loginWithOAuth(provider);
      setIsGuest(false);
      logger.auth(`OAuth login with ${providerName} completed successfully`);
    } catch (err: any) {
      logger.error('AUTH', `OAuth login with ${providerName} failed`, err?.message);
      setError(err?.message || `OAuth login with ${providerName} failed.`);
      throw err;
    } finally {
      setIsLoading(false);
      setAuthAction(null);
      setLoadingMessage(null);
    }
  };

  const skipAuth = () => {
    logger.auth('User selected "Skip login" -> Entering Guest Mode');
    setError(null);
    setIsGuest(true);
  };

  const logout = async () => {
    logger.auth('Logging out user...');
    setIsLoading(true);
    setAuthAction('logout');
    setLoadingMessage('Logging out...');
    setError(null);
    try {
      await repository.logout();
      setIsGuest(false);
      logger.auth('User logged out successfully');
    } catch (err: any) {
      logger.error('AUTH', 'Logout encountered error', err?.message);
      setError(err?.message || 'Logout failed.');
    } finally {
      setIsLoading(false);
      setAuthAction(null);
      setLoadingMessage(null);
    }
  };

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isGuest,
      isLoading,
      authAction,
      loadingMessage,
      error,
      login,
      signUp,
      loginWithOAuth,
      skipAuth,
      logout,
      clearError,
    }),
    [user, isGuest, isLoading, authAction, loadingMessage, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

