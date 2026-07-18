import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Trash2, ChevronDown } from 'lucide-react' 

export default function Calendar({ events, selectedDate, setSelectedDate, onDeleteEvent, onEditEvent, darkMode }) {
  const initialDate = new Date(selectedDate);
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear() || 2026);
  const [currentMonth, setCurrentMonth] = useState((initialDate.getMonth() + 1) || 7);

  const yearOptions = Array.from({ length: 2040 - 2024 + 1 }, (_, i) => 2024 + i);

  const generateCalendarDays = (year, month) => {
    const firstDayInstance = new Date(year, month - 1, 1);
    const firstDayOfWeek = firstDayInstance.getDay();
    const paddingDaysStart = (firstDayOfWeek + 6) % 7;
    const startDate = new Date(year, month - 1, 1 - paddingDaysStart);
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      const currentCellDate = new Date(startDate);
      currentCellDate.setDate(startDate.getDate() + i);
      const d = String(currentCellDate.getDate()).padStart(2, '0');
      const dateStr = `${currentCellDate.getFullYear()}-${String(currentCellDate.getMonth() + 1).padStart(2, '0')}-${d}`;

      days.push({ day: currentCellDate.getDate(), isCurrentMonth: currentCellDate.getMonth() === (month - 1), dateStr });
    }
    return days;
  };

  const baseCalendarDays = generateCalendarDays(currentYear, currentMonth);

  const handlePrevMonth = () => {
    if (currentMonth === 1) { setCurrentMonth(12); setCurrentYear(prev => Math.max(2024, prev - 1)); } 
    else { setCurrentMonth(prev => prev - 1); }
  }
  const handleNextMonth = () => {
    if (currentMonth === 12) { setCurrentMonth(1); setCurrentYear(prev => Math.min(2040, prev + 1)); } 
    else { setCurrentMonth(prev => prev + 1); }
  }

  const monthsEng = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const selectedDateEvents = (events || []).filter(e => e.date === selectedDate).sort((a, b) => (a.time || '23:59').localeCompare(b.time || '23:59'));

  return (
    <div className="space-y-6">
      
      {/* 달력 상단 헤더 영역 */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-5 text-base font-bold select-none">
          <div className="relative flex items-center group">
            <select 
              value={currentYear} onChange={(e) => setCurrentYear(Number(e.target.value))}
              className={`bg-transparent outline-none cursor-pointer border-none font-bold appearance-none text-base pr-4 transition-colors z-10 ${
                darkMode ? 'text-white' : 'text-neutral-950'
              }`}
            >
              {yearOptions.map(y => (<option key={y} value={y} className={darkMode ? 'bg-neutral-950 text-white' : 'bg-white text-black'}>{y}년</option>))}
            </select>
            <ChevronDown size={14} className="absolute right-0 text-neutral-400 pointer-events-none" />
          </div>

          <div className="relative flex items-center group">
            <select 
              value={currentMonth} onChange={(e) => setCurrentMonth(Number(e.target.value))}
              className={`bg-transparent outline-none cursor-pointer border-none font-bold appearance-none text-base pr-4 transition-colors z-10 ${
                darkMode ? 'text-white' : 'text-neutral-950'
              }`}
            >
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (<option key={m} value={m} className={darkMode ? 'bg-neutral-950 text-white' : 'bg-white text-black'}>{m}월</option>))}
            </select>
            <ChevronDown size={14} className="absolute right-0 text-neutral-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-3 text-neutral-400 text-xs font-mono select-none">
          <button onClick={handlePrevMonth} className={`cursor-pointer ${darkMode ? 'hover:text-white' : 'hover:text-neutral-900'}`}><ChevronLeft size={16} /></button>
          <span className="tracking-widest w-8 text-center">{monthsEng[currentMonth - 1]}</span>
          <button onClick={handleNextMonth} className={`cursor-pointer ${darkMode ? 'hover:text-white' : 'hover:text-neutral-900'}`}><ChevronRight size={16} /></button>
        </div>
      </div>

      {/* 달력 판 그리드 (직각 테두리 완벽 유지) */}
      <div className={`border-t border-l grid grid-cols-7 text-center transition-colors ${darkMode ? 'border-neutral-800' : 'border-neutral-200'}`}>
        {['월', '화', '수', '목', '금', '토', '일'].map((day) => (
          <div key={day} className={`border-b border-r py-2 text-xs font-medium text-neutral-400 rounded-none ${darkMode ? 'border-neutral-800 bg-neutral-900/20' : 'border-neutral-200 bg-neutral-50/50'}`}>{day}</div>
        ))}
        
        {baseCalendarDays.map((cell, idx) => {
          const matchingEvents = (events || []).filter(e => e.date === cell.dateStr).sort((a, b) => (a.time || '23:59').localeCompare(b.time || '23:59'));
          const isSelected = selectedDate === cell.dateStr;
          const isToday = cell.dateStr === new Date().toLocaleDateString('sv-SE');
          
          const monthTextClass = cell.isCurrentMonth 
            ? (darkMode ? 'text-neutral-300' : 'text-neutral-500') 
            : (darkMode ? 'text-neutral-700' : 'text-neutral-300 bg-neutral-50/10');

          return (
            <div 
              key={idx} onClick={() => setSelectedDate(cell.dateStr)}
              className={`border-b border-r pt-2 pb-2 h-[104px] text-left text-xs font-mono flex flex-col cursor-pointer transition-colors relative select-none rounded-none ${monthTextClass} ${
                darkMode 
                  ? (isSelected ? 'bg-neutral-900 ring-1 ring-inset ring-neutral-700' : 'hover:bg-neutral-900/30') 
                  : (isSelected ? 'bg-neutral-950/[0.03] ring-1 ring-inset ring-neutral-950' : 'hover:bg-neutral-50/50')
              } ${darkMode ? 'border-neutral-800' : 'border-neutral-200'}`}
            >
              <div className="px-2 flex justify-between items-center mb-1.5">
                {isToday ? (
                  <span className={`w-5 h-5 flex items-center justify-center rounded-none font-bold text-[10px] ${darkMode ? 'bg-white text-neutral-950' : 'bg-neutral-950 text-white'}`}>{cell.day}</span>
                ) : (
                  <span className={isSelected ? (darkMode ? 'font-bold text-white' : 'font-bold text-neutral-950') : ''}>
                    {cell.day < 10 && cell.isCurrentMonth ? `0${cell.day}` : cell.day}
                  </span>
                )}
              </div>
              
              <div className="flex-1 flex flex-col gap-1 overflow-hidden justify-start">
                {matchingEvents.slice(0, 3).map(event => {
                  const isMulti = event.origStart && event.origEnd && (event.origStart !== event.origEnd);
                  const isStart = event.date === event.origStart;
                  const isEnd = event.date === event.origEnd;

                  if (isMulti) {
                    return (
                      <div 
                        key={event.id} style={{ backgroundColor: event.color }} onClick={(e) => { e.stopPropagation(); if(onEditEvent) onEditEvent(event); }}
                        className={`py-0.5 text-[10px] leading-tight text-neutral-700 truncate select-none transition-all hover:brightness-95 active:scale-[0.98] rounded-none ${
                          isStart ? 'ml-2 pl-2' : 'ml-0 pl-1.5'
                        } ${isEnd ? 'mr-2 pr-2' : 'mr-0 pr-1.5'}`}
                      >
                        {isStart || cell.day === 1 || idx % 7 === 0 ? event.title : "\u00A0"}
                      </div>
                    )
                  }

                  return (
                    <div 
                      key={event.id} style={{ borderColor: event.color }} onClick={(e) => { e.stopPropagation(); if(onEditEvent) onEditEvent(event); }}
                      className={`mx-2 border-l-2 pl-1.5 py-0.5 text-[10px] leading-tight break-all transition-colors ${
                        darkMode ? 'text-white bg-neutral-800/30 hover:bg-neutral-800/60' : 'text-neutral-700 bg-neutral-50/50 hover:bg-neutral-100'
                      }`}
                    >
                      {event.title}
                    </div>
                  )
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* 하단 상세 계획 영역 */}
      <div className={`border p-4 space-y-3 rounded-none transition-colors ${darkMode ? 'border-neutral-800 bg-neutral-900/20' : 'border-neutral-200 bg-white'}`}>
        <div className={`flex justify-between items-baseline border-b pb-2 ${darkMode ? 'border-neutral-800' : 'border-neutral-100'}`}>
          <h4 className={`text-xs font-bold tracking-wide ${darkMode ? 'text-white' : 'text-neutral-900'}`}>{selectedDate.replace(/-/g, '.')} 상세 일정</h4>
          <span className="text-[10px] font-mono text-neutral-400">{(selectedDateEvents || []).length}개의 계획</span>
        </div>
        
        {selectedDateEvents.length === 0 ? (
          <p className="text-xs text-neutral-400 py-2">등록된 일정이 없습니다.</p>
        ) : (
          <div className="space-y-2.5 max-h-48 overflow-y-auto">
            {selectedDateEvents.map(event => (
              <div key={event.id} onClick={() => { if(onEditEvent) onEditEvent(event); }} className={`flex items-center gap-3 py-1.5 px-2 text-sm group rounded-none transition-colors cursor-pointer ${darkMode ? 'hover:bg-neutral-800/60' : 'hover:bg-neutral-50'}`}>
                <span style={{ backgroundColor: event.color || '#404040' }} className="w-1.5 h-3 block flex-shrink-0"></span>
                <span className="font-mono text-neutral-400 text-xs w-10 flex-shrink-0">{event.time || '종일'}</span>
                <span className={`font-medium ${darkMode ? 'text-white' : 'text-neutral-800'}`}>{event.title}</span>
                <button onClick={(e) => { e.stopPropagation(); onDeleteEvent(event.id); }} className="text-neutral-300 hover:text-neutral-600 ml-auto transition-all p-1 cursor-pointer opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}