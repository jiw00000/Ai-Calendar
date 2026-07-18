import React from 'react'

export default function AiResultModal({ 
  isOpen, 
  onClose, 
  title, 
  setTitle, 
  startDate,      
  setStartDate, 
  endDate,        
  setEndDate,     
  time, 
  setTime,
  duration,       // 💡 당일 일정의 정밀 추적을 위해 화려하게 복귀!
  setDuration,    
  category, 
  setCategory, 
  onSave 
}) {
  if (!isOpen) return null

  const colors = [
    { name: '민트', class: 'bg-[#76cca6]' },
    { name: '코랄', class: 'bg-[#e77471]' },
    { name: '그린', class: 'bg-[#b6cdac]' },
    { name: '소프트 라벤더', class: 'bg-[#d1c4e9]' },
    { name: '베이지', class: 'bg-[#e1d3c7]' }
  ]

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-none">
      <div className="bg-white rounded-xl p-8 w-full max-w-lg shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-neutral-100 space-y-6">
        
        {/* 헤더 타이틀 */}
        <div className="space-y-1">
          <p className="text-xs text-neutral-400 font-bold tracking-wider">AI 분석 결과</p>
          <h3 className="text-xl font-extrabold text-neutral-900 tracking-tight">
            분석된 정밀 데이터를 확인해 주세요
          </h3>
        </div>

        {/* 폼 본문 영역 */}
        <div className="space-y-4">
          
          {/* 1열: 제목 입력 필드 */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-500">제목</label>
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-neutral-200 rounded-lg px-4 py-3 text-sm text-neutral-900 focus:border-neutral-900 outline-none font-medium transition-all"
            />
          </div>

          {/* 2열: 기간형 일정을 위한 날짜 연동 그리드 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-500">시작 날짜</label>
              <input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-neutral-200 rounded-lg px-4 py-3 text-sm text-neutral-900 focus:border-neutral-900 outline-none font-medium font-mono transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-500">종료 날짜</label>
              <input 
                type="date"
                value={endDate}
                min={startDate} 
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-neutral-200 rounded-lg px-4 py-3 text-sm text-neutral-900 focus:border-neutral-900 outline-none font-medium font-mono transition-all"
              />
            </div>
          </div>

          {/* 💡 3열: 당일 시간 단위 일정을 위한 정밀 시각/진행시간 그리드 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-500">시작 시간 (비워둘 시 To-do)</label>
              <input 
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full border border-neutral-200 rounded-lg px-4 py-3 text-sm text-neutral-900 focus:border-neutral-900 outline-none font-medium font-mono transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-500">진행 시간</label>
              <div className="relative flex items-center">
                <input 
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="24"
                  value={duration || 1}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  // 💡 화살표 스핀 마크를 강제 무력화하고 우측 여백 패딩을 완벽 조율하여 글자 겹침을 완전 차단
                  className="w-full border border-neutral-200 rounded-lg px-4 py-3 text-sm text-neutral-900 focus:border-neutral-900 outline-none font-bold font-mono transition-all pr-20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="absolute right-4 text-xs font-bold text-neutral-400 font-sans pointer-events-none">
                  시간 동안
                </span>
              </div>
            </div>
          </div>

          {/* 카테고리 컬러칩 영역 */}
          <div className="space-y-2 pt-1">
            <label className="text-xs font-bold text-neutral-500">
              카테고리: <span className="text-neutral-800 font-extrabold">{category}</span>
            </label>
            <div className="flex gap-3 items-center">
              {colors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setCategory(c.name)}
                  className={`w-8 h-8 rounded-full cursor-pointer transition-all ${c.class} ${
                    category === c.name 
                      ? 'ring-2 ring-offset-2 ring-neutral-950 scale-110 shadow-sm' 
                      : 'hover:scale-105 opacity-80 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

        </div>

        {/* 하단 버튼 바 */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={onClose}
            className="border border-neutral-200 text-neutral-800 font-bold py-3.5 rounded-lg text-sm hover:bg-neutral-50 active:scale-[0.99] transition-all cursor-pointer"
          >
            취소
          </button>
          <button
            onClick={onSave}
            className="bg-neutral-950 text-white font-bold py-3.5 rounded-lg text-sm hover:bg-neutral-900 active:scale-[0.99] transition-all cursor-pointer shadow-md"
          >
            최종 저장
          </button>
        </div>

      </div>
    </div>
  )
}