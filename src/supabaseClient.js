import { createClient } from '@supabase/supabase-js'

// .env.local에 저장해둔 환경변수 값을 안전하게 가져옵니다.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 프로젝트 어디서든 쓸 수 있는 Supabase 연결 통로를 만들어 내보냅니다.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)