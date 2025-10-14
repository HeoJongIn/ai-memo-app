// components/notes/empty-notes.tsx
// 빈 노트 상태 컴포넌트
// 사용자가 아직 노트를 작성하지 않았을 때 표시되는 안내 컴포넌트
// 새 노트 작성 버튼과 함께 친근한 메시지 제공
// 접근성과 온보딩 메시지가 강화된 개선된 버전

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Plus, Lightbulb, Target, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function EmptyNotes() {
  const router = useRouter();

  const handleCreateNote = () => {
    router.push('/notes/create');
  };

  return (
    <Card className="max-w-lg mx-auto" role="region" aria-labelledby="empty-state-title">
      <CardContent className="flex flex-col items-center justify-center py-16 px-8 text-center">
        {/* 메인 아이콘 */}
        <div className="mb-8">
          <div 
            className="w-20 h-20 bg-gradient-to-r from-emerald-100 to-violet-100 dark:from-emerald-900/30 dark:to-violet-900/30 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg"
            role="img"
            aria-label="빈 노트 상태를 나타내는 아이콘"
          >
            <FileText className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
          </div>
          
          {/* 메인 제목 */}
          <h2 
            id="empty-state-title"
            className="text-2xl font-bold text-gray-900 dark:text-white mb-3"
          >
            아직 작성한 노트가 없습니다
          </h2>
          
          {/* 온보딩 메시지 */}
          <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed mb-6">
            첫 번째 노트를 작성해보세요!<br />
            아이디어와 정보를 체계적으로 기록할 수 있습니다.
          </p>
        </div>

        {/* 노트 작성의 이점 설명 */}
        <div className="mb-8 w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            노트 작성의 장점
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="flex flex-col items-center p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
              <Lightbulb className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mb-2" />
              <span className="text-gray-700 dark:text-gray-300 font-medium">아이디어 정리</span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-lg bg-violet-50 dark:bg-violet-900/20">
              <Target className="w-6 h-6 text-violet-600 dark:text-violet-400 mb-2" />
              <span className="text-gray-700 dark:text-gray-300 font-medium">목표 관리</span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
              <span className="text-gray-700 dark:text-gray-300 font-medium">생산성 향상</span>
            </div>
          </div>
        </div>
        
        {/* CTA 버튼 */}
        <Button 
          onClick={handleCreateNote}
          className="bg-gradient-to-r from-emerald-500 to-violet-600 hover:from-emerald-600 hover:to-violet-700 text-white flex items-center gap-2 px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          aria-describedby="empty-state-description"
        >
          <Plus className="w-5 h-5" />
          첫 노트 작성하기
        </Button>
        
        {/* 추가 설명 */}
        <p 
          id="empty-state-description"
          className="text-xs text-gray-500 dark:text-gray-500 mt-4"
        >
          언제든지 수정하고 삭제할 수 있습니다
        </p>
      </CardContent>
    </Card>
  );
}

