import React from 'react'
import { Mic, Loader2 } from 'lucide-react'

export default function AiFloatingInput({ newScheduleInput, setNewScheduleInput, isAnalyzing, onAnalyze }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-5xl px-4 z-40">
      <div className="bg-white border-2 border-neutral-950 rounded-full py-3 px-6 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.15)] backdrop-blur-md flex gap-3 items-center">
        
        {/* 마이크 버튼 */}
        <button 
          type="button"
          className="p-2.5 text-neutral-400 hover:text-neutral-900 border border-neutral-200 rounded-full bg-neutral-50 active:bg-neutral-100 transition-colors cursor-pointer"
          title="음성 인식 시작"
        >
          <Mic size={16} />
        </button>

        {/* 인풋 영역 */}
        <input
          type="text"
          value={newScheduleInput}
          onChange={(e) => setNewScheduleInput(e.target.value)}
          onKeyDown={(e) => { if(e.key === 'Enter' && !isAnalyzing) onAnalyze(); }}
          placeholder="대충 말해도 괜찮아요 - 예: 내일 오후 3시 알바 면접"
          className="flex-1 bg-transparent py-1 text-sm text-neutral-950 outline-none placeholder-neutral-400 font-medium"
          disabled={isAnalyzing}
        />

        {/* 분석 버튼 (상시 활성화) */}
        <button 
          onClick={onAnalyze}
          className="rounded-full bg-neutral-950 px-6 py-2.5 text-sm font-bold text-white hover:bg-neutral-800 active:scale-95 transition-all flex items-center gap-2 cursor-pointer flex-shrink-0"
          disabled={isAnalyzing}
        >
          {isAnalyzing && <Loader2 size={14} className="animate-spin" />}
          <span>{isAnalyzing ? '분석 중' : '분석'}</span>
        </button>
        
      </div>
    </div>
  )
}