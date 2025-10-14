// __tests__/hooks/use-onboarding.test.tsx
// 온보딩 훅 테스트
// 온보딩 상태 관리 훅의 기능 테스트
// 관련 파일: hooks/use-onboarding.ts

import { renderHook, act, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { useOnboarding } from '@/hooks/use-onboarding'
import { getOnboardingStatus, completeOnboarding, skipOnboarding } from '@/lib/actions/onboarding'

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

jest.mock('@/lib/actions/onboarding', () => ({
  getOnboardingStatus: jest.fn(),
  completeOnboarding: jest.fn(),
  skipOnboarding: jest.fn()
}))

const mockPush = jest.fn()
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockGetOnboardingStatus = getOnboardingStatus as jest.MockedFunction<typeof getOnboardingStatus>
const mockCompleteOnboarding = completeOnboarding as jest.MockedFunction<typeof completeOnboarding>
const mockSkipOnboarding = skipOnboarding as jest.MockedFunction<typeof skipOnboarding>

describe('useOnboarding', () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn()
    })
    mockPush.mockClear()
    jest.clearAllMocks()
  })

  it('초기 상태가 올바르게 설정된다', () => {
    mockGetOnboardingStatus.mockResolvedValue(false)
    
    const { result } = renderHook(() => useOnboarding())
    
    expect(result.current.isLoading).toBe(true)
    expect(result.current.isCompleted).toBe(false)
    expect(result.current.currentStep).toBe(1)
    expect(result.current.totalSteps).toBe(3)
    expect(result.current.error).toBe(null)
  })

  it('온보딩 상태를 올바르게 로드한다', async () => {
    mockGetOnboardingStatus.mockResolvedValue(false)
    
    const { result } = renderHook(() => useOnboarding())
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    
    expect(mockGetOnboardingStatus).toHaveBeenCalledTimes(1)
  })

  it('다음 단계로 이동한다', () => {
    mockGetOnboardingStatus.mockResolvedValue(false)
    
    const { result } = renderHook(() => useOnboarding())
    
    act(() => {
      result.current.goToNextStep()
    })
    
    expect(result.current.currentStep).toBe(2)
  })

  it('이전 단계로 이동한다', () => {
    mockGetOnboardingStatus.mockResolvedValue(false)
    
    const { result } = renderHook(() => useOnboarding())
    
    // 먼저 다음 단계로 이동
    act(() => {
      result.current.goToNextStep()
    })
    
    // 그 다음 이전 단계로 이동
    act(() => {
      result.current.goToPreviousStep()
    })
    
    expect(result.current.currentStep).toBe(1)
  })

  it('첫 번째 단계에서 이전 단계로 이동할 수 없다', () => {
    mockGetOnboardingStatus.mockResolvedValue(false)
    
    const { result } = renderHook(() => useOnboarding())
    
    act(() => {
      result.current.goToPreviousStep()
    })
    
    expect(result.current.currentStep).toBe(1)
  })

  it('마지막 단계에서 다음 단계로 이동할 수 없다', () => {
    mockGetOnboardingStatus.mockResolvedValue(false)
    
    const { result } = renderHook(() => useOnboarding())
    
    // 마지막 단계로 이동
    act(() => {
      result.current.goToStep(3)
    })
    
    // 다음 단계로 이동 시도
    act(() => {
      result.current.goToNextStep()
    })
    
    expect(result.current.currentStep).toBe(3)
  })

  it('특정 단계로 이동한다', () => {
    mockGetOnboardingStatus.mockResolvedValue(false)
    
    const { result } = renderHook(() => useOnboarding())
    
    act(() => {
      result.current.goToStep(2)
    })
    
    expect(result.current.currentStep).toBe(2)
  })

  it('유효하지 않은 단계로 이동할 수 없다', () => {
    mockGetOnboardingStatus.mockResolvedValue(false)
    
    const { result } = renderHook(() => useOnboarding())
    
    act(() => {
      result.current.goToStep(0) // 유효하지 않은 단계
    })
    
    expect(result.current.currentStep).toBe(1) // 변경되지 않음
    
    act(() => {
      result.current.goToStep(5) // 유효하지 않은 단계
    })
    
    expect(result.current.currentStep).toBe(1) // 변경되지 않음
  })

  it('온보딩 완료를 처리한다', async () => {
    mockGetOnboardingStatus.mockResolvedValue(false)
    mockCompleteOnboarding.mockResolvedValue({ success: true })
    
    const { result } = renderHook(() => useOnboarding())
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    
    await act(async () => {
      await result.current.completeOnboardingFlow()
    })
    
    expect(mockCompleteOnboarding).toHaveBeenCalledTimes(1)
    expect(result.current.isCompleted).toBe(true)
    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('온보딩 완료 실패를 처리한다', async () => {
    mockGetOnboardingStatus.mockResolvedValue(false)
    mockCompleteOnboarding.mockResolvedValue({ success: false, error: '테스트 에러' })
    
    const { result } = renderHook(() => useOnboarding())
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    
    await act(async () => {
      await result.current.completeOnboardingFlow()
    })
    
    expect(result.current.error).toBe('테스트 에러')
    expect(result.current.isCompleted).toBe(false)
  })

  it('온보딩 건너뛰기를 처리한다', async () => {
    mockGetOnboardingStatus.mockResolvedValue(false)
    mockSkipOnboarding.mockResolvedValue({ success: true })
    
    const { result } = renderHook(() => useOnboarding())
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    
    await act(async () => {
      await result.current.skipOnboardingFlow()
    })
    
    expect(mockSkipOnboarding).toHaveBeenCalledTimes(1)
    expect(result.current.isCompleted).toBe(true)
    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('에러를 초기화한다', () => {
    mockGetOnboardingStatus.mockResolvedValue(false)
    
    const { result } = renderHook(() => useOnboarding())
    
    // 에러 설정
    act(() => {
      result.current.goToNextStep() // 에러 초기화
    })
    
    expect(result.current.error).toBe(null)
  })
})
