// components/auth/logout-dialog.tsx
// 로그아웃 확인 대화상자 컴포넌트
// 사용자가 로그아웃을 확인할 수 있는 모달 다이얼로그
// 관련 파일: app/page.tsx, lib/supabase.ts

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface LogoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function LogoutDialog({ open, onOpenChange }: LogoutDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.log('Supabase logout error:', error) // 디버깅용
        setError('로그아웃 중 오류가 발생했습니다. 다시 시도해주세요.')
        return
      }

      // 로그아웃 성공 시 다이얼로그를 먼저 닫고 리다이렉션
      onOpenChange(false)
      router.push('/')
    } catch (err) {
      setError('예상치 못한 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
    setError(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white/90 backdrop-blur-sm border-purple-200">
        <DialogHeader>
          <DialogTitle className="bg-gradient-to-r from-emerald-500 via-violet-500 to-cyan-500 bg-clip-text text-transparent">
            로그아웃 확인
          </DialogTitle>
          <DialogDescription className="text-gray-700">
            정말로 로그아웃하시겠습니까? 로그아웃하면 현재 세션이 종료됩니다.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            취소
          </Button>
          <Button
            onClick={handleLogout}
            disabled={isLoading}
            className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-violet-600 hover:from-emerald-600 hover:to-violet-700 text-white border-0 shadow-lg"
          >
            {isLoading ? '로그아웃 중...' : '로그아웃'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
