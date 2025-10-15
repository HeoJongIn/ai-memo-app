// components/notes/ai-status-indicator.tsx
// AI 처리 상태 표시 컴포넌트
// 로딩, 완료, 에러 상태를 시각적으로 표시
// 애니메이션 효과와 재시도 기능 포함

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import type { AIStatus, AIProcessType } from '@/hooks/use-ai-status';

interface AIStatusIndicatorProps {
  status: AIStatus;
  processType: AIProcessType | null;
  message: string;
  error?: string;
  onRetry?: () => void;
  onClearError?: () => void;
}

export function AIStatusIndicator({
  status,
  processType,
  message,
  error,
  onRetry,
  onClearError,
}: AIStatusIndicatorProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { addToast } = useToast();

  // 상태 변경 시 애니메이션 효과
  useEffect(() => {
    if (status !== 'idle') {
      setIsVisible(true);
      
      if (status === 'success') {
        setShowSuccess(true);
        // 성공 상태는 3초 후 자동으로 사라짐
        const timer = setTimeout(() => {
          setIsVisible(false);
          setShowSuccess(false);
        }, 3000);
        
        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
      setShowSuccess(false);
    }
  }, [status]);

  // 에러 발생 시 토스트 메시지 표시
  useEffect(() => {
    if (status === 'error' && error) {
      addToast({
        title: 'AI 처리 실패',
        description: error,
        variant: 'destructive',
      });
    }
  }, [status, error, addToast]);

  if (!isVisible) {
    return null;
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent" role="status" aria-label="로딩 중"></div>
        );
      case 'success':
        return (
          <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
            <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="h-5 w-5 rounded-full bg-red-500 flex items-center justify-center">
            <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'border-blue-200 bg-blue-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getProcessTypeLabel = () => {
    switch (processType) {
      case 'summary':
        return '요약';
      case 'tags':
        return '태그';
      default:
        return 'AI';
    }
  };

  return (
    <Card className={`mb-4 transition-all duration-300 ease-in-out ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
    } ${getStatusColor()}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`transition-transform duration-200 ${
              status === 'loading' ? 'animate-pulse' : ''
            }`}>
              {getStatusIcon()}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {getProcessTypeLabel()}
              </Badge>
              <span className="text-sm font-medium text-gray-700">
                {message}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {status === 'error' && onRetry && (
              <Button
                onClick={onRetry}
                variant="outline"
                size="sm"
                className="text-red-700 border-red-300 hover:bg-red-50"
              >
                재시도
              </Button>
            )}
            {status === 'error' && onClearError && (
              <Button
                onClick={onClearError}
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700"
              >
                닫기
              </Button>
            )}
          </div>
        </div>
        
        {status === 'error' && error && (
          <div className="mt-3 p-3 bg-red-100 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        
        {status === 'success' && showSuccess && (
          <div className={`mt-3 transition-all duration-500 ${
            showSuccess ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0'
          }`}>
            <div className="flex items-center gap-2 text-sm text-green-700">
              <div className="animate-bounce">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>처리가 완료되었습니다!</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
