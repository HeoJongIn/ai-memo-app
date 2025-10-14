// app/auth/login/page.tsx
// 로그인 페이지 컴포넌트
// 사용자가 이메일과 비밀번호로 로그인할 수 있는 페이지
// 관련 파일: components/auth/login-form.tsx, lib/supabase.ts

import LoginForm from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* 오로라 배경 */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 opacity-15"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-violet-500 via-purple-600 to-fuchsia-700 opacity-20"></div>
      <div className="absolute inset-0 bg-gradient-to-bl from-rose-400 via-pink-500 to-red-600 opacity-18"></div>
      
      {/* 오로라 애니메이션 */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-radial from-emerald-400 via-teal-500 to-transparent rounded-full mix-blend-screen filter blur-3xl opacity-40 animate-aurora-1"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-radial from-violet-500 via-purple-600 to-transparent rounded-full mix-blend-screen filter blur-3xl opacity-35 animate-aurora-2"></div>
      </div>
      
      <div className="relative z-10 max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold bg-gradient-to-r from-emerald-400 via-violet-500 to-cyan-400 bg-clip-text text-transparent">
            AI 메모장 로그인
          </h2>
          <p className="mt-2 text-center text-sm text-gray-700">
            이메일과 비밀번호로 로그인하세요
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
