'use client'

// components/onboarding/onboarding-container.tsx
// 온보딩 메인 컨테이너 컴포넌트
// 3단계 온보딩 플로우를 관리하는 메인 컴포넌트
// 관련 파일: components/onboarding/steps/, hooks/use-onboarding.ts

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboarding } from '@/hooks/use-onboarding'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import WelcomeStep from './steps/welcome-step'
import MemoGuideStep from './steps/memo-guide-step'
import AIDemoStep from './steps/ai-demo-step'
import OnboardingProgress from './onboarding-progress'
import OnboardingNavigation from './onboarding-navigation'

interface OnboardingContainerProps {
  onComplete?: () => void
  isPopup?: boolean
}

export default function OnboardingContainer({ onComplete, isPopup = false }: OnboardingContainerProps) {
  const {
    isLoading,
    isCompleted,
    currentStep,
    totalSteps,
    error,
    goToNextStep,
    goToPreviousStep,
    completeOnboardingFlow,
    skipOnboardingFlow,
    clearError
  } = useOnboarding({ onComplete, isPopup })

  const router = useRouter()

  // 온보딩이 이미 완료된 경우 메인 페이지로 리다이렉션 (팝업이 아닌 경우에만)
  useEffect(() => {
    if (!isLoading && isCompleted && !isPopup) {
      router.push('/')
    }
  }, [isLoading, isCompleted, router, isPopup])

  // 로딩 중일 때
  if (isLoading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        {/* 움직이는 오로라 효과 */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-0 left-1/3 w-[200px] h-[120vh] bg-gradient-to-b from-emerald-400/60 via-teal-500/50 to-transparent animate-aurora-dance-1 filter blur-xl"></div>
          <div className="absolute top-0 left-1/2 w-[250px] h-[120vh] bg-gradient-to-b from-violet-500/55 via-purple-600/45 to-transparent animate-aurora-dance-2 filter blur-xl" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-0 right-1/3 w-[200px] h-[120vh] bg-gradient-to-b from-blue-400/50 via-indigo-500/40 to-transparent animate-aurora-dance-3 filter blur-xl" style={{animationDelay: '4s'}}></div>
        </div>
        
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-cyan-400 mx-auto" role="status" aria-label="로딩 중"></div>
          <p className="mt-4 text-lg text-gray-700 font-medium">온보딩 준비 중...</p>
        </div>
      </div>
    )
  }

  // 온보딩이 완료된 경우
  if (isCompleted) {
    return null // 리다이렉션 처리됨
  }

  // 현재 단계에 따른 컴포넌트 렌더링
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <WelcomeStep />
      case 2:
        return <MemoGuideStep />
      case 3:
        return <AIDemoStep />
      default:
        return <WelcomeStep />
    }
  }

  return (
    <div className={`relative overflow-hidden ${isPopup ? 'h-full' : 'min-h-screen'}`}>
      {/* 움직이는 오로라 배경 - 팝업에서는 제거 */}
      {!isPopup && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 opacity-15"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-violet-500 via-purple-600 to-fuchsia-700 opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-bl from-rose-400 via-pink-500 to-red-600 opacity-18"></div>
          
          {/* 움직이는 오로라 효과 */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
            <div className="absolute top-0 left-1/4 w-[300px] h-[120vh] bg-gradient-to-b from-emerald-400/70 via-teal-500/60 to-transparent animate-aurora-dance-1 filter blur-2xl"></div>
            <div className="absolute top-0 left-1/2 w-[400px] h-[120vh] bg-gradient-to-b from-violet-500/65 via-purple-600/55 to-transparent animate-aurora-dance-2 filter blur-2xl" style={{animationDelay: '3s'}}></div>
            <div className="absolute top-0 right-1/4 w-[350px] h-[120vh] bg-gradient-to-b from-blue-400/60 via-indigo-500/50 to-transparent animate-aurora-dance-3 filter blur-2xl" style={{animationDelay: '6s'}}></div>
            <div className="absolute top-0 left-0 w-[250px] h-[120vh] bg-gradient-to-b from-rose-400/55 via-pink-500/45 to-transparent animate-aurora-dance-4 filter blur-2xl" style={{animationDelay: '9s'}}></div>
          </div>
        </>
      )}

      <div className={`relative z-10 container mx-auto px-4 ${isPopup ? 'py-2 h-full flex flex-col' : 'py-8'}`}>
        {/* 온보딩 헤더 */}
        <div className={`text-center ${isPopup ? 'mb-4' : 'mb-8'}`}>
          <h1 className={`font-bold bg-gradient-to-r from-emerald-400 via-violet-500 to-cyan-400 bg-clip-text text-transparent mb-4 ${isPopup ? 'text-2xl md:text-3xl' : 'text-3xl md:text-4xl'}`}>
            AI 메모장에 오신 것을 환영합니다! 🎉
          </h1>
          <p className={`text-gray-700 max-w-2xl mx-auto ${isPopup ? 'text-base' : 'text-lg'}`}>
            몇 가지 간단한 단계를 통해 AI 메모장의 강력한 기능들을 알아보세요
          </p>
        </div>

        {/* 진행률 표시기 */}
        <div className={`${isPopup ? 'flex-shrink-0' : ''}`}>
          <OnboardingProgress currentStep={currentStep} totalSteps={totalSteps} />
        </div>

        {/* 메인 콘텐츠 */}
        <div className={`max-w-4xl mx-auto ${isPopup ? 'flex-1 flex flex-col min-h-0' : ''}`}>
          <Card className={`bg-white/90 backdrop-blur-sm border-purple-200 shadow-xl ${isPopup ? 'flex-1 flex flex-col' : ''}`} role="region" aria-label="온보딩 콘텐츠">
            <CardContent className={`${isPopup ? 'p-3 flex-1 flex flex-col' : 'p-8'}`}>
              {/* 에러 메시지 */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <p className="text-red-700">{error}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearError}
                      className="text-red-600 hover:text-red-800"
                    >
                      ✕
                    </Button>
                  </div>
                </div>
              )}

              {/* 현재 단계 콘텐츠 */}
              <div className={`${isPopup ? 'flex-1 overflow-y-auto min-h-0' : ''}`}>
                {renderCurrentStep()}
              </div>

              {/* 네비게이션 */}
              <div className={`${isPopup ? 'mt-4 flex-shrink-0' : 'mt-8'}`}>
                <OnboardingNavigation
                  currentStep={currentStep}
                  totalSteps={totalSteps}
                  onNext={goToNextStep}
                  onPrevious={goToPreviousStep}
                  onComplete={completeOnboardingFlow}
                  onSkip={skipOnboardingFlow}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}