// hooks/use-retry.ts
// 재시도 로직을 관리하는 커스텀 훅
// API 호출 실패 시 자동 재시도 및 상태 관리 기능 제공

import { useState, useCallback } from 'react';

export interface RetryState {
  isRetrying: boolean;
  retryCount: number;
  maxRetries: number;
  lastError: string | null;
  canRetry: boolean;
}

export interface RetryOptions {
  maxRetries?: number;
  baseDelayMs?: number;
  onRetry?: (attempt: number) => void;
  onMaxRetriesReached?: () => void;
}

export function useRetry(options: RetryOptions = {}) {
  const {
    maxRetries = 3,
    baseDelayMs = 1000,
    onRetry,
    onMaxRetriesReached
  } = options;

  const [retryState, setRetryState] = useState<RetryState>({
    isRetrying: false,
    retryCount: 0,
    maxRetries,
    lastError: null,
    canRetry: true
  });

  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    retryable: boolean = true
  ): Promise<T> => {
    if (!retryable) {
      try {
        return await operation();
      } catch (error) {
        setRetryState(prev => ({
          ...prev,
          lastError: error instanceof Error ? error.message : '알 수 없는 오류',
          canRetry: false
        }));
        throw error;
      }
    }

    let lastError: unknown = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        setRetryState(prev => ({
          ...prev,
          isRetrying: attempt > 1,
          retryCount: attempt - 1,
          lastError: null
        }));

        if (attempt > 1 && onRetry) {
          onRetry(attempt - 1);
        }

        const result = await operation();
        
        // 성공 시 상태 초기화
        setRetryState(prev => ({
          ...prev,
          isRetrying: false,
          retryCount: 0,
          lastError: null,
          canRetry: true
        }));
        
        return result;
        
      } catch (error) {
        lastError = error;
        
        setRetryState(prev => ({
          ...prev,
          lastError: error instanceof Error ? error.message : '알 수 없는 오류',
          canRetry: attempt < maxRetries
        }));

        // 마지막 시도인 경우
        if (attempt === maxRetries) {
          setRetryState(prev => ({
            ...prev,
            isRetrying: false,
            canRetry: false
          }));
          
          if (onMaxRetriesReached) {
            onMaxRetriesReached();
          }
          
          throw error;
        }

        // 지수 백오프 + 랜덤 지터 적용
        const delay = baseDelayMs * Math.pow(2, attempt - 1) + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }, [maxRetries, baseDelayMs, onRetry, onMaxRetriesReached]);

  const resetRetry = useCallback(() => {
    setRetryState({
      isRetrying: false,
      retryCount: 0,
      maxRetries,
      lastError: null,
      canRetry: true
    });
  }, [maxRetries]);

  const manualRetry = useCallback(async <T>(
    operation: () => Promise<T>
  ): Promise<T> => {
    setRetryState(prev => ({
      ...prev,
      retryCount: 0,
      canRetry: true
    }));
    
    return executeWithRetry(operation, true);
  }, [executeWithRetry]);

  return {
    retryState,
    executeWithRetry,
    resetRetry,
    manualRetry
  };
}
