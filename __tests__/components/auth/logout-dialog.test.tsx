// __tests__/components/auth/logout-dialog.test.tsx
// 로그아웃 다이얼로그 컴포넌트 단위 테스트
// 다이얼로그 렌더링, 사용자 상호작용, Supabase Auth 연동을 테스트
// 관련 파일: components/auth/logout-dialog.tsx, lib/supabase.ts

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import LogoutDialog from '@/components/auth/logout-dialog'
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
    signOut: jest.fn(),
  },
}

describe('LogoutDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
    ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
  })

  it('다이얼로그가 열렸을 때 올바르게 렌더링된다', () => {
    render(<LogoutDialog open={true} onOpenChange={jest.fn()} />)
    
    expect(screen.getByText('로그아웃 확인')).toBeInTheDocument()
    expect(screen.getByText('정말로 로그아웃하시겠습니까? 로그아웃하면 현재 세션이 종료됩니다.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '로그아웃' })).toBeInTheDocument()
  })

  it('다이얼로그가 닫혔을 때 렌더링되지 않는다', () => {
    render(<LogoutDialog open={false} onOpenChange={jest.fn()} />)
    
    expect(screen.queryByText('로그아웃 확인')).not.toBeInTheDocument()
  })

  it('취소 버튼 클릭 시 다이얼로그가 닫힌다', async () => {
    const user = userEvent.setup()
    const mockOnOpenChange = jest.fn()
    
    render(<LogoutDialog open={true} onOpenChange={mockOnOpenChange} />)
    
    const cancelButton = screen.getByRole('button', { name: '취소' })
    await user.click(cancelButton)
    
    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('로그아웃 버튼 클릭 시 로그아웃이 성공하면 다이얼로그가 닫히고 메인 페이지로 리다이렉션된다', async () => {
    const user = userEvent.setup()
    const mockOnOpenChange = jest.fn()
    mockSupabase.auth.signOut.mockResolvedValue({ error: null })
    
    render(<LogoutDialog open={true} onOpenChange={mockOnOpenChange} />)
    
    const logoutButton = screen.getByRole('button', { name: '로그아웃' })
    await user.click(logoutButton)
    
    await waitFor(() => {
      expect(mockSupabase.auth.signOut).toHaveBeenCalled()
      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  it('로그아웃 실패 시 에러 메시지를 표시한다', async () => {
    const user = userEvent.setup()
    mockSupabase.auth.signOut.mockResolvedValue({
      error: { message: 'Logout failed' }
    })
    
    render(<LogoutDialog open={true} onOpenChange={jest.fn()} />)
    
    const logoutButton = screen.getByRole('button', { name: '로그아웃' })
    await user.click(logoutButton)
    
    await waitFor(() => {
      expect(screen.getByText('로그아웃 중 오류가 발생했습니다. 다시 시도해주세요.')).toBeInTheDocument()
    })
  })

  it('로그아웃 중 로딩 상태를 표시한다', async () => {
    const user = userEvent.setup()
    mockSupabase.auth.signOut.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ error: null }), 100))
    )
    
    render(<LogoutDialog open={true} onOpenChange={jest.fn()} />)
    
    const logoutButton = screen.getByRole('button', { name: '로그아웃' })
    await user.click(logoutButton)
    
    expect(screen.getByText('로그아웃 중...')).toBeInTheDocument()
    expect(logoutButton).toBeDisabled()
    expect(screen.getByRole('button', { name: '취소' })).toBeDisabled()
  })

  it('에러 발생 후 취소 버튼 클릭 시 에러가 초기화된다', async () => {
    const user = userEvent.setup()
    const mockOnOpenChange = jest.fn()
    mockSupabase.auth.signOut.mockResolvedValue({
      error: { message: 'Logout failed' }
    })
    
    render(<LogoutDialog open={true} onOpenChange={mockOnOpenChange} />)
    
    // 먼저 로그아웃 실패를 발생시킴
    const logoutButton = screen.getByRole('button', { name: '로그아웃' })
    await user.click(logoutButton)
    
    await waitFor(() => {
      expect(screen.getByText('로그아웃 중 오류가 발생했습니다. 다시 시도해주세요.')).toBeInTheDocument()
    })
    
    // 취소 버튼 클릭
    const cancelButton = screen.getByRole('button', { name: '취소' })
    await user.click(cancelButton)
    
    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('접근성 속성이 올바르게 설정되어 있다', () => {
    render(<LogoutDialog open={true} onOpenChange={jest.fn()} />)
    
    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
    
    const cancelButton = screen.getByRole('button', { name: '취소' })
    const logoutButton = screen.getByRole('button', { name: '로그아웃' })
    
    expect(cancelButton).toBeInTheDocument()
    expect(logoutButton).toBeInTheDocument()
  })

})
