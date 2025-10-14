// components/auth/login-form.tsx
// 로그인 폼 컴포넌트
// 이메일과 비밀번호 입력을 받고 로그인을 수행하는 폼
// 관련 파일: app/auth/login/page.tsx, lib/supabase.ts

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
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'

// 폼 유효성 검사 스키마
const loginSchema = z.object({
  email: z
    .string()
    .min(1, '이메일을 입력해주세요')
    .email('올바른 이메일 형식이 아닙니다'),
  password: z
    .string()
    .min(1, '비밀번호를 입력해주세요')
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  })

  useEffect(() => {
    // 이미 로그인된 사용자인지 확인
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        router.push('/')
      }
    }

    checkUser()

    // 인증 상태 변화 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          router.push('/')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router, supabase.auth])

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        // 에러 메시지를 사용자 친화적으로 변환
        console.log('Supabase login error:', error) // 디버깅용
        
        if (error.message.includes('Invalid login credentials') ||
            error.message.includes('invalid credentials')) {
          setError('이메일 또는 비밀번호가 올바르지 않습니다.')
        } else if (error.message.includes('Email not confirmed')) {
          setError('이메일 인증이 완료되지 않았습니다. 이메일을 확인해주세요.')
        } else if (error.message.includes('Too many requests')) {
          setError('너무 많은 로그인 시도가 있었습니다. 잠시 후 다시 시도해주세요.')
        } else if (error.message.includes('User not found')) {
          setError('등록되지 않은 이메일입니다.')
        } else {
          setError(`로그인 중 오류가 발생했습니다: ${error.message}`)
        }
        return
      }

      // 로그인 성공 시 메인 페이지로 리다이렉션
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
        <CardTitle className="bg-gradient-to-r from-emerald-500 via-violet-500 to-cyan-500 bg-clip-text text-transparent">로그인</CardTitle>
        <CardDescription className="text-gray-700">
          AI 메모장에 로그인하여 메모를 관리하세요
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
              placeholder="비밀번호를 입력하세요"
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

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-500 to-violet-600 hover:from-emerald-600 hover:to-violet-700 text-white border-0 shadow-lg"
            disabled={isLoading}
            aria-describedby="submit-description"
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </Button>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              계정이 없으신가요?{' '}
              <Link href="/auth/signup" className="text-emerald-600 hover:text-emerald-500 font-medium">
                회원가입
              </Link>
            </p>
            <p className="text-sm text-gray-600 mt-2">
              비밀번호를 잊으셨나요?{' '}
              <Link href="/auth/forgot-password" className="text-emerald-600 hover:text-emerald-500 font-medium">
                비밀번호 재설정
              </Link>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
