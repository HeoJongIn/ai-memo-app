// jest.setup.js
// Jest 테스트 환경 설정 파일
// 테스트 실행 전에 필요한 전역 설정과 모킹을 정의
// 관련 파일: jest.config.js, __tests__/components/auth/signup-form.test.tsx

import '@testing-library/jest-dom'

// Next.js Image 컴포넌트 모킹
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />
  },
}))

// Next.js Link 컴포넌트 모킹
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }) => {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    )
  },
}))

// 환경 변수 모킹
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
