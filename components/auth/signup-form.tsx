// components/auth/signup-form.tsx
// 회원가입 폼 컴포넌트
// 이메일과 비밀번호 입력을 받고 유효성 검사를 수행하는 폼
// 관련 파일: app/auth/signup/page.tsx, lib/supabase.ts

'use client'

import { useState } from 'react'
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
const signupSchema = z.object({
  email: z
    .string()
    .min(1, '이메일을 입력해주세요')
    .email('올바른 이메일 형식이 아닙니다'),
  password: z
    .string()
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
    .regex(/^(?=.*[A-Za-z])(?=.*\d)/, '비밀번호는 영문과 숫자를 포함해야 합니다'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['confirmPassword'],
})

type SignupFormData = z.infer<typeof signupSchema>

export default function SignupForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema)
  })

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      // 먼저 이메일이 이미 존재하는지 확인 (비밀번호 재설정 요청으로 확인)
      const { error: checkError } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: 'http://localhost:3001/auth/reset-password'
      })

      // 이메일이 존재하지 않는 경우 (사용자를 찾을 수 없다는 에러)
      if (checkError && checkError.message.includes('User not found')) {
        // 이메일이 존재하지 않으므로 회원가입 진행
      } else if (!checkError) {
        // 이메일이 존재하는 경우
        setError('이미 가입된 이메일입니다.')
        return
      }

      // 실제 회원가입 시도
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      })

      if (error) {
        // 에러 메시지를 사용자 친화적으로 변환
        console.log('Supabase error:', error) // 디버깅용
        
        // 중복 이메일 에러 처리
        if (error.message.includes('already registered') || 
            error.message.includes('User already registered') ||
            error.message.includes('duplicate') ||
            error.message.includes('already exists') ||
            error.message.includes('email address is already in use') ||
            error.code === '23505' ||
            error.code === 'duplicate_email') {
          setError('이미 가입된 이메일입니다.')
        } 
        // 이메일 형식 에러 처리
        else if (error.message.includes('Invalid email') || 
                   error.message.includes('invalid email') ||
                   error.message.includes('email format')) {
          setError('올바른 이메일 형식이 아닙니다.')
        } 
        // 비밀번호 에러 처리
        else if (error.message.includes('Password') || 
                   error.message.includes('password') ||
                   error.message.includes('weak password')) {
          setError('비밀번호가 요구사항을 만족하지 않습니다. 영문과 숫자를 포함하여 최소 8자 이상 입력해주세요.')
        } 
        // Rate limit 에러 처리
        else if (error.message.includes('rate limit') ||
                   error.message.includes('too many requests')) {
          setError('너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.')
        } 
        // 기타 에러 처리
        else {
          setError(`회원가입 중 오류가 발생했습니다: ${error.message}`)
        }
        return
      }

      // 회원가입 성공 시 메인 페이지로 리다이렉션
      router.push('/')
    } catch (err) {
      setError('예상치 못한 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full bg-white/80 backdrop-blur-sm border-purple-200 shadow-lg">
      <CardHeader>
        <CardTitle className="bg-gradient-to-r from-emerald-500 via-violet-500 to-cyan-500 bg-clip-text text-transparent">회원가입</CardTitle>
        <CardDescription className="text-gray-700">
          AI 메모장 서비스를 이용하기 위해 계정을 생성하세요
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

          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
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
            {isLoading ? '가입 중...' : '회원가입'}
          </Button>
          <p id="submit-description" className="text-xs text-gray-500 text-center">
            회원가입 시 서비스 이용약관에 동의한 것으로 간주됩니다
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
