// drizzle.config.ts
// Drizzle Kit 설정 파일
// 프로젝트 루트에 위치하여 마이그레이션 및 스키마 관리를 담당

import dotenv from 'dotenv'
dotenv.config({path:'.env.local'})

import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './drizzle/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
