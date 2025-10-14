// lib/db.ts
// 데이터베이스 연결 설정 파일
// Supabase Postgres와의 연결을 위한 Drizzle 클라이언트 구성

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// 환경 변수에서 데이터베이스 URL 가져오기
const connectionString = process.env.DATABASE_URL!;

// Postgres 클라이언트 생성
const client = postgres(connectionString, { prepare: false });

// Drizzle 클라이언트 생성
export const db = drizzle(client);
