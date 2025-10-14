// components/auth/reset-password-form.tsx
// 비밀번호 재설정 폼 컴포넌트
// 사용자가 새 비밀번호를 입력하여 비밀번호를 재설정하는 폼
// 관련 파일: app/auth/reset-password/page.tsx, lib/supabase.ts

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// 폼 유효성 검사 스키마
const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(1, '비밀번호를 입력해주세요')
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
    .regex(/^(?=.*[A-Za-z])(?=.*\d)/, '비밀번호는 영문과 숫자를 포함해야 합니다'),
  confirmPassword: z
    .string()
    .min(1, '비밀번호 확인을 입력해주세요'),
}).refine((data) => data.password === data.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['confirmPassword'],
})

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isValidSession, setIsValidSession] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema)
  })

  useEffect(() => {
    // 세션 유효성 확인
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth/login')
        return
      }
      setIsValidSession(true)
    }

    checkSession()
  }, [router, supabase.auth])

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password
      })

      if (error) {
        console.log('Supabase update password error:', error) // 디버깅용
        
        if (error.message.includes('Password') ||
            error.message.includes('password') ||
            error.message.includes('weak password')) {
          setError('비밀번호가 요구사항을 만족하지 않습니다. 영문과 숫자를 포함하여 최소 8자 이상 입력해주세요.')
        } else if (error.message.includes('rate limit') ||
                   error.message.includes('too many requests')) {
          setError('너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.')
        } else {
          setError(`비밀번호 재설정 중 오류가 발생했습니다: ${error.message}`)
        }
        return
      }

      // 성공 시 메인 페이지로 리다이렉션
      router.push('/')
    } catch (err) {
      setError('예상치 못한 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isValidSession) {
    return (
      <Card className="w-full bg-white/80 backdrop-blur-sm border-purple-200 shadow-lg">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-sm text-gray-600">세션을 확인하는 중...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full bg-white/80 backdrop-blur-sm border-purple-200 shadow-lg">
      <CardHeader>
        <CardTitle className="bg-gradient-to-r from-emerald-500 via-violet-500 to-cyan-500 bg-clip-text text-transparent">
          새 비밀번호 설정
        </CardTitle>
        <CardDescription className="text-gray-700">
          새로운 비밀번호를 입력해주세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">새 비밀번호</Label>
            <Input
              id="password"
              type="password"
              placeholder="최소 8자, 영문+숫자 조합"
              {...register('password')}
              aria-invalid={errors.password ? 'true' : 'false'}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            {errors.password && (
              <p id="password-error" className="text-sm text-red-600" role="alert">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">비밀번호 확인</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="비밀번호를 다시 입력하세요"
              {...register('confirmPassword')}
              aria-invalid={errors.confirmPassword ? 'true' : 'false'}
              aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
            />
            {errors.confirmPassword && (
              <p id="confirm-password-error" className="text-sm text-red-600" role="alert">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-500 to-violet-600 hover:from-emerald-600 hover:to-violet-700 text-white border-0 shadow-lg"
            disabled={isLoading}
            aria-describedby="submit-description"
          >
            {isLoading ? '재설정 중...' : '비밀번호 재설정'}
          </Button>
          
          <p id="submit-description" className="text-xs text-gray-500 text-center">
            비밀번호 재설정 시 자동으로 로그인됩니다
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
