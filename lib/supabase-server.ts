// lib/supabase-server.ts
// 서버 사이드용 Supabase 클라이언트 설정 파일
// Server Actions와 Server Components에서 사용
// 관련 파일: lib/actions/ai.ts, lib/actions/notes.ts

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// 서버 사이드용 Supabase 클라이언트 (Server Actions에서 사용)
export async function createSupabaseServerClient() {
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

