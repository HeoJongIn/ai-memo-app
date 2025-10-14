// app/auth/forgot-password/page.tsx
// 비밀번호 재설정 요청 페이지 컴포넌트
// 사용자가 이메일을 입력하여 비밀번호 재설정 이메일을 요청하는 페이지
// 관련 파일: components/auth/forgot-password-form.tsx, lib/supabase.ts

import ForgotPasswordForm from '@/components/auth/forgot-password-form'

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* 오로라 배경 */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 opacity-15"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-violet-500 via-purple-600 to-fuchsia-700 opacity-20"></div>
      <div className="absolute inset-0 bg-gradient-to-bl from-rose-400 via-pink-500 to-red-600 opacity-18"></div>
      
      {/* 움직이는 오로라 효과 - 역동적이고 생동감 있는 움직임 */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[200px] h-[120vh] bg-gradient-to-b from-emerald-400/60 via-teal-500/50 to-transparent animate-aurora-dance-1 filter blur-xl"></div>
        <div className="absolute top-0 left-1/2 w-[250px] h-[120vh] bg-gradient-to-b from-violet-500/55 via-purple-600/45 to-transparent animate-aurora-dance-2 filter blur-xl" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-0 right-1/4 w-[200px] h-[120vh] bg-gradient-to-b from-blue-400/50 via-indigo-500/40 to-transparent animate-aurora-dance-3 filter blur-xl" style={{animationDelay: '4s'}}></div>
        <div className="absolute top-0 left-0 w-[150px] h-[120vh] bg-gradient-to-b from-rose-400/45 via-pink-500/35 to-transparent animate-aurora-dance-4 filter blur-xl" style={{animationDelay: '6s'}}></div>
        <div className="absolute top-1/3 left-0 w-full h-[80px] bg-gradient-to-r from-transparent via-cyan-300/35 to-transparent animate-aurora-horizontal-flow filter blur-lg"></div>
      </div>
      
      <div className="relative z-10 max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold bg-gradient-to-r from-emerald-400 via-violet-500 to-cyan-400 bg-clip-text text-transparent">
            비밀번호 재설정
          </h2>
          <p className="mt-2 text-center text-sm text-gray-700">
            이메일 주소를 입력하면 비밀번호 재설정 링크를 보내드립니다
          </p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  )
}
