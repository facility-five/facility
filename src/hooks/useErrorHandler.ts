import { useState, useCallback } from 'react';
import { showRadixError } from '@/utils/toast';

export const useErrorHandler = () => {
  const [shownErrors, setShownErrors] = useState<Set<string>>(new Set());

  const showError = useCallback((message: string, errorKey?: string) => {
    const key = errorKey || message;
    
    if (!shownErrors.has(key)) {
      showRadixError(message);
      setShownErrors(prev => new Set(prev).add(key));
    }
  }, [shownErrors]);

  const resetErrors = useCallback(() => {
    setShownErrors(new Set());
  }, []);

  const resetError = useCallback((errorKey: string) => {
    setShownErrors(prev => {
      const newSet = new Set(prev);
      newSet.delete(errorKey);
      return newSet;
    });
  }, []);

  return { showError, resetErrors, resetError };
};