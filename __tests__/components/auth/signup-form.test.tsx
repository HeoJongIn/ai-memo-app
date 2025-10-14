// __tests__/components/auth/signup-form.test.tsx
// 회원가입 폼 컴포넌트 단위 테스트
// 폼 유효성 검사, Supabase Auth 연동, 에러 핸들링을 테스트
// 관련 파일: components/auth/signup-form.tsx, lib/supabase.ts

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import SignupForm from '@/components/auth/signup-form'
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
    signUp: jest.fn(),
  },
}

describe('SignupForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
    ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
  })

  it('폼이 올바르게 렌더링된다', () => {
    render(<SignupForm />)
    
    expect(screen.getByRole('button', { name: '회원가입' })).toBeInTheDocument()
    expect(screen.getByLabelText('이메일')).toBeInTheDocument()
    expect(screen.getByLabelText('비밀번호')).toBeInTheDocument()
    expect(screen.getByLabelText('비밀번호 확인')).toBeInTheDocument()
  })

  it('이메일이 비어있는 경우 에러 메시지를 표시한다', async () => {
    const user = userEvent.setup()
    render(<SignupForm />)
    
    const passwordInput = screen.getByLabelText('비밀번호')
    const confirmPasswordInput = screen.getByLabelText('비밀번호 확인')
    
    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'password123')
    
    const submitButton = screen.getByRole('button', { name: '회원가입' })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('이메일을 입력해주세요')).toBeInTheDocument()
    })
  })

  it('비밀번호가 너무 짧은 경우 에러 메시지를 표시한다', async () => {
    const user = userEvent.setup()
    render(<SignupForm />)
    
    const passwordInput = screen.getByLabelText('비밀번호')
    await user.type(passwordInput, '123')
    
    const submitButton = screen.getByRole('button', { name: '회원가입' })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('비밀번호는 최소 8자 이상이어야 합니다')).toBeInTheDocument()
    })
  })

  it('비밀번호에 영문과 숫자가 포함되지 않은 경우 에러 메시지를 표시한다', async () => {
    const user = userEvent.setup()
    render(<SignupForm />)
    
    const passwordInput = screen.getByLabelText('비밀번호')
    await user.type(passwordInput, '12345678')
    
    const submitButton = screen.getByRole('button', { name: '회원가입' })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('비밀번호는 영문과 숫자를 포함해야 합니다')).toBeInTheDocument()
    })
  })

  it('비밀번호 확인이 일치하지 않는 경우 에러 메시지를 표시한다', async () => {
    const user = userEvent.setup()
    render(<SignupForm />)
    
    const passwordInput = screen.getByLabelText('비밀번호')
    const confirmPasswordInput = screen.getByLabelText('비밀번호 확인')
    
    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'different123')
    
    const submitButton = screen.getByRole('button', { name: '회원가입' })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('비밀번호가 일치하지 않습니다')).toBeInTheDocument()
    })
  })

  it('유효한 데이터로 회원가입이 성공하면 메인 페이지로 리다이렉션된다', async () => {
    const user = userEvent.setup()
    mockSupabase.auth.signUp.mockResolvedValue({ error: null })
    
    render(<SignupForm />)
    
    const emailInput = screen.getByLabelText('이메일')
    const passwordInput = screen.getByLabelText('비밀번호')
    const confirmPasswordInput = screen.getByLabelText('비밀번호 확인')
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'password123')
    
    const submitButton = screen.getByRole('button', { name: '회원가입' })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  it('중복 이메일 에러 시 적절한 메시지를 표시한다', async () => {
    const user = userEvent.setup()
    mockSupabase.auth.signUp.mockResolvedValue({
      error: { message: 'User already registered' }
    })
    
    render(<SignupForm />)
    
    const emailInput = screen.getByLabelText('이메일')
    const passwordInput = screen.getByLabelText('비밀번호')
    const confirmPasswordInput = screen.getByLabelText('비밀번호 확인')
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'password123')
    
    const submitButton = screen.getByRole('button', { name: '회원가입' })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('이미 가입된 이메일입니다.')).toBeInTheDocument()
    })
  })

  it('회원가입 중 로딩 상태를 표시한다', async () => {
    const user = userEvent.setup()
    mockSupabase.auth.signUp.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ error: null }), 100))
    )
    
    render(<SignupForm />)
    
    const emailInput = screen.getByLabelText('이메일')
    const passwordInput = screen.getByLabelText('비밀번호')
    const confirmPasswordInput = screen.getByLabelText('비밀번호 확인')
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'password123')
    
    const submitButton = screen.getByRole('button', { name: '회원가입' })
    await user.click(submitButton)
    
    expect(screen.getByText('가입 중...')).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })

  it('접근성 속성이 올바르게 설정되어 있다', () => {
    render(<SignupForm />)
    
    const emailInput = screen.getByLabelText('이메일')
    const passwordInput = screen.getByLabelText('비밀번호')
    const confirmPasswordInput = screen.getByLabelText('비밀번호 확인')
    
    expect(emailInput).toHaveAttribute('aria-invalid', 'false')
    expect(passwordInput).toHaveAttribute('aria-invalid', 'false')
    expect(confirmPasswordInput).toHaveAttribute('aria-invalid', 'false')
  })
})
