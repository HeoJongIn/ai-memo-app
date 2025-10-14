// hooks/use-onboarding.ts
// 온보딩 상태 관리 훅
// 사용자의 온보딩 진행 상태를 관리하고 서버 액션과 연동
// 관련 파일: lib/actions/onboarding.ts, components/onboarding/

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getOnboardingStatus, completeOnboarding, skipOnboarding } from '@/lib/actions/onboarding'

export interface OnboardingState {
  isLoading: boolean
  isCompleted: boolean
  currentStep: number
  totalSteps: number
  error: string | null
}

interface UseOnboardingOptions {
  onComplete?: () => void
  isPopup?: boolean
}

export function useOnboarding(options: UseOnboardingOptions = {}) {
  const { onComplete, isPopup = false } = options
  const [state, setState] = useState<OnboardingState>({
    isLoading: true,
    isCompleted: false,
    currentStep: 1,
    totalSteps: 3,
    error: null
  })
  
  const router = useRouter()

  // 온보딩 상태 확인
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const isCompleted = await getOnboardingStatus()
        setState(prev => ({
          ...prev,
          isLoading: false,
          isCompleted
        }))
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: '온보딩 상태를 확인할 수 없습니다.'
        }))
      }
    }

    checkOnboardingStatus()
  }, [])

  // 다음 단계로 이동
  const goToNextStep = () => {
    setState(prev => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, prev.totalSteps),
      error: null
    }))
  }

  // 이전 단계로 이동
  const goToPreviousStep = () => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 1),
      error: null
    }))
  }

  // 특정 단계로 이동
  const goToStep = (step: number) => {
    if (step >= 1 && step <= state.totalSteps) {
      setState(prev => ({
        ...prev,
        currentStep: step,
        error: null
      }))
    }
  }

  // 온보딩 완료
  const completeOnboardingFlow = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const result = await completeOnboarding()
      
      if (result.success) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          isCompleted: true
        }))
        
        if (isPopup && onComplete) {
          onComplete()
        } else {
          router.push('/')
        }
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: result.error || '온보딩 완료에 실패했습니다.'
        }))
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: '예상치 못한 오류가 발생했습니다.'
      }))
    }
  }

  // 온보딩 건너뛰기
  const skipOnboardingFlow = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const result = await skipOnboarding()
      
      if (result.success) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          isCompleted: true
        }))
        
        if (isPopup && onComplete) {
          onComplete()
        } else {
          router.push('/')
        }
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: result.error || '온보딩 건너뛰기에 실패했습니다.'
        }))
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: '예상치 못한 오류가 발생했습니다.'
      }))
    }
  }

  // 에러 초기화
  const clearError = () => {
    setState(prev => ({ ...prev, error: null }))
  }

  return {
    ...state,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    completeOnboardingFlow,
    skipOnboardingFlow,
    clearError
  }
}
