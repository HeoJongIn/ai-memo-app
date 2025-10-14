// app/page.tsx
// AI 메모장 메인 페이지
// 사용자 인증 상태에 따라 다른 콘텐츠를 표시하는 홈페이지
// 관련 파일: app/auth/signup/page.tsx, lib/supabase.ts

import Link from "next/link"
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            AI 메모장
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            음성 메모를 텍스트로 변환하고, AI가 요약과 태그를 자동으로 생성해주는 스마트한 메모 서비스
          </p>

          <div className="space-y-4">
            <p className="text-lg text-gray-700 mb-8">
              지금 시작해보세요
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/auth/signup">회원가입</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/auth/login">로그인</Link>
              </Button>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">음성 인식</h3>
              <p className="text-gray-600">
                음성 메모를 실시간으로 텍스트로 변환하여 빠르고 편리하게 기록하세요
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">AI 요약</h3>
              <p className="text-gray-600">
                AI가 메모 내용을 분석하여 핵심 내용을 요약해드립니다
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">자동 태깅</h3>
              <p className="text-gray-600">
                메모 내용을 분석하여 관련 태그를 자동으로 생성합니다
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
