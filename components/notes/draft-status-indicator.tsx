// components/notes/draft-status-indicator.tsx
// 임시 저장 상태 표시 컴포넌트
// 임시 저장된 노트임을 나타내는 시각적 표시
// 정식 노트와 구분되는 배지 형태의 컴포넌트

'use client';

import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

interface DraftStatusIndicatorProps {
  className?: string;
}

export function DraftStatusIndicator({ className = '' }: DraftStatusIndicatorProps) {
  return (
    <Badge 
      variant="secondary" 
      className={`flex items-center gap-1 text-xs ${className}`}
      aria-label="임시 저장된 노트"
    >
      <Clock className="w-3 h-3" />
      <span>임시 저장</span>
    </Badge>
  );
}
