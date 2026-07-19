import React from 'react'

export default function AiResultModal({ isOpen, onClose, title, setTitle, startDate, setStartDate, endDate, setEndDate, time, setTime, duration, setDuration, category, setCategory, onSave, isEditing, darkMode }) {
  if (!isOpen) return null

  const colors = [
    { name: '민트', class: 'bg-[#76cca6]' }, { name: '코랄', class: 'bg-[#e77471]' }, { name: '그린', class: 'bg-[#b6cdac]' }, { name: '소프트 라벤더', class: 'bg-[#d1c4e9]' }, { name: '베이지', class: 'bg-[#e1d3c7]' }
  ]

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-none">
      <div className={`rounded-xl p-5 sm:p-8 w-full max-w-lg shadow-[0_20px_50px_rgba(0,0,0,0.2)] border space-y-5 sm:space-y-6 ${darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-100'}`}>
        
        <div className="space-y-0.5">
          <h3 className={`text-lg font-bold tracking-tight ${darkMode ? 'text-white' : 'text-neutral-950'}`}>
            {isEditing ? '일정 수정' : '새로운 일정 등록'}
          </h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-500">제목</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              className={`w-full border rounded-lg px-4 py-3 text-sm outline-none font-medium transition-all ${darkMode ? 'bg-neutral-950 border-neutral-800 text-white focus:border-neutral-600' : 'bg-white border-neutral-200 text-neutral-900 focus:border-neutral-900'}`} />
          </div>

          {/* 💡 [반응형 핵심] 모바일(기본)에서는 grid-cols-1 로 한 줄에 하나씩, 화면이 커지면(sm) grid-cols-2 로 바뀝니다. */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-500">시작 날짜</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                className={`w-full border rounded-lg px-4 py-3 text-sm outline-none font-medium font-mono transition-all ${darkMode ? 'bg-neutral-950 border-neutral-800 text-white focus:border-neutral-600' : 'bg-white border-neutral-200 text-neutral-900 focus:border-neutral-900'}`} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-500">종료 날짜</label>
              <input type="date" value={endDate} min={startDate} onChange={(e) => setEndDate(e.target.value)}
                className={`w-full border rounded-lg px-4 py-3 text-sm outline-none font-medium font-mono transition-all ${darkMode ? 'bg-neutral-950 border-neutral-800 text-white focus:border-neutral-600' : 'bg-white border-neutral-200 text-neutral-900 focus:border-neutral-900'}`} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-500">시작 시간 (비워둘 시 To-do)</label>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
                className={`w-full border rounded-lg px-4 py-3 text-sm outline-none font-medium font-mono transition-all ${darkMode ? 'bg-neutral-950 border-neutral-800 text-white focus:border-neutral-600' : 'bg-white border-neutral-200 text-neutral-900 focus:border-neutral-900'}`} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-500">진행 시간</label>
              <div className="relative flex items-center">
                <input type="number" step="0.5" min="0.5" max="24" value={duration || 1} onChange={(e) => setDuration(Number(e.target.value))}
                  className={`w-full border rounded-lg px-4 py-3 text-sm outline-none font-bold font-mono transition-all pr-20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${darkMode ? 'bg-neutral-950 border-neutral-800 text-white focus:border-neutral-600' : 'bg-white border-neutral-200 text-neutral-900 focus:border-neutral-900'}`} />
                <span className="absolute right-4 text-xs font-bold text-neutral-400 font-sans pointer-events-none">시간 동안</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <label className="text-xs font-bold text-neutral-500">카테고리: <span className={`font-extrabold ${darkMode ? 'text-white' : 'text-neutral-800'}`}>{category}</span></label>
            <div className="flex gap-3 items-center">
              {colors.map((c) => (
                <button key={c.name} onClick={() => setCategory(c.name)} className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full cursor-pointer transition-all ${c.class} ${category === c.name ? 'ring-2 ring-offset-2 ring-neutral-500 scale-110 shadow-sm' : 'hover:scale-105 opacity-80 hover:opacity-100'}`} />
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button onClick={onClose} className={`border font-bold py-3 sm:py-3.5 rounded-lg text-sm transition-all cursor-pointer ${darkMode ? 'border-neutral-800 text-neutral-300 hover:bg-neutral-800' : 'border-neutral-200 text-neutral-800 hover:bg-neutral-50'}`}>취소</button>
          <button onClick={onSave} className={`font-bold py-3 sm:py-3.5 rounded-lg text-sm transition-all cursor-pointer shadow-md ${darkMode ? 'bg-white text-neutral-900 hover:bg-neutral-200' : 'bg-neutral-950 text-white hover:bg-neutral-900'}`}>저장</button>
        </div>
      </div>
    </div>
  )
}