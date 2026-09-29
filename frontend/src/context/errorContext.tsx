import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

export type ErrorSeverity = 'info' | 'warning' | 'error';

export interface AppError {
  id: string;
  title: string;
  message: string;
  severity?: ErrorSeverity;
  timestamp: number;
}

interface ErrorContextType {
  activeError: AppError | null;
  showError: (title: string, message: string, severity?: ErrorSeverity) => void;
  clearError: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const ErrorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeError, setActiveError] = useState<AppError | null>(null);

  const clearError = useCallback(() => {
    setActiveError(null);
  }, []);

  const showError = useCallback((title: string, message: string, severity: ErrorSeverity = 'error') => {
    setActiveError({
      id: `err_${Date.now()}`,
      title,
      message,
      severity,
      timestamp: Date.now(),
    });
  }, []);

  const value = useMemo(
    () => ({
      activeError,
      showError,
      clearError,
    }),
    [activeError, showError, clearError]
  );

  return <ErrorContext.Provider value={value}>{children}</ErrorContext.Provider>;
};

export const useError = (): ErrorContextType => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};
