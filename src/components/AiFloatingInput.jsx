import React, { useState, useRef } from 'react'
import { Mic, Loader2 } from 'lucide-react'

export default function AiFloatingInput({ newScheduleInput, setNewScheduleInput, isAnalyzing, onAnalyze }) {
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef(null)

  const handleToggleListening = () => {
    if (isListening) { if (recognitionRef.current) recognitionRef.current.stop(); setIsListening(false); return; }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) { alert("이 브라우저는 음성 인식을 지원하지 않습니다."); return; }
    const recognition = new SpeechRecognition()
    recognition.lang = 'ko-KR'; recognition.interimResults = false; recognition.maxAlternatives = 1;
    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onerror = (event) => { setIsListening(false); if (event.error === 'not-allowed') alert("마이크 권한을 허용해 주세요!"); }
    recognition.onresult = (event) => { setNewScheduleInput(event.results[0][0].transcript) }
    recognitionRef.current = recognition
    recognition.start()
  }

  return (
    // 💡 [반응형] 모바일에서는 바닥 여백(bottom-4)과 좌우 패딩을 조절합니다.
    <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 w-[95%] sm:w-full max-w-5xl z-40">
      <div className="bg-white/90 border-2 border-neutral-950 rounded-full py-2 sm:py-3 px-3 sm:px-6 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.15)] backdrop-blur-md flex gap-2 sm:gap-3 items-center">
        
        <button type="button" onClick={handleToggleListening}
          className={`p-2 sm:p-2.5 border rounded-full transition-all cursor-pointer flex-shrink-0 ${isListening ? 'bg-neutral-950 text-white border-neutral-950 animate-pulse scale-105' : 'bg-neutral-50 text-neutral-400 hover:text-neutral-900 border-neutral-200 active:bg-neutral-100'}`}>
          <Mic size={14} className="sm:w-4 sm:h-4" />
        </button>

        <input type="text" value={newScheduleInput} onChange={(e) => setNewScheduleInput(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter' && !isAnalyzing) onAnalyze(); }} placeholder={isListening ? "듣고 있습니다..." : "대충 말해도 괜찮아요"}
          className="flex-1 bg-transparent py-1 text-xs sm:text-sm text-neutral-950 outline-none placeholder-neutral-400 font-medium" disabled={isAnalyzing || isListening} />

        <button onClick={onAnalyze} disabled={isAnalyzing || isListening}
          className="rounded-full bg-neutral-950 px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-neutral-800 active:scale-95 transition-all flex items-center gap-1 sm:gap-2 cursor-pointer flex-shrink-0">
          {isAnalyzing && <Loader2 size={12} className="animate-spin" />}
          <span>{isAnalyzing ? '분석 중' : '분석'}</span>
        </button>
      </div>
    </div>
  )
}