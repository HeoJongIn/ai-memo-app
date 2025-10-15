// components/ui/retry-indicator.tsx
// 재시도 상태를 표시하는 UI 컴포넌트
// API 호출 실패 시 재시도 진행 상황과 사용자 액션을 제공

import React from 'react';
import { Button } from './button';
import { RefreshCw, AlertCircle } from 'lucide-react';

interface RetryIndicatorProps {
  isRetrying: boolean;
  retryCount: number;
  maxRetries: number;
  lastError: string | null;
  canRetry: boolean;
  onManualRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function RetryIndicator({
  isRetrying,
  retryCount,
  maxRetries,
  lastError,
  canRetry,
  onManualRetry,
  onDismiss,
  className = ''
}: RetryIndicatorProps) {
  // 재시도 중인 경우
  if (isRetrying) {
    return (
      <div className={`flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md ${className}`}>
        <RefreshCw className="h-4 w-4 text-yellow-600 animate-spin" />
        <div className="flex-1">
          <p className="text-sm font-medium text-yellow-800">
            재시도 중... ({retryCount + 1}/{maxRetries})
          </p>
          <p className="text-xs text-yellow-600">
            잠시만 기다려주세요. 자동으로 다시 시도하고 있습니다.
          </p>
        </div>
      </div>
    );
  }

  // 재시도 가능한 에러인 경우
  if (lastError && canRetry) {
    return (
      <div className={`flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md ${className}`}>
        <AlertCircle className="h-4 w-4 text-red-600" />
        <div className="flex-1">
          <p className="text-sm font-medium text-red-800">
            오류가 발생했습니다
          </p>
          <p className="text-xs text-red-600">
            {lastError}
          </p>
        </div>
        <div className="flex gap-1">
          {onManualRetry && (
            <Button
              size="sm"
              variant="outline"
              onClick={onManualRetry}
              className="h-8 px-2 text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              다시 시도
            </Button>
          )}
          {onDismiss && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onDismiss}
              className="h-8 px-2 text-xs text-red-600 hover:text-red-700"
            >
              닫기
            </Button>
          )}
        </div>
      </div>
    );
  }

  // 재시도 불가능한 에러인 경우
  if (lastError && !canRetry) {
    return (
      <div className={`flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md ${className}`}>
        <AlertCircle className="h-4 w-4 text-red-600" />
        <div className="flex-1">
          <p className="text-sm font-medium text-red-800">
            재시도 한계에 도달했습니다
          </p>
          <p className="text-xs text-red-600">
            {lastError}
          </p>
          <p className="text-xs text-red-500 mt-1">
            잠시 후 다시 시도하거나 관리자에게 문의해주세요.
          </p>
        </div>
        {onDismiss && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onDismiss}
            className="h-8 px-2 text-xs text-red-600 hover:text-red-700"
          >
            닫기
          </Button>
        )}
      </div>
    );
  }

  // 성공 상태 (선택적)
  return null;
}

// 간단한 재시도 버튼 컴포넌트
interface RetryButtonProps {
  onRetry: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function RetryButton({
  onRetry,
  isLoading = false,
  disabled = false,
  className = ''
}: RetryButtonProps) {
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={onRetry}
      disabled={disabled || isLoading}
      className={`h-8 px-3 text-xs ${className}`}
    >
      {isLoading ? (
        <>
          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
          재시도 중...
        </>
      ) : (
        <>
          <RefreshCw className="h-3 w-3 mr-1" />
          다시 시도
        </>
      )}
    </Button>
  );
}
