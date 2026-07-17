import React from 'react'

function App() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 text-white p-4">
      <div className="rounded-2xl bg-slate-800 p-8 shadow-2xl border border-slate-700 max-w-sm text-center">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500 mb-4">
          준비 완료! 🚀
        </h1>
        <p className="text-slate-400 leading-relaxed mb-6">
          Vite + React + Tailwind v4 세팅이 완벽하게 완료되었습니다. 이제 본격적으로 개발을 시작할 수 있습니다!
        </p>
        <button className="px-6 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-blue-600 font-semibold hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-teal-500/20">
          시작하기
        </button>
      </div>
    </div>
  )
}

export default App