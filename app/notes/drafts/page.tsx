// app/notes/drafts/page.tsx
// 임시 저장된 노트 목록 페이지
// 사용자의 임시 저장된 노트들을 조회하고 관리할 수 있는 페이지
// 정식 노트로 변환하거나 삭제할 수 있는 기능 제공

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { getDraftsAction } from '@/lib/actions/notes';
import { DraftCard } from '@/components/notes/draft-card';
import { DraftStatusIndicator } from '@/components/notes/draft-status-indicator';
import { ArrowLeft, FileText, Clock, AlertCircle } from 'lucide-react';
import type { DraftNote } from '@/drizzle/schema';

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<DraftNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { addToast } = useToast();

  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = async () => {
    setIsLoading(true);
    try {
      const result = await getDraftsAction();
      
      if (result.success && result.data) {
        setDrafts(result.data);
      } else {
        addToast({
          title: '오류',
          description: result.error || '임시 저장된 노트를 불러오는데 실패했습니다.',
          variant: 'destructive',
        });
      }
    } catch {
      addToast({
        title: '오류',
        description: '예상치 못한 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConvertToNote = (noteId: string) => {
    // 정식 노트로 변환된 후 노트 상세 페이지로 이동
    router.push(`/notes/${noteId}`);
  };

  const handleDeleteDraft = (draftId: string) => {
    // 삭제된 임시 노트를 목록에서 제거
    setDrafts(prev => prev.filter(draft => draft.id !== draftId));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-cyan-400"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            뒤로
          </Button>
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              임시 저장된 노트
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <DraftStatusIndicator />
          <p className="text-gray-600 dark:text-gray-400">
            임시 저장된 노트는 7일 후 자동으로 삭제됩니다.
          </p>
        </div>
      </div>

      {/* 임시 저장된 노트 목록 */}
      {drafts.length === 0 ? (
        <Card className="max-w-md mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-16 px-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-100 to-yellow-100 dark:from-orange-900/30 dark:to-yellow-900/30 rounded-full flex items-center justify-center mb-6">
              <Clock className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              임시 저장된 노트가 없습니다
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
              노트 작성 중에 임시 저장 버튼을 사용하여<br />
              작성 중인 내용을 보관할 수 있습니다.
            </p>
            <Button 
              onClick={() => router.push('/notes/create')}
              className="bg-gradient-to-r from-emerald-500 to-violet-600 hover:from-emerald-600 hover:to-violet-700 text-white"
            >
              새 노트 작성하기
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* 만료 경고 */}
          <div className="mb-6">
            <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
              <CardContent className="flex items-center gap-3 py-4">
                <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <div>
                  <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                    임시 저장된 노트는 7일 후 자동으로 삭제됩니다.
                  </p>
                  <p className="text-xs text-orange-700 dark:text-orange-300">
                    중요한 내용은 정식 노트로 변환해주세요.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 노트 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {drafts.map((draft) => (
              <DraftCard
                key={draft.id}
                draft={draft}
                onConvert={handleConvertToNote}
                onDelete={handleDeleteDraft}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
