import React, { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // 기존 이메일 인증 핸들러 (그대로 유지)
  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setErrorMsg('')

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMessage('회원가입 확인 메일이 발송되었습니다.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (err) {
      setErrorMsg(err.message || '인증에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 💡 [추가] 구글 계정 OAuth 로그인 연동 함수
  const handleGoogleLogin = async () => {
    setLoading(true)
    setMessage('')
    setErrorMsg('')
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin // 로그인 완료 후 다시 내 서비스 홈으로 복귀
        }
      })
      if (error) throw error
    } catch (err) {
      setErrorMsg(err.message || '구글 로그인에 실패했습니다.')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4 text-neutral-900 font-sans antialiased">
      <div className="w-full max-w-sm px-4">
        {/* 상단 타이틀 영역 */}
        <div className="mb-10 text-left">
          <div className="flex items-baseline gap-1.5">
            <h1 className="text-xl font-bold tracking-tight text-neutral-950">Ai-Calendar</h1>
            <span className="text-xs font-semibold text-neutral-400 tracking-wider">A·C</span>
          </div>
          <p className="mt-1 text-xs text-neutral-500">
            {isSignUp ? '새로운 계정을 생성합니다.' : '말 한마디로 정리되는 하루'}
          </p>
        </div>

        {/* 폼 입력 영역 */}
        <form onSubmit={handleAuth} className="space-y-6">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-neutral-700">이메일</label>
            <input
              type="email"
              placeholder="jiwoo@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-sm border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-950 outline-none transition-colors focus:border-neutral-900"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-neutral-700">비밀번호</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-sm border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-950 outline-none transition-colors focus:border-neutral-900"
              required
            />
          </div>

          {errorMsg && <div className="text-xs text-neutral-500 border border-neutral-200 p-2 bg-neutral-50">{errorMsg}</div>}
          {message && <div className="text-xs text-neutral-600 border border-neutral-200 p-2 bg-neutral-50">{message}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-sm bg-neutral-950 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 active:opacity-100 disabled:opacity-40"
          >
            {loading ? '처리 중...' : isSignUp ? '회원가입' : '로그인'}
          </button>
        </form>

        {/* 구분선 */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute w-full border-t border-neutral-200"></div>
          <span className="relative bg-white px-3 text-xs text-neutral-400">또는</span>
        </div>

        {/* 💡 [연동] 구글 로그인 함수(handleGoogleLogin)를 onClick에 바인딩하고 로딩 시 비활성화 처리 */}
        <button 
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full rounded-sm border border-neutral-300 bg-white py-2.5 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-50 flex items-center justify-center gap-2 disabled:opacity-40"
        >
          {/* 미니멀한 무드의 구글 G 로고 패스 */}
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0112 4.909c1.69 0 3.218.6 4.418 1.582l3.51-3.51C17.842 1.036 15.114 0 12 0 7.354 0 3.336 2.686 1.346 6.623l3.92 3.142z"/>
            <path fill="#4285F4" d="M23.49 12.275c0-.825-.074-1.62-.21-2.386H12v4.512h6.446a5.51 5.51 0 01-2.39 3.613l3.715 2.88c2.172-2.002 3.429-4.945 3.429-8.62z"/>
            <path fill="#FBBC05" d="M5.266 14.235l-3.92 3.142A11.933 11.933 0 0012 24c3.114 0 5.842-1.01 7.772-2.738l-3.715-2.88a7.117 7.117 0 01-4.057 1.137 7.077 7.077 0 01-6.734-4.856z"/>
            <path fill="#34A853" d="M1.346 6.623A11.895 11.895 0 000 12c0 1.927.457 3.75 1.272 5.378l3.994-3.143A7.126 7.126 0 014.91 12c0-2.046.866-3.896 2.257-5.207L1.346 6.623z"/>
          </svg>
          <span>Google 계정으로 계속하기</span>
        </button>

        {/* 토글 버튼 */}
        <div className="mt-8 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp)
              setErrorMsg('')
              setMessage('')
            }}
            className="text-xs text-neutral-400 hover:text-neutral-600 underline underline-offset-4"
          >
            {isSignUp ? '이미 계정이 있으신가요? 로그인' : '처음이신가요? 회원가입하기'}
          </button>
        </div>
      </div>
    </div>
  )
}