// components/notes/draft-card.tsx
// 임시 저장된 노트 카드 컴포넌트
// 임시 저장된 노트를 표시하는 카드 컴포넌트
// 정식 노트와 구분되는 디자인과 기능 제공

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { convertDraftToNoteAction, deleteDraftAction } from '@/lib/actions/notes';
import { DraftStatusIndicator } from './draft-status-indicator';
import { FileText, Edit, Trash2, CheckCircle, Clock } from 'lucide-react';
import type { DraftNote } from '@/lib/types/database';

interface DraftCardProps {
  draft: DraftNote;
  onConvert?: (noteId: string) => void;
  onDelete?: (draftId: string) => void;
  className?: string;
}

export function DraftCard({ draft, onConvert, onDelete, className = '' }: DraftCardProps) {
  const [isConverting, setIsConverting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { addToast } = useToast();

  const handleConvertToNote = async () => {
    setIsConverting(true);
    
    try {
      const result = await convertDraftToNoteAction(draft.id);
      
      if (result.success) {
        addToast({
          title: '성공',
          description: '정식 노트로 변환되었습니다.',
          variant: 'default',
        });
        
        onConvert?.(result.data.id);
      } else {
        addToast({
          title: '오류',
          description: result.error || '노트 변환 중 오류가 발생했습니다.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error converting draft:', error);
      addToast({
        title: '오류',
        description: '예상치 못한 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsConverting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      const result = await deleteDraftAction(draft.id);
      
      if (result.success) {
        addToast({
          title: '성공',
          description: '임시 노트가 삭제되었습니다.',
          variant: 'default',
        });
        
        onDelete?.(draft.id);
      } else {
        addToast({
          title: '오류',
          description: result.error || '노트 삭제 중 오류가 발생했습니다.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting draft:', error);
      addToast({
        title: '오류',
        description: '예상치 못한 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getExpiryInfo = () => {
    const now = new Date();
    const expiry = new Date(draft.expiresAt);
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) {
      return { text: '만료됨', variant: 'destructive' as const };
    } else if (diffDays <= 1) {
      return { text: '1일 후 만료', variant: 'destructive' as const };
    } else if (diffDays <= 3) {
      return { text: `${diffDays}일 후 만료`, variant: 'secondary' as const };
    } else {
      return { text: `${diffDays}일 후 만료`, variant: 'outline' as const };
    }
  };

  const expiryInfo = getExpiryInfo();

  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {draft.title || '제목 없음'}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <DraftStatusIndicator />
              <Badge variant={expiryInfo.variant} className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {expiryInfo.text}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-1 ml-2">
            <FileText className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* 내용 미리보기 */}
        <div className="mb-4">
          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
            {draft.content || '내용이 없습니다.'}
          </p>
        </div>
        
        {/* 메타 정보 */}
        <div className="text-xs text-gray-500 dark:text-gray-500 mb-4">
          <div>생성: {formatDate(draft.createdAt)}</div>
          <div>수정: {formatDate(draft.updatedAt)}</div>
        </div>
        
        {/* 액션 버튼들 */}
        <div className="flex items-center gap-2">
          <Button
            onClick={handleConvertToNote}
            disabled={isConverting || isDeleting}
            size="sm"
            className="flex-1 bg-gradient-to-r from-emerald-500 to-violet-600 hover:from-emerald-600 hover:to-violet-700 text-white"
          >
            {isConverting ? (
              <>
                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                변환 중...
              </>
            ) : (
              <>
                <CheckCircle className="w-3 h-3 mr-2" />
                정식 노트로 변환
              </>
            )}
          </Button>
          
          <Button
            onClick={handleDelete}
            disabled={isConverting || isDeleting}
            size="sm"
            variant="outline"
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            {isDeleting ? (
              <>
                <div className="w-3 h-3 border border-red-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                삭제 중...
              </>
            ) : (
              <>
                <Trash2 className="w-3 h-3 mr-2" />
                삭제
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
