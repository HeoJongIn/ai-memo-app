// lib/actions/onboarding.ts
// 온보딩 관련 서버 액션
// 사용자의 온보딩 완료 상태를 관리하는 서버 액션들
// 관련 파일: components/onboarding/, hooks/use-onboarding.ts

'use server'

import { createClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function getOnboardingStatus(): Promise<boolean> {
  const supabase = createClient()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return false
    }

    // 사용자의 온보딩 완료 상태를 확인
    // Supabase Auth의 user_metadata를 사용하여 온보딩 상태 저장
    const { data, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('온보딩 상태 조회 오류:', error)
      return false
    }

    return data.user?.user_metadata?.onboarding_completed === true
  } catch (error) {
    console.error('온보딩 상태 조회 중 오류:', error)
    return false
  }
}

export async function completeOnboarding(): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: '사용자가 로그인되지 않았습니다.' }
    }

    // 사용자의 메타데이터에 온보딩 완료 상태 저장
    const { error } = await supabase.auth.updateUser({
      data: { onboarding_completed: true }
    })

    if (error) {
      console.error('온보딩 완료 상태 업데이트 오류:', error)
      return { success: false, error: '온보딩 완료 상태 업데이트에 실패했습니다.' }
    }

    // 페이지 재검증
    revalidatePath('/')
    revalidatePath('/onboarding')
    
    return { success: true }
  } catch (error) {
    console.error('온보딩 완료 처리 중 오류:', error)
    return { success: false, error: '예상치 못한 오류가 발생했습니다.' }
  }
}

export async function skipOnboarding(): Promise<{ success: boolean; error?: string }> {
  // 건너뛰기도 완료와 동일하게 처리
  return completeOnboarding()
}
