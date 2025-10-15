// components/auth/forgot-password-form.tsx
// 비밀번호 재설정 요청 폼 컴포넌트
// 사용자가 이메일을 입력하여 비밀번호 재설정 이메일을 요청하는 폼
// 관련 파일: app/auth/forgot-password/page.tsx, lib/supabase.ts

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

// 폼 유효성 검사 스키마
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, '이메일을 입력해주세요')
    .email('올바른 이메일 형식이 아닙니다'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema)
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        console.log('Supabase reset password error:', error) // 디버깅용
        
        if (error.message.includes('User not found')) {
          setError('등록되지 않은 이메일입니다.')
        } else if (error.message.includes('rate limit') ||
                   error.message.includes('too many requests')) {
          setError('너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.')
        } else {
          setError(`비밀번호 재설정 요청 중 오류가 발생했습니다: ${error.message}`)
        }
        return
      }

      // 성공 시 성공 메시지 표시
      setSuccess(true)
    } catch {
      setError('예상치 못한 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="w-full bg-white/80 backdrop-blur-sm border-purple-200 shadow-lg">
        <CardHeader>
          <CardTitle className="bg-gradient-to-r from-emerald-500 via-violet-500 to-cyan-500 bg-clip-text text-transparent">
            이메일을 확인해주세요
          </CardTitle>
          <CardDescription className="text-gray-700">
            비밀번호 재설정 링크가 전송되었습니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
              <p className="text-sm">
                비밀번호 재설정 링크가 <strong>입력하신 이메일</strong>로 전송되었습니다.
                이메일을 확인하고 링크를 클릭하여 비밀번호를 재설정해주세요.
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                이메일이 오지 않았나요? 스팸 폴더를 확인해보세요.
              </p>
              <Button 
                variant="outline" 
                onClick={() => setSuccess(false)}
                className="w-full"
              >
                다시 시도
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full bg-white/80 backdrop-blur-sm border-purple-200 shadow-lg">
      <CardHeader>
        <CardTitle className="bg-gradient-to-r from-emerald-500 via-violet-500 to-cyan-500 bg-clip-text text-transparent">
          비밀번호 재설정
        </CardTitle>
        <CardDescription className="text-gray-700">
          가입하신 이메일 주소를 입력해주세요
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
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              {...register('email')}
              aria-invalid={errors.email ? 'true' : 'false'}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <p id="email-error" className="text-sm text-red-600" role="alert">
                {errors.email.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-500 to-violet-600 hover:from-emerald-600 hover:to-violet-700 text-white border-0 shadow-lg"
            disabled={isLoading}
            aria-describedby="submit-description"
          >
            {isLoading ? '전송 중...' : '재설정 링크 전송'}
          </Button>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              비밀번호를 기억하셨나요?{' '}
              <Link href="/auth/login" className="text-emerald-600 hover:text-emerald-500 font-medium">
                로그인
              </Link>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
