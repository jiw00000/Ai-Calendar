import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Trash2, ChevronDown } from 'lucide-react' // 💡 ChevronDown 추가

export default function Calendar({ events, selectedDate, setSelectedDate, onDeleteEvent }) {
  // 1. 컴퓨터의 현재 날짜를 기준으로 최초 연/월 상태 설정
  const initialDate = new Date(selectedDate);
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear() || 2026);
  const [currentMonth, setCurrentMonth] = useState((initialDate.getMonth() + 1) || 7);

  // 2024년부터 2040년까지의 미래 확장 년도 데이터
  const yearOptions = Array.from({ length: 2040 - 2024 + 1 }, (_, i) => 2024 + i);

  // 2. 선택된 년/월에 맞게 42일(6주)의 달력 격자 데이터를 실시간 생성하는 함수
  const generateCalendarDays = (year, month) => {
    const firstDayInstance = new Date(year, month - 1, 1);
    const firstDayOfWeek = firstDayInstance.getDay();
    const paddingDaysStart = (firstDayOfWeek + 6) % 7;
    const startDate = new Date(year, month - 1, 1 - paddingDaysStart);
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      const currentCellDate = new Date(startDate);
      currentCellDate.setDate(startDate.getDate() + i);
      
      const y = currentCellDate.getFullYear();
      const m = String(currentCellDate.getMonth() + 1).padStart(2, '0');
      const d = String(currentCellDate.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${d}`;

      days.push({
        day: currentCellDate.getDate(),
        isCurrentMonth: currentCellDate.getMonth() === (month - 1),
        dateStr
      });
    }
    return days;
  };

  const baseCalendarDays = generateCalendarDays(currentYear, currentMonth);

  // 월 전환 핸들러 (이전 달)
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(prev => Math.max(2024, prev - 1));
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  }

  // 월 전환 핸들러 (다음 달)
  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(prev => Math.min(2040, prev + 1));
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  }

  const monthsEng = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  const selectedDateEvents = (events || [])
    .filter(e => e.date === selectedDate)
    .sort((a, b) => (a.time || '23:59').localeCompare(b.time || '23:59'));

  return (
    <div className="space-y-6">
      
      {/* 달력 상단 헤더 영역 */}
      <div className="flex justify-between items-center">
        
        {/* 💡 [디자인 대수정] 테두리 박스를 완전히 제거하고 글자 오른쪽에 아래 화살표 배치 */}
        <div className="flex items-center gap-5 text-base font-bold text-neutral-950 select-none">
          
          {/* 년도 드롭다운 패키지 */}
          <div className="relative flex items-center group">
            <select 
              value={currentYear} 
              onChange={(e) => setCurrentYear(Number(e.target.value))}
              className="bg-transparent outline-none cursor-pointer border-none font-bold text-neutral-950 appearance-none text-base pr-4 hover:text-neutral-600 transition-colors z-10"
            >
              {yearOptions.map(y => (
                <option key={y} value={y}>{y}년</option>
              ))}
            </select>
            {/* 텍스트 바로 오른쪽에 배치되는 미니멀 아래 화살표 */}
            <ChevronDown size={14} className="absolute right-0 text-neutral-400 group-hover:text-neutral-900 pointer-events-none transition-colors" />
          </div>

          {/* 월 드롭다운 패키지 */}
          <div className="relative flex items-center group">
            <select 
              value={currentMonth} 
              onChange={(e) => setCurrentMonth(Number(e.target.value))}
              className="bg-transparent outline-none cursor-pointer border-none font-bold text-neutral-950 appearance-none text-base pr-4 hover:text-neutral-600 transition-colors z-10"
            >
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                <option key={m} value={m}>{m}월</option>
              ))}
            </select>
            {/* 텍스트 바로 오른쪽에 배치되는 미니멀 아래 화살표 */}
            <ChevronDown size={14} className="absolute right-0 text-neutral-400 group-hover:text-neutral-900 pointer-events-none transition-colors" />
          </div>

        </div>

        {/* 우측 월 이동 단축 버튼 */}
        <div className="flex items-center gap-3 text-neutral-400 text-xs font-mono select-none">
          <button onClick={handlePrevMonth} className="hover:text-neutral-900 cursor-pointer"><ChevronLeft size={16} /></button>
          <span className="tracking-widest w-8 text-center">{monthsEng[currentMonth - 1]}</span>
          <button onClick={handleNextMonth} className="hover:text-neutral-900 cursor-pointer"><ChevronRight size={16} /></button>
        </div>
      </div>

      {/* 달력 판 그리드 */}
      <div className="border-t border-l border-neutral-200 grid grid-cols-7 text-center">
        {['월', '화', '수', '목', '금', '토', '일'].map((day) => (
          <div key={day} className="border-b border-r border-neutral-200 py-2 text-xs font-medium text-neutral-400 bg-neutral-50/50">{day}</div>
        ))}
        
        {baseCalendarDays.map((cell, idx) => {
          const matchingEvents = (events || [])
            .filter(e => e.date === cell.dateStr)
            .sort((a, b) => (a.time || '23:59').localeCompare(b.time || '23:59'));
          
          const isSelected = selectedDate === cell.dateStr;
          const isToday = cell.dateStr === new Date().toLocaleDateString('sv-SE');

          return (
            <div 
              key={idx} 
              onClick={() => setSelectedDate(cell.dateStr)}
              className={`border-b border-r border-neutral-200 p-1.5 h-[104px] text-left text-xs font-mono space-y-1 cursor-pointer transition-colors relative select-none ${
                cell.isCurrentMonth ? 'text-neutral-500' : 'text-neutral-300 bg-neutral-50/10'
              } ${isSelected ? 'bg-neutral-950/[0.03] ring-1 ring-inset ring-neutral-950' : 'hover:bg-neutral-50/50'}`}
            >
              <div className="flex justify-between items-center">
                {isToday ? (
                  <span className="w-5 h-5 flex items-center justify-center bg-neutral-950 text-white rounded-full font-bold text-[10px]">{cell.day}</span>
                ) : (
                  <span className={isSelected ? 'font-bold text-neutral-950' : ''}>
                    {cell.day < 10 && cell.isCurrentMonth ? `0${cell.day}` : cell.day}
                  </span>
                )}
              </div>
              
              <div className="space-y-0.5 overflow-hidden">
                {matchingEvents.slice(0, 2).map(event => (
                  <div 
                    key={event.id} 
                    style={{ borderColor: event.color }} 
                    className="border-l-2 pl-1.5 py-0.5 text-[10px] leading-tight text-neutral-700 bg-neutral-50/50 break-all"
                  >
                    {event.title}
                  </div>
                ))}
                {matchingEvents.length > 2 && (
                  <div className="text-[9px] text-neutral-400 font-sans pl-1.5 pt-0.5">
                    + {matchingEvents.length - 2}개 더
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 하단 상세 계획 영역 */}
      <div className="border border-neutral-200 p-4 space-y-3 bg-white">
        <div className="flex justify-between items-baseline border-b border-neutral-100 pb-2">
          <h4 className="text-xs font-bold text-neutral-900 tracking-wide">
            {selectedDate.replace(/-/g, '.')} 상세 일정
          </h4>
          <span className="text-[10px] font-mono text-neutral-400">{(selectedDateEvents || []).length}개의 계획</span>
        </div>
        
        {selectedDateEvents.length === 0 ? (
          <p className="text-xs text-neutral-400 py-2">등록된 일정이 없습니다.</p>
        ) : (
          <div className="space-y-2.5 max-h-48 overflow-y-auto">
            {selectedDateEvents.map(event => (
              <div key={event.id} className="flex items-center gap-3 py-1 text-sm group">
                <span style={{ backgroundColor: event.color || '#404040' }} className="w-1.5 h-3 block flex-shrink-0"></span>
                <span className="font-mono text-neutral-400 text-xs w-10 flex-shrink-0">
                  {event.time || '종일'}
                </span>
                <span className="text-neutral-800 font-medium">{event.title}</span>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteEvent(event.id);
                  }}
                  className="text-neutral-300 hover:text-neutral-600 ml-auto transition-all p-1 cursor-pointer opacity-0 group-hover:opacity-100"
                  title="일정 삭제"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}