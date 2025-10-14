// app/page.tsx
// AI 메모장 메인 페이지
// 사용자 인증 상태에 따라 다른 콘텐츠를 표시하는 홈페이지
// 관련 파일: app/auth/signup/page.tsx, lib/supabase.ts

'use client'

import { useEffect, useState } from 'react'
import Link from "next/link"
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // 현재 사용자 정보 가져오기
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    // 인증 상태 변화 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        {/* 실제 오로라 배경 */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 opacity-15"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-violet-500 via-purple-600 to-fuchsia-700 opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-bl from-rose-400 via-pink-500 to-red-600 opacity-18"></div>
        
        {/* 오로라 애니메이션 */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-radial from-emerald-400 via-teal-500 to-transparent rounded-full mix-blend-screen filter blur-3xl opacity-40 animate-aurora-1"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-radial from-violet-500 via-purple-600 to-transparent rounded-full mix-blend-screen filter blur-3xl opacity-35 animate-aurora-2"></div>
        </div>
        
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-cyan-400 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700 font-medium">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 실제 오로라 배경 - 더 자연스러운 색상과 그라데이션 */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 opacity-15"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-violet-500 via-purple-600 to-fuchsia-700 opacity-20"></div>
      <div className="absolute inset-0 bg-gradient-to-bl from-rose-400 via-pink-500 to-red-600 opacity-18"></div>
      <div className="absolute inset-0 bg-gradient-to-tl from-blue-400 via-indigo-500 to-purple-700 opacity-12"></div>
      
      {/* 실제 오로라 움직임 - 더 유동적이고 자연스러운 애니메이션 */}
      <div className="absolute top-0 left-0 w-full h-full">
        {/* 첫 번째 오로라 - 초록-청록 계열 */}
        <div className="absolute top-1/5 left-1/6 w-[500px] h-[400px] bg-gradient-radial from-emerald-400 via-teal-500 to-transparent rounded-full mix-blend-screen filter blur-3xl opacity-40 animate-aurora-1"></div>
        
        {/* 두 번째 오로라 - 보라-핑크 계열 */}
        <div className="absolute top-1/3 right-1/5 w-[600px] h-[350px] bg-gradient-radial from-violet-500 via-purple-600 to-transparent rounded-full mix-blend-screen filter blur-3xl opacity-35 animate-aurora-2"></div>
        
        {/* 세 번째 오로라 - 파랑-보라 계열 */}
        <div className="absolute bottom-1/4 left-1/4 w-[450px] h-[500px] bg-gradient-radial from-blue-400 via-indigo-500 to-transparent rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-aurora-3"></div>
        
        {/* 네 번째 오로라 - 핑크-빨강 계열 */}
        <div className="absolute top-1/2 right-1/3 w-[400px] h-[300px] bg-gradient-radial from-rose-400 via-pink-500 to-transparent rounded-full mix-blend-screen filter blur-3xl opacity-25 animate-aurora-4"></div>
        
        {/* 오로라 빛줄기 효과 */}
        <div className="absolute top-0 left-1/2 w-1 h-full bg-gradient-to-b from-transparent via-cyan-300 to-transparent opacity-60 animate-aurora-beam"></div>
        <div className="absolute top-0 right-1/3 w-1 h-full bg-gradient-to-b from-transparent via-purple-300 to-transparent opacity-50 animate-aurora-beam-delayed"></div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-emerald-400 via-violet-500 to-cyan-400 bg-clip-text text-transparent mb-6 animate-pulse">
            AI 메모장
          </h1>
          <p className="text-xl text-gray-700 mb-12 max-w-2xl mx-auto font-medium">
            음성 메모를 텍스트로 변환하고, AI가 요약과 태그를 자동으로 생성해주는 스마트한 메모 서비스
          </p>

          {user ? (
            // 로그인된 사용자용 콘텐츠
            <div className="space-y-4">
              <p className="text-lg text-gray-700 mb-8">
                안녕하세요, {user.email}님! 👋
              </p>
              <div className="flex gap-4 justify-center">
                <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-violet-600 hover:from-emerald-600 hover:to-violet-700 text-white border-0 shadow-lg">
                  메모 작성하기
                </Button>
                <Button variant="outline" size="lg" onClick={handleLogout} className="border-cyan-300 text-cyan-700 hover:bg-cyan-50">
                  로그아웃
                </Button>
              </div>
            </div>
          ) : (
            // 비로그인 사용자용 콘텐츠
            <div className="space-y-4">
              <p className="text-lg text-gray-700 mb-8">
                지금 시작해보세요
              </p>
              <div className="flex gap-4 justify-center">
                <Button asChild size="lg" className="bg-gradient-to-r from-emerald-500 to-violet-600 hover:from-emerald-600 hover:to-violet-700 text-white border-0 shadow-lg">
                  <Link href="/auth/signup">회원가입</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-cyan-300 text-cyan-700 hover:bg-cyan-50">
                  <Link href="/auth/login">로그인</Link>
                </Button>
              </div>
            </div>
          )}

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-purple-200 hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-semibold mb-3 bg-gradient-to-r from-emerald-500 via-violet-500 to-cyan-500 bg-clip-text text-transparent">음성 인식</h3>
              <p className="text-gray-700">
                음성 메모를 실시간으로 텍스트로 변환하여 빠르고 편리하게 기록하세요
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-purple-200 hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-semibold mb-3 bg-gradient-to-r from-emerald-500 via-violet-500 to-cyan-500 bg-clip-text text-transparent">AI 요약</h3>
              <p className="text-gray-700">
                AI가 메모 내용을 분석하여 핵심 내용을 요약해드립니다
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-purple-200 hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-semibold mb-3 bg-gradient-to-r from-emerald-500 via-violet-500 to-cyan-500 bg-clip-text text-transparent">자동 태깅</h3>
              <p className="text-gray-700">
                메모 내용을 분석하여 관련 태그를 자동으로 생성합니다
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
