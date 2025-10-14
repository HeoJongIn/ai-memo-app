// jest.config.js
// Jest 테스트 설정 파일
// React 컴포넌트와 Next.js 환경에서 테스트를 실행하기 위한 설정
// 관련 파일: __tests__/components/auth/signup-form.test.tsx

const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Next.js 앱의 경로를 제공
  dir: './',
})

// Jest에 전달할 사용자 정의 설정
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  collectCoverageFrom: [
    'components/**/*.{js,jsx,ts,tsx}',
    'app/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
}

// createJestConfig는 비동기적으로 설정을 로드하므로
// next/jest가 Next.js 설정을 로드할 수 있도록 허용
module.exports = createJestConfig(customJestConfig)
