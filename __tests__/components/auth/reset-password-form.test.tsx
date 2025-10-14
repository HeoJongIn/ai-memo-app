// __tests__/components/auth/reset-password-form.test.tsx
// 비밀번호 재설정 폼 컴포넌트 단위 테스트
// 폼 유효성 검사, Supabase Auth 연동, 에러 핸들링을 테스트
// 관련 파일: components/auth/reset-password-form.tsx, lib/supabase.ts

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import ResetPasswordForm from '@/components/auth/reset-password-form'
import { createClient } from '@/lib/supabase'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock Supabase client
jest.mock('@/lib/supabase', () => ({
  createClient: jest.fn(),
}))

const mockPush = jest.fn()
const mockSupabase = {
  auth: {
    getSession: jest.fn(),
    updateUser: jest.fn(),
  },
}

describe('ResetPasswordForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
    ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
    
    // Mock valid session by default
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'test-user' } } }
    })
  })

  it('폼이 올바르게 렌더링된다', async () => {
    render(<ResetPasswordForm />)
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '비밀번호 재설정' })).toBeInTheDocument()
      expect(screen.getByLabelText('새 비밀번호')).toBeInTheDocument()
      expect(screen.getByLabelText('비밀번호 확인')).toBeInTheDocument()
    })
  })

  it('세션이 없으면 로그인 페이지로 리다이렉션된다', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null }
    })
    
    render(<ResetPasswordForm />)
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/auth/login')
    })
  })

  it('비밀번호가 비어있는 경우 에러 메시지를 표시한다', async () => {
    const user = userEvent.setup()
    render(<ResetPasswordForm />)
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '비밀번호 재설정' })).toBeInTheDocument()
    })
    
    const submitButton = screen.getByRole('button', { name: '비밀번호 재설정' })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('비밀번호를 입력해주세요')).toBeInTheDocument()
    })
  })

  it('비밀번호가 너무 짧은 경우 에러 메시지를 표시한다', async () => {
    const user = userEvent.setup()
    render(<ResetPasswordForm />)
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '비밀번호 재설정' })).toBeInTheDocument()
    })
    
    const passwordInput = screen.getByLabelText('새 비밀번호')
    await user.type(passwordInput, '123')
    
    const submitButton = screen.getByRole('button', { name: '비밀번호 재설정' })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('비밀번호는 최소 8자 이상이어야 합니다')).toBeInTheDocument()
    })
  })

  it('비밀번호에 영문과 숫자가 포함되지 않은 경우 에러 메시지를 표시한다', async () => {
    const user = userEvent.setup()
    render(<ResetPasswordForm />)
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '비밀번호 재설정' })).toBeInTheDocument()
    })
    
    const passwordInput = screen.getByLabelText('새 비밀번호')
    await user.type(passwordInput, 'password')
    
    const submitButton = screen.getByRole('button', { name: '비밀번호 재설정' })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('비밀번호는 영문과 숫자를 포함해야 합니다')).toBeInTheDocument()
    })
  })

  it('비밀번호 확인이 일치하지 않는 경우 에러 메시지를 표시한다', async () => {
    const user = userEvent.setup()
    render(<ResetPasswordForm />)
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '비밀번호 재설정' })).toBeInTheDocument()
    })
    
    const passwordInput = screen.getByLabelText('새 비밀번호')
    const confirmPasswordInput = screen.getByLabelText('비밀번호 확인')
    
    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'different123')
    
    const submitButton = screen.getByRole('button', { name: '비밀번호 재설정' })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('비밀번호가 일치하지 않습니다')).toBeInTheDocument()
    })
  })

  it('유효한 데이터로 비밀번호 재설정이 성공하면 메인 페이지로 리다이렉션된다', async () => {
    const user = userEvent.setup()
    mockSupabase.auth.updateUser.mockResolvedValue({ error: null })
    
    render(<ResetPasswordForm />)
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '비밀번호 재설정' })).toBeInTheDocument()
    })
    
    const passwordInput = screen.getByLabelText('새 비밀번호')
    const confirmPasswordInput = screen.getByLabelText('비밀번호 확인')
    
    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'password123')
    
    const submitButton = screen.getByRole('button', { name: '비밀번호 재설정' })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({
        password: 'password123',
      })
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  it('비밀번호 재설정 실패 시 적절한 에러 메시지를 표시한다', async () => {
    const user = userEvent.setup()
    mockSupabase.auth.updateUser.mockResolvedValue({
      error: { message: 'Password is too weak' }
    })
    
    render(<ResetPasswordForm />)
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '비밀번호 재설정' })).toBeInTheDocument()
    })
    
    const passwordInput = screen.getByLabelText('새 비밀번호')
    const confirmPasswordInput = screen.getByLabelText('비밀번호 확인')
    
    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'password123')
    
    const submitButton = screen.getByRole('button', { name: '비밀번호 재설정' })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('비밀번호가 요구사항을 만족하지 않습니다. 영문과 숫자를 포함하여 최소 8자 이상 입력해주세요.')).toBeInTheDocument()
    })
  })

  it('비밀번호 재설정 중 로딩 상태를 표시한다', async () => {
    const user = userEvent.setup()
    mockSupabase.auth.updateUser.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ error: null }), 100))
    )
    
    render(<ResetPasswordForm />)
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '비밀번호 재설정' })).toBeInTheDocument()
    })
    
    const passwordInput = screen.getByLabelText('새 비밀번호')
    const confirmPasswordInput = screen.getByLabelText('비밀번호 확인')
    
    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'password123')
    
    const submitButton = screen.getByRole('button', { name: '비밀번호 재설정' })
    await user.click(submitButton)
    
    expect(screen.getByText('재설정 중...')).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })

  it('접근성 속성이 올바르게 설정되어 있다', async () => {
    render(<ResetPasswordForm />)
    
    await waitFor(() => {
      const passwordInput = screen.getByLabelText('새 비밀번호')
      const confirmPasswordInput = screen.getByLabelText('비밀번호 확인')
      
      expect(passwordInput).toHaveAttribute('aria-invalid', 'false')
      expect(confirmPasswordInput).toHaveAttribute('aria-invalid', 'false')
    })
  })
})
