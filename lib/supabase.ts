// lib/supabase.ts
// Supabase 클라이언트 설정 파일
// 클라이언트에서 Supabase 인스턴스를 생성하고 관리
// 관련 파일: app/layout.tsx, components/auth/signup-form.tsx

import { createBrowserClient } from '@supabase/ssr'

// 클라이언트 사이드용 Supabase 클라이언트
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
