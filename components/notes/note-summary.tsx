// components/notes/note-summary.tsx
// 노트 요약 표시 컴포넌트
// AI가 생성한 노트 요약을 불릿 포인트 형태로 표시
// 요약 생성 버튼과 로딩 상태 관리 포함

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { generateSummaryAction, updateSummaryAction } from '@/lib/actions/ai';
import { AIErrorType } from '@/lib/types/ai-errors';
import { useAIStatus } from '@/hooks/use-ai-status';
import { AIStatusIndicator } from '@/components/notes/ai-status-indicator';
import { InlineEdit } from '@/components/ui/inline-edit';
import { RetryIndicator } from '@/components/ui/retry-indicator';
import { useRetry } from '@/hooks/use-retry';
import { backupBeforeAIProcessing, rollbackOnFailure } from '@/lib/utils/data-backup';
import { ErrorRecoveryGuide } from '@/components/ui/error-recovery-guide';
import type { Summary } from '@/lib/types/database';

interface NoteSummaryProps {
  noteId: string;
  existingSummary?: Summary | null;
  onSummaryGenerated?: (summary: string) => void;
}

export function NoteSummary({ noteId, existingSummary, onSummaryGenerated }: NoteSummaryProps) {
  const [summary, setSummary] = useState<string | null>(existingSummary?.content || null);
  const [lastError, setLastError] = useState<{ type: AIErrorType; message: string } | null>(null);
  const { addToast } = useToast();
  const aiStatus = useAIStatus();
  
  // 재시도 기능 설정
  const { retryState, executeWithRetry, manualRetry, resetRetry } = useRetry({
    maxRetries: 3,
    baseDelayMs: 1000,
    onRetry: (attempt) => {
      console.log(`요약 생성 재시도 중... (${attempt + 1}/3)`);
    },
    onMaxRetriesReached: () => {
      addToast({
        title: '요약 생성 실패',
        description: '여러 번 시도했지만 요약을 생성할 수 없습니다. 잠시 후 다시 시도해주세요.',
        variant: 'destructive',
      });
    }
  });

  const handleGenerateSummary = async (isRegeneration: boolean = false) => {
    const actionText = isRegeneration ? '재생성' : '생성';
    aiStatus.setLoading('summary', `AI가 요약을 ${actionText}하고 있습니다...`);
    
    // AI 처리 전 데이터 백업
    const currentBackupId = backupBeforeAIProcessing(noteId, summary, []);
    
    try {
      const result = await executeWithRetry(async () => {
        const response = await generateSummaryAction(noteId);
        
        if (!response.success) {
          // 에러 타입에 따라 재시도 가능 여부 결정
          const retryable = response.retryable ?? true;
          const error = new Error(response.error || `요약 ${actionText} 중 오류가 발생했습니다.`);
          
          if (!retryable) {
            // 재시도 불가능한 에러는 즉시 throw
            throw error;
          }
          
          // 재시도 가능한 에러는 throw하여 재시도 로직에 위임
          throw error;
        }
        
        return response;
      }, true);

      setSummary(result.data!.summary);
      onSummaryGenerated?.(result.data!.summary);
      aiStatus.setSuccess('summary', `요약이 성공적으로 ${actionText}되었습니다.`);
      
      addToast({
        title: `요약 ${actionText} 완료`,
        description: `AI가 노트 요약을 성공적으로 ${actionText}했습니다.`,
        variant: 'default',
      });
      
    } catch (error) {
      console.error('Error generating summary:', error);
      const errorMessage = error instanceof Error ? error.message : `요약 ${actionText} 중 오류가 발생했습니다.`;
      aiStatus.setError('summary', errorMessage);
      
      // 에러 상태 저장
      setLastError({
        type: AIErrorType.UNKNOWN_ERROR,
        message: errorMessage
      });
      
      // 실패 시 데이터 롤백
      if (currentBackupId) {
        const rollbackSuccess = await rollbackOnFailure(
          currentBackupId,
          setSummary,
          () => {} // 태그는 요약 컴포넌트에서 관리하지 않음
        );
        
        if (rollbackSuccess) {
          addToast({
            title: '데이터 복원 완료',
            description: '오류 발생으로 인해 원본 데이터로 복원되었습니다.',
            variant: 'default',
          });
        }
        
      }
      
      // 에러 토스트는 useRetry의 onMaxRetriesReached에서 처리
      if (!retryState.canRetry) {
        addToast({
          title: `요약 ${actionText} 실패`,
          description: errorMessage,
          variant: 'destructive',
        });
      }
    }
  };

  const handleUpdateSummary = async (newContent: string) => {
    console.log('handleUpdateSummary called with:', newContent);
    try {
      const result = await updateSummaryAction(noteId, newContent);
      console.log('updateSummaryAction result:', result);
      
      if (result.success && result.data) {
        setSummary(result.data.summary);
        onSummaryGenerated?.(result.data.summary);
        
        addToast({
          title: '요약 수정 완료',
          description: '요약이 성공적으로 수정되었습니다.',
          variant: 'default',
        });
        return Promise.resolve(); // 성공 시 Promise 반환
      } else {
        console.error('updateSummaryAction failed:', result.error);
        addToast({
          title: '요약 수정 실패',
          description: result.error || '요약 수정 중 오류가 발생했습니다.',
          variant: 'destructive',
        });
        return Promise.reject(new Error(result.error || '요약 수정 중 오류가 발생했습니다.'));
      }
    } catch (error) {
      console.error('handleUpdateSummary error:', error);
      addToast({
        title: '요약 수정 실패',
        description: error instanceof Error ? error.message : '요약 수정 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
      return Promise.reject(error);
    }
  };

  // 요약을 불릿 포인트로 파싱
  const parseSummaryToBullets = (summaryText: string): string[] => {
    return summaryText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        // 불릿 포인트 기호 제거 (•, -, *, 숫자 등)
        return line.replace(/^[•\-\*\d+\.\s]+/, '').trim();
      })
      .filter(line => line.length > 0);
  };

  const summaryBullets = summary ? parseSummaryToBullets(summary) : [];

  return (
    <>
      <AIStatusIndicator
        status={aiStatus.status}
        processType={aiStatus.processType}
        message={aiStatus.message}
        error={aiStatus.error}
        onRetry={aiStatus.status === 'error' ? () => handleGenerateSummary(!!summary) : undefined}
        onClearError={aiStatus.clearError}
      />
      
      {/* 재시도 상태 표시 */}
      {(retryState.isRetrying || retryState.lastError) && (
        <RetryIndicator
          isRetrying={retryState.isRetrying}
          retryCount={retryState.retryCount}
          maxRetries={retryState.maxRetries}
          lastError={retryState.lastError}
          canRetry={retryState.canRetry}
          onManualRetry={() => manualRetry(() => handleGenerateSummary(!!summary))}
          onDismiss={resetRetry}
          className="mb-4"
        />
      )}
      
      {/* 에러 복구 가이드 */}
      {lastError && !retryState.isRetrying && (
        <ErrorRecoveryGuide
          errorType={lastError.type}
          errorMessage={lastError.message}
          onRetry={() => {
            setLastError(null);
            handleGenerateSummary(!!summary);
          }}
          onManualEdit={() => {
            setLastError(null);
            // 수동 편집 모드 활성화 (InlineEdit 컴포넌트에서 처리)
          }}
          className="mb-4"
        />
      )}
      
      <Card className="w-full mb-6">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              AI 요약
            </CardTitle>
            {!summary && (
              <Button
                onClick={() => handleGenerateSummary(false)}
                disabled={aiStatus.status === 'loading'}
                variant="outline"
                size="sm"
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                {aiStatus.status === 'loading' && aiStatus.processType === 'summary' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    생성 중...
                  </>
                ) : (
                  'AI 요약 생성'
                )}
              </Button>
            )}
          </div>
        </CardHeader>
      
      {summary && (
        <CardContent className="pt-0">
          <InlineEdit
            value={summary}
            onSave={handleUpdateSummary}
            placeholder="요약을 편집하세요..."
            maxLength={2000}
            multiline={true}
            className="w-full"
          >
            <div className="space-y-2">
              {summaryBullets.map((bullet, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {bullet}
                  </p>
                </div>
              ))}
            </div>
          </InlineEdit>
          
          {existingSummary && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  생성일: {new Intl.DateTimeFormat('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  }).format(new Date(existingSummary.createdAt))}
                </p>
                <Button
                  onClick={() => handleGenerateSummary(true)}
                  disabled={aiStatus.status === 'loading'}
                  variant="outline"
                  size="sm"
                  className="text-blue-700 hover:bg-blue-50"
                >
                  {aiStatus.status === 'loading' && aiStatus.processType === 'summary' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      재생성 중...
                    </>
                  ) : (
                    '요약 재생성'
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      )}
      
      {!summary && aiStatus.status !== 'loading' && (
        <CardContent className="pt-0">
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            AI 요약이 아직 생성되지 않았습니다. 버튼을 클릭하여 요약을 생성해보세요.
          </p>
        </CardContent>
      )}
    </Card>
    </>
  );
}

