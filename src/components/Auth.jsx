import React, { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

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

        {/* 소셜 로그인 버튼 */}
        <button className="w-full rounded-sm border border-neutral-300 bg-white py-2.5 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-50">
          Google 계정으로 계속하기
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