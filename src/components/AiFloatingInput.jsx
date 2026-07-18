import React, { useState, useRef } from 'react'
import { Mic, Loader2 } from 'lucide-react'

export default function AiFloatingInput({ newScheduleInput, setNewScheduleInput, isAnalyzing, onAnalyze }) {
  // 💡 음성 인식 중인지 상태 관리
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef(null)

  // 🎙️ 음성 인식 토글 함수 (Web Speech API 활용)
  const handleToggleListening = () => {
    // 1. 이미 듣고 있는 상태면 멈춤
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      setIsListening(false)
      return
    }

    // 2. 브라우저 지원 여부 확인 (Chrome, Safari 등 대다수 현대 브라우저 지원)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert("이 브라우저는 음성 인식을 지원하지 않습니다.")
      return
    }

    // 3. 음성 인식 객체 생성 및 세팅
    const recognition = new SpeechRecognition()
    recognition.lang = 'ko-KR'          // 한국어 설정
    recognition.interimResults = false // 중간 결과는 생략하고 최종 결과만 받아오기
    recognition.maxAlternatives = 1    // 가장 정확한 분석 후보 1개만 채택

    // 4. 이벤트 리스너 바인딩
    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.onerror = (event) => {
      console.error("음성 인식 오류 발생:", event.error)
      setIsListening(false)
      if (event.error === 'not-allowed') {
        alert("마이크 권한이 거부되었습니다. 주소창 왼쪽의 자물쇠 아이콘을 눌러 마이크 권한을 허용해 주세요!")
      }
    }

    // 5. 음성이 성공적으로 텍스트로 치환되었을 때 실행
    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript
      // 인식된 목소리 텍스트를 인풋 창에 주입!
      setNewScheduleInput(speechToText)
    }

    // 6. 음성 인식 진짜 가동
    recognitionRef.current = recognition
    recognition.start()
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-5xl px-4 z-40">
      <div className="bg-white border-2 border-neutral-950 rounded-full py-3 px-6 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.15)] backdrop-blur-md flex gap-3 items-center">
        
        {/* 마이크 음성 입력 버튼 (💡 상태에 따라 실시간 디자인 변경) */}
        <button 
          type="button"
          onClick={handleToggleListening}
          className={`p-2.5 border rounded-full transition-all cursor-pointer flex-shrink-0 ${
            isListening 
              ? 'bg-neutral-950 text-white border-neutral-950 animate-pulse scale-105' 
              : 'bg-neutral-50 text-neutral-400 hover:text-neutral-900 border-neutral-200 active:bg-neutral-100'
          }`}
          title={isListening ? "음성 인식 중단" : "음성 인식 시작"}
        >
          <Mic size={16} />
        </button>

        {/* 인풋 영역 (💡 음성 인식 중일 때는 placeholder 멘트 변경) */}
        <input
          type="text"
          value={newScheduleInput}
          onChange={(e) => setNewScheduleInput(e.target.value)}
          onKeyDown={(e) => { if(e.key === 'Enter' && !isAnalyzing) onAnalyze(); }}
          placeholder={isListening ? "듣고 있습니다..." : "대충 말해도 괜찮아요 - 예: 내일 오후 3시 알바 면접"}
          className="flex-1 bg-transparent py-1 text-sm text-neutral-950 outline-none placeholder-neutral-400 font-medium"
          disabled={isAnalyzing || isListening} // 분석 중이거나 듣고 있을 땐 타이핑 잠금
        />

        {/* 분석 버튼 */}
        <button 
          onClick={onAnalyze}
          className="rounded-full bg-neutral-950 px-6 py-2.5 text-sm font-bold text-white hover:bg-neutral-800 active:scale-95 transition-all flex items-center gap-2 cursor-pointer flex-shrink-0"
          disabled={isAnalyzing || isListening}
        >
          {isAnalyzing && <Loader2 size={14} className="animate-spin" />}
          <span>{isAnalyzing ? '분석 중' : '분석'}</span>
        </button>
        
      </div>
    </div>
  )
}