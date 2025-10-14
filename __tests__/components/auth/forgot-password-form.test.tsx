// __tests__/components/auth/forgot-password-form.test.tsx
// 비밀번호 재설정 요청 폼 컴포넌트 단위 테스트
// 폼 유효성 검사, Supabase Auth 연동, 에러 핸들링을 테스트
// 관련 파일: components/auth/forgot-password-form.tsx, lib/supabase.ts

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ForgotPasswordForm from '@/components/auth/forgot-password-form'
import { createClient } from '@/lib/supabase'

// Mock Supabase client
jest.mock('@/lib/supabase', () => ({
  createClient: jest.fn(),
}))

const mockSupabase = {
  auth: {
    resetPasswordForEmail: jest.fn(),
  },
}

describe('ForgotPasswordForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
  })

  it('폼이 올바르게 렌더링된다', () => {
    render(<ForgotPasswordForm />)
    
    expect(screen.getByRole('button', { name: '재설정 링크 전송' })).toBeInTheDocument()
    expect(screen.getByLabelText('이메일')).toBeInTheDocument()
    expect(screen.getByText('가입하신 이메일 주소를 입력해주세요')).toBeInTheDocument()
  })

  it('이메일이 비어있는 경우 에러 메시지를 표시한다', async () => {
    const user = userEvent.setup()
    render(<ForgotPasswordForm />)
    
    const submitButton = screen.getByRole('button', { name: '재설정 링크 전송' })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('이메일을 입력해주세요')).toBeInTheDocument()
    })
  })

  it('이메일 형식이 잘못된 경우 에러 메시지를 표시한다', async () => {
    const user = userEvent.setup()
    render(<ForgotPasswordForm />)
    
    const emailInput = screen.getByLabelText('이메일')
    await user.type(emailInput, 'invalid-email')
    
    const submitButton = screen.getByRole('button', { name: '재설정 링크 전송' })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('올바른 이메일 형식이 아닙니다')).toBeInTheDocument()
    })
  })

  it('유효한 이메일로 재설정 요청이 성공하면 성공 메시지를 표시한다', async () => {
    const user = userEvent.setup()
    mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({ error: null })
    
    render(<ForgotPasswordForm />)
    
    const emailInput = screen.getByLabelText('이메일')
    await user.type(emailInput, 'test@example.com')
    
    const submitButton = screen.getByRole('button', { name: '재설정 링크 전송' })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('test@example.com', {
        redirectTo: expect.stringContaining('/auth/reset-password'),
      })
      expect(screen.getByText('이메일을 확인해주세요')).toBeInTheDocument()
      expect(screen.getByText('비밀번호 재설정 링크가 전송되었습니다')).toBeInTheDocument()
    })
  })

  it('존재하지 않는 이메일 시 적절한 에러 메시지를 표시한다', async () => {
    const user = userEvent.setup()
    mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({
      error: { message: 'User not found' }
    })
    
    render(<ForgotPasswordForm />)
    
    const emailInput = screen.getByLabelText('이메일')
    await user.type(emailInput, 'nonexistent@example.com')
    
    const submitButton = screen.getByRole('button', { name: '재설정 링크 전송' })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('등록되지 않은 이메일입니다.')).toBeInTheDocument()
    })
  })

  it('재설정 요청 중 로딩 상태를 표시한다', async () => {
    const user = userEvent.setup()
    mockSupabase.auth.resetPasswordForEmail.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ error: null }), 100))
    )
    
    render(<ForgotPasswordForm />)
    
    const emailInput = screen.getByLabelText('이메일')
    await user.type(emailInput, 'test@example.com')
    
    const submitButton = screen.getByRole('button', { name: '재설정 링크 전송' })
    await user.click(submitButton)
    
    expect(screen.getByText('전송 중...')).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })

  it('성공 후 다시 시도 버튼이 작동한다', async () => {
    const user = userEvent.setup()
    mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({ error: null })
    
    render(<ForgotPasswordForm />)
    
    const emailInput = screen.getByLabelText('이메일')
    await user.type(emailInput, 'test@example.com')
    
    const submitButton = screen.getByRole('button', { name: '재설정 링크 전송' })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('이메일을 확인해주세요')).toBeInTheDocument()
    })
    
    const retryButton = screen.getByRole('button', { name: '다시 시도' })
    await user.click(retryButton)
    
    expect(screen.getByRole('button', { name: '재설정 링크 전송' })).toBeInTheDocument()
  })

  it('접근성 속성이 올바르게 설정되어 있다', () => {
    render(<ForgotPasswordForm />)
    
    const emailInput = screen.getByLabelText('이메일')
    expect(emailInput).toHaveAttribute('aria-invalid', 'false')
  })

  it('로그인 링크가 올바르게 작동한다', () => {
    render(<ForgotPasswordForm />)
    
    const loginLink = screen.getByRole('link', { name: '로그인' })
    expect(loginLink).toHaveAttribute('href', '/auth/login')
  })
})
