// hooks/use-ai-status.ts
// AI 처리 상태 관리 훅
// 요약과 태그 생성 과정의 상태를 통합 관리
// 로딩, 완료, 에러 상태와 전환 로직 포함

'use client';

import { useState, useCallback } from 'react';

export type AIProcessType = 'summary' | 'tags';

export type AIStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AIStatusState {
  status: AIStatus;
  processType: AIProcessType | null;
  message: string;
  error?: string;
  timestamp?: Date;
}

export interface AIStatusActions {
  setLoading: (processType: AIProcessType, message?: string) => void;
  setSuccess: (processType: AIProcessType, message?: string) => void;
  setError: (processType: AIProcessType, error: string, message?: string) => void;
  reset: () => void;
  clearError: () => void;
}

export function useAIStatus(): AIStatusState & AIStatusActions {
  const [state, setState] = useState<AIStatusState>({
    status: 'idle',
    processType: null,
    message: '',
  });

  const setLoading = useCallback((processType: AIProcessType, message?: string) => {
    setState({
      status: 'loading',
      processType,
      message: message || `${processType === 'summary' ? '요약' : '태그'} 생성 중...`,
      timestamp: new Date(),
    });
  }, []);

  const setSuccess = useCallback((processType: AIProcessType, message?: string) => {
    setState({
      status: 'success',
      processType,
      message: message || `${processType === 'summary' ? '요약' : '태그'} 생성 완료`,
      timestamp: new Date(),
    });
  }, []);

  const setError = useCallback((processType: AIProcessType, error: string, message?: string) => {
    setState({
      status: 'error',
      processType,
      message: message || `${processType === 'summary' ? '요약' : '태그'} 생성 실패`,
      error,
      timestamp: new Date(),
    });
  }, []);

  const reset = useCallback(() => {
    setState({
      status: 'idle',
      processType: null,
      message: '',
    });
  }, []);

  const clearError = useCallback(() => {
    if (state.status === 'error') {
      setState(prev => ({
        ...prev,
        status: 'idle',
        error: undefined,
      }));
    }
  }, [state.status]);

  return {
    ...state,
    setLoading,
    setSuccess,
    setError,
    reset,
    clearError,
  };
}
