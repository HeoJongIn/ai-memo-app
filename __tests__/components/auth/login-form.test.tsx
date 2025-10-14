// __tests__/components/auth/login-form.test.tsx
// 로그인 폼 컴포넌트 단위 테스트
// 폼 유효성 검사, Supabase Auth 연동, 에러 핸들링을 테스트
// 관련 파일: components/auth/login-form.tsx, lib/supabase.ts

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import LoginForm from '@/components/auth/login-form'
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
    signInWithPassword: jest.fn(),
    getUser: jest.fn(),
    onAuthStateChange: jest.fn(),
  },
}

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
    ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
    
    // Mock getUser to return no user by default
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })
    
    // Mock onAuthStateChange to return a subscription
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } }
    })
  })

  it('폼이 올바르게 렌더링된다', () => {
    render(<LoginForm />)
    
    expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument()
    expect(screen.getByLabelText('이메일')).toBeInTheDocument()
    expect(screen.getByLabelText('비밀번호')).toBeInTheDocument()
    expect(screen.getByText('계정이 없으신가요?')).toBeInTheDocument()
  })

  it('이메일이 비어있는 경우 에러 메시지를 표시한다', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)
    
    const passwordInput = screen.getByLabelText('비밀번호')
    await user.type(passwordInput, 'password123')
    
    const submitButton = screen.getByRole('button', { name: '로그인' })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('이메일을 입력해주세요')).toBeInTheDocument()
    })
  })

  it('비밀번호가 비어있는 경우 에러 메시지를 표시한다', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)
    
    const emailInput = screen.getByLabelText('이메일')
    await user.type(emailInput, 'test@example.com')
    
    const submitButton = screen.getByRole('button', { name: '로그인' })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('비밀번호를 입력해주세요')).toBeInTheDocument()
    })
  })

  it('이메일 형식이 잘못된 경우 에러 메시지를 표시한다', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)
    
    const emailInput = screen.getByLabelText('이메일')
    const passwordInput = screen.getByLabelText('비밀번호')
    
    await user.type(emailInput, 'invalid-email')
    await user.type(passwordInput, 'password123')
    
    const submitButton = screen.getByRole('button', { name: '로그인' })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('올바른 이메일 형식이 아닙니다')).toBeInTheDocument()
    })
  })

  it('비밀번호가 너무 짧은 경우 에러 메시지를 표시한다', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)
    
    const emailInput = screen.getByLabelText('이메일')
    const passwordInput = screen.getByLabelText('비밀번호')
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, '123')
    
    const submitButton = screen.getByRole('button', { name: '로그인' })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('비밀번호는 최소 8자 이상이어야 합니다')).toBeInTheDocument()
    })
  })

  it('유효한 데이터로 로그인이 성공하면 메인 페이지로 리다이렉션된다', async () => {
    const user = userEvent.setup()
    mockSupabase.auth.signInWithPassword.mockResolvedValue({ error: null })
    
    render(<LoginForm />)
    
    const emailInput = screen.getByLabelText('이메일')
    const passwordInput = screen.getByLabelText('비밀번호')
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    
    const submitButton = screen.getByRole('button', { name: '로그인' })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  it('잘못된 로그인 정보 시 적절한 메시지를 표시한다', async () => {
    const user = userEvent.setup()
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      error: { message: 'Invalid login credentials' }
    })
    
    render(<LoginForm />)
    
    const emailInput = screen.getByLabelText('이메일')
    const passwordInput = screen.getByLabelText('비밀번호')
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'wrongpassword')
    
    const submitButton = screen.getByRole('button', { name: '로그인' })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('이메일 또는 비밀번호가 올바르지 않습니다.')).toBeInTheDocument()
    })
  })

  it('로그인 중 로딩 상태를 표시한다', async () => {
    const user = userEvent.setup()
    mockSupabase.auth.signInWithPassword.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ error: null }), 100))
    )
    
    render(<LoginForm />)
    
    const emailInput = screen.getByLabelText('이메일')
    const passwordInput = screen.getByLabelText('비밀번호')
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    
    const submitButton = screen.getByRole('button', { name: '로그인' })
    await user.click(submitButton)
    
    expect(screen.getByText('로그인 중...')).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })

  it('접근성 속성이 올바르게 설정되어 있다', () => {
    render(<LoginForm />)
    
    const emailInput = screen.getByLabelText('이메일')
    const passwordInput = screen.getByLabelText('비밀번호')
    
    expect(emailInput).toHaveAttribute('aria-invalid', 'false')
    expect(passwordInput).toHaveAttribute('aria-invalid', 'false')
  })

  it('회원가입 링크가 올바르게 작동한다', () => {
    render(<LoginForm />)
    
    const signupLink = screen.getByRole('link', { name: '회원가입' })
    expect(signupLink).toHaveAttribute('href', '/auth/signup')
  })
})
