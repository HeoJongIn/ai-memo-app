// components/ui/error-recovery-guide.tsx
// 에러 복구 가이드 컴포넌트
// 사용자에게 에러 상황에 대한 대안과 해결 방법을 제공

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertCircle, 
  RefreshCw, 
  Edit3, 
  FileText, 
  Wifi, 
  Clock,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { AIErrorType } from '@/lib/types/ai-errors';

interface ErrorRecoveryGuideProps {
  errorType: AIErrorType;
  errorMessage: string;
  onRetry?: () => void;
  onManualEdit?: () => void;
  onContactSupport?: () => void;
  className?: string;
}

interface RecoveryOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: () => void;
  variant: 'default' | 'outline' | 'secondary';
  disabled?: boolean;
}

export function ErrorRecoveryGuide({
  errorType,
  errorMessage,
  onRetry,
  onManualEdit,
  onContactSupport,
  className = ''
}: ErrorRecoveryGuideProps) {
  
  const getErrorInfo = (type: AIErrorType) => {
    switch (type) {
      case AIErrorType.NETWORK_ERROR:
        return {
          title: '네트워크 연결 문제',
          description: '인터넷 연결에 문제가 있습니다.',
          icon: <Wifi className="h-5 w-5 text-orange-500" />,
          suggestions: [
            '인터넷 연결 상태를 확인해주세요',
            'Wi-Fi 연결을 다시 시도해주세요',
            '모바일 데이터로 전환해보세요'
          ]
        };
      
      case AIErrorType.TOKEN_LIMIT_EXCEEDED:
        return {
          title: '텍스트가 너무 깁니다',
          description: '노트 내용이 AI 처리 한계를 초과했습니다.',
          icon: <FileText className="h-5 w-5 text-red-500" />,
          suggestions: [
            '노트 내용을 여러 개로 나누어주세요',
            '불필요한 내용을 삭제해주세요',
            '핵심 내용만 요약해서 작성해주세요'
          ]
        };
      
      case AIErrorType.API_ERROR:
        return {
          title: 'AI 서비스 일시 중단',
          description: 'AI 서비스에 일시적인 문제가 발생했습니다.',
          icon: <AlertCircle className="h-5 w-5 text-yellow-500" />,
          suggestions: [
            '잠시 후 다시 시도해주세요',
            '서비스 상태를 확인해주세요',
            '수동으로 요약/태그를 작성해주세요'
          ]
        };
      
      case AIErrorType.PARSING_ERROR:
        return {
          title: 'AI 응답 처리 오류',
          description: 'AI가 생성한 결과를 처리하는 중 문제가 발생했습니다.',
          icon: <RefreshCw className="h-5 w-5 text-blue-500" />,
          suggestions: [
            '다시 시도해주세요',
            '수동으로 요약/태그를 작성해주세요',
            '노트 내용을 간단히 수정해보세요'
          ]
        };
      
      case AIErrorType.AUTHENTICATION_ERROR:
        return {
          title: '로그인이 필요합니다',
          description: '서비스를 이용하려면 로그인이 필요합니다.',
          icon: <AlertCircle className="h-5 w-5 text-red-500" />,
          suggestions: [
            '로그인 페이지로 이동해주세요',
            '계정 정보를 확인해주세요',
            '비밀번호를 재설정해주세요'
          ]
        };
      
      case AIErrorType.AUTHORIZATION_ERROR:
        return {
          title: '접근 권한이 없습니다',
          description: '이 노트에 접근할 권한이 없습니다.',
          icon: <AlertCircle className="h-5 w-5 text-red-500" />,
          suggestions: [
            '노트 소유자를 확인해주세요',
            '로그인 상태를 확인해주세요',
            '관리자에게 문의해주세요'
          ]
        };
      
      default:
        return {
          title: '예상치 못한 오류',
          description: '알 수 없는 오류가 발생했습니다.',
          icon: <AlertCircle className="h-5 w-5 text-gray-500" />,
          suggestions: [
            '페이지를 새로고침해주세요',
            '잠시 후 다시 시도해주세요',
            '문제가 지속되면 관리자에게 문의해주세요'
          ]
        };
    }
  };

  const errorInfo = getErrorInfo(errorType);

  const getRecoveryOptions = (): RecoveryOption[] => {
    const options: RecoveryOption[] = [];

    // 재시도 옵션
    if (onRetry && (errorType === AIErrorType.NETWORK_ERROR || 
                   errorType === AIErrorType.API_ERROR || 
                   errorType === AIErrorType.PARSING_ERROR)) {
      options.push({
        id: 'retry',
        title: '다시 시도',
        description: 'AI 처리를 다시 시도합니다',
        icon: <RefreshCw className="h-4 w-4" />,
        action: onRetry,
        variant: 'default'
      });
    }

    // 수동 편집 옵션
    if (onManualEdit && (errorType === AIErrorType.TOKEN_LIMIT_EXCEEDED || 
                         errorType === AIErrorType.API_ERROR || 
                         errorType === AIErrorType.PARSING_ERROR)) {
      options.push({
        id: 'manual-edit',
        title: '수동으로 작성',
        description: '직접 요약이나 태그를 작성합니다',
        icon: <Edit3 className="h-4 w-4" />,
        action: onManualEdit,
        variant: 'outline'
      });
    }

    // 지원 문의 옵션
    if (onContactSupport) {
      options.push({
        id: 'contact-support',
        title: '지원 문의',
        description: '문제가 지속되면 관리자에게 문의하세요',
        icon: <HelpCircle className="h-4 w-4" />,
        action: onContactSupport,
        variant: 'secondary'
      });
    }

    return options;
  };

  const recoveryOptions = getRecoveryOptions();

  return (
    <Card className={`border-l-4 border-l-orange-500 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          {errorInfo.icon}
          <div>
            <CardTitle className="text-lg text-gray-900">
              {errorInfo.title}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {errorInfo.description}
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* 에러 메시지 */}
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-700">오류 상세</p>
              <p className="text-sm text-gray-600 mt-1">{errorMessage}</p>
            </div>
          </div>
        </div>

        {/* 권장사항 */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">권장 해결 방법</h4>
          <ul className="space-y-1">
            {errorInfo.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                {suggestion}
              </li>
            ))}
          </ul>
        </div>

        {/* 복구 옵션 */}
        {recoveryOptions.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">빠른 해결</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {recoveryOptions.map((option) => (
                <Button
                  key={option.id}
                  variant={option.variant}
                  size="sm"
                  onClick={option.action}
                  disabled={option.disabled}
                  className="h-auto p-3 justify-start"
                >
                  <div className="flex items-center gap-2">
                    {option.icon}
                    <div className="text-left">
                      <div className="font-medium">{option.title}</div>
                      <div className="text-xs opacity-75">{option.description}</div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* 추가 도움말 */}
        <div className="pt-2 border-t border-gray-200">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            <span>문제가 지속되면 잠시 후 다시 시도하거나 관리자에게 문의해주세요.</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// 간단한 에러 상태 표시 컴포넌트
interface ErrorStatusProps {
  errorType: AIErrorType;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorStatus({ errorType, message, onRetry, className = '' }: ErrorStatusProps) {
  const getStatusColor = (type: AIErrorType) => {
    switch (type) {
      case AIErrorType.NETWORK_ERROR:
        return 'border-orange-200 bg-orange-50 text-orange-800';
      case AIErrorType.TOKEN_LIMIT_EXCEEDED:
        return 'border-red-200 bg-red-50 text-red-800';
      case AIErrorType.API_ERROR:
        return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      default:
        return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

  return (
    <div className={`p-3 border rounded-md ${getStatusColor(errorType)} ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm font-medium">{message}</span>
        </div>
        {onRetry && (
          <Button
            size="sm"
            variant="outline"
            onClick={onRetry}
            className="h-7 px-2 text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            재시도
          </Button>
        )}
      </div>
    </div>
  );
}
