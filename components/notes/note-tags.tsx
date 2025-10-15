// components/notes/note-tags.tsx
// 노트 태그 표시 및 생성 컴포넌트
// AI가 생성한 태그를 표시하고 새로운 태그를 생성할 수 있는 기능 제공
// 기존 태그 덮어쓰기 옵션과 로딩 상태 관리 포함

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import { generateTagsAction, updateTagsAction } from '@/lib/actions/ai';
import { getTagsAction } from '@/lib/actions/notes';
import { useAIStatus } from '@/hooks/use-ai-status';
import { AIStatusIndicator } from '@/components/notes/ai-status-indicator';
import { InlineEdit } from '@/components/ui/inline-edit';
import { RetryIndicator } from '@/components/ui/retry-indicator';
import { useRetry } from '@/hooks/use-retry';
import { backupBeforeAIProcessing, rollbackOnFailure } from '@/lib/utils/data-backup';

interface NoteTagsProps {
  noteId: string;
  existingTags?: string[];
  onTagsGenerated?: (tags: string[]) => void;
}

export function NoteTags({ noteId, existingTags = [], onTagsGenerated }: NoteTagsProps) {
  const [tags, setTags] = useState<string[]>(existingTags);
  const [showOverwriteDialog, setShowOverwriteDialog] = useState(false);
  const { addToast } = useToast();
  const aiStatus = useAIStatus();
  
  // 재시도 기능 설정
  const { retryState, executeWithRetry, manualRetry, resetRetry } = useRetry({
    maxRetries: 3,
    baseDelayMs: 1000,
    onRetry: (attempt) => {
      console.log(`태그 생성 재시도 중... (${attempt + 1}/3)`);
    },
    onMaxRetriesReached: () => {
      addToast({
        title: '태그 생성 실패',
        description: '여러 번 시도했지만 태그를 생성할 수 없습니다. 잠시 후 다시 시도해주세요.',
        variant: 'destructive',
      });
    }
  });

  const loadExistingTags = useCallback(async () => {
    try {
      const result = await getTagsAction(noteId);
      if (result.success && result.data) {
        setTags(result.data);
      }
    } catch (error) {
      console.error('Failed to load tags:', error);
    }
  }, [noteId]);

  // 컴포넌트 마운트 시 기존 태그 로드
  useEffect(() => {
    loadExistingTags();
  }, [loadExistingTags]);

  const handleGenerateTags = async () => {
    // 기존 태그가 있는 경우 덮어쓰기 확인
    if (tags.length > 0) {
      setShowOverwriteDialog(true);
      return;
    }

    await generateTags(false);
  };

  const generateTags = async (isRegeneration: boolean = false) => {
    const actionText = isRegeneration ? '재생성' : '생성';
    aiStatus.setLoading('tags', `AI가 태그를 ${actionText}하고 있습니다...`);
    setShowOverwriteDialog(false);

    // AI 처리 전 데이터 백업
    const currentBackupId = backupBeforeAIProcessing(noteId, null, tags);

    try {
      const result = await executeWithRetry(async () => {
        const response = await generateTagsAction(noteId);
        
        if (!response.success) {
          // 에러 타입에 따라 재시도 가능 여부 결정
          const retryable = response.retryable ?? true;
          const error = new Error(response.error || `태그 ${actionText} 중 오류가 발생했습니다.`);
          
          if (!retryable) {
            // 재시도 불가능한 에러는 즉시 throw
            throw error;
          }
          
          // 재시도 가능한 에러는 throw하여 재시도 로직에 위임
          throw error;
        }
        
        return response;
      }, true);

      setTags(result.data!.tags);
      onTagsGenerated?.(result.data!.tags);
      aiStatus.setSuccess('tags', `${result.data!.tags.length}개의 태그가 ${actionText}되었습니다.`);
      
      addToast({
        title: `태그 ${actionText} 완료`,
        description: `${result.data!.tags.length}개의 태그가 ${actionText}되었습니다.`,
        variant: 'default',
      });
      
    } catch (error) {
      console.error('Error generating tags:', error);
      aiStatus.setError('tags', error instanceof Error ? error.message : `태그 ${actionText} 중 오류가 발생했습니다.`);
      
      // 실패 시 데이터 롤백
      if (currentBackupId) {
        const rollbackSuccess = await rollbackOnFailure(
          currentBackupId,
          () => {}, // 요약은 태그 컴포넌트에서 관리하지 않음
          setTags
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
          title: `태그 ${actionText} 실패`,
          description: error instanceof Error ? error.message : `태그 ${actionText} 중 오류가 발생했습니다.`,
          variant: 'destructive',
        });
      }
    }
  };

  const handleOverwriteConfirm = () => {
    generateTags(true);
  };

  const handleOverwriteCancel = () => {
    setShowOverwriteDialog(false);
  };

  const handleUpdateTags = async (newTagsString: string) => {
    console.log('handleUpdateTags called with:', newTagsString);
    try {
      // 쉼표로 구분된 태그 문자열을 배열로 변환
      const newTags = newTagsString
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      console.log('Parsed tags:', newTags);
      const result = await updateTagsAction(noteId, newTags);
      console.log('updateTagsAction result:', result);
      
      if (result.success && result.data) {
        setTags(result.data.tags);
        onTagsGenerated?.(result.data.tags);
        
        addToast({
          title: '태그 수정 완료',
          description: '태그가 성공적으로 수정되었습니다.',
          variant: 'default',
        });
        return Promise.resolve(); // 성공 시 Promise 반환
      } else {
        console.error('updateTagsAction failed:', result.error);
        addToast({
          title: '태그 수정 실패',
          description: result.error || '태그 수정 중 오류가 발생했습니다.',
          variant: 'destructive',
        });
        return Promise.reject(new Error(result.error || '태그 수정 중 오류가 발생했습니다.'));
      }
    } catch (error) {
      console.error('handleUpdateTags error:', error);
      addToast({
        title: '태그 수정 실패',
        description: error instanceof Error ? error.message : '태그 수정 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
      return Promise.reject(error);
    }
  };

  return (
    <>
      <AIStatusIndicator
        status={aiStatus.status}
        processType={aiStatus.processType}
        message={aiStatus.message}
        error={aiStatus.error}
        onRetry={aiStatus.status === 'error' ? () => generateTags(tags.length > 0) : undefined}
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
          onManualRetry={() => manualRetry(() => generateTags(tags.length > 0))}
          onDismiss={resetRetry}
          className="mb-4"
        />
      )}
      
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">태그</CardTitle>
            {tags.length > 0 ? (
              <Button
                onClick={handleGenerateTags}
                disabled={aiStatus.status === 'loading'}
                variant="outline"
                size="sm"
                className="border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                {aiStatus.status === 'loading' && aiStatus.processType === 'tags' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                    재생성 중...
                  </>
                ) : (
                  '태그 재생성'
                )}
              </Button>
            ) : (
              <Button
                onClick={handleGenerateTags}
                disabled={aiStatus.status === 'loading'}
                variant="outline"
                size="sm"
                className="border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                {aiStatus.status === 'loading' && aiStatus.processType === 'tags' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                    생성 중...
                  </>
                ) : (
                  'AI 태그 생성'
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {tags.length > 0 ? (
            <InlineEdit
              value={tags.join(', ')}
              onSave={handleUpdateTags}
              placeholder="태그를 쉼표로 구분하여 입력하세요..."
              maxLength={500}
              multiline={false}
              className="w-full"
            >
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-purple-100 text-purple-800 hover:bg-purple-200"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </InlineEdit>
          ) : (
            <p className="text-gray-500 text-sm">
              아직 태그가 없습니다. AI 태그 생성 버튼을 클릭하여 관련 태그를 자동으로 생성해보세요.
            </p>
          )}
        </CardContent>
      </Card>

      {/* 덮어쓰기 확인 다이얼로그 */}
      <Dialog open={showOverwriteDialog} onOpenChange={setShowOverwriteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>태그 재생성</DialogTitle>
            <DialogDescription>
              이미 {tags.length}개의 태그가 있습니다. 새로운 태그로 재생성하시겠습니까?
              <br />
              <span className="text-sm text-gray-500 mt-1 block">
                기존 태그는 삭제되고 새로운 태그로 교체됩니다.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleOverwriteCancel}>
              취소
            </Button>
            <Button onClick={handleOverwriteConfirm} className="bg-purple-600 hover:bg-purple-700">
              재생성
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
