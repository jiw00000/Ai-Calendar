import React from 'react'
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'

export default function Calendar({ events, selectedDate, setSelectedDate, onDeleteEvent }) {
  // 💡 [변경 완료] 17일, 18일 뒤에 붙어있던 수동 'isToday' 표시를 완전히 지웠습니다!
  const baseCalendarDays = [
    { day: 29, isCurrentMonth: false, dateStr: '2026-06-29' },
    { day: 30, isCurrentMonth: false, dateStr: '2026-06-30' },
    { day: 1, isCurrentMonth: true, dateStr: '2026-07-01' },
    { day: 2, isCurrentMonth: true, dateStr: '2026-07-02' },
    { day: 3, isCurrentMonth: true, dateStr: '2026-07-03' },
    { day: 4, isCurrentMonth: true, dateStr: '2026-07-04' },
    { day: 5, isCurrentMonth: true, dateStr: '2026-07-05' },
    { day: 6, isCurrentMonth: true, dateStr: '2026-07-06' },
    { day: 7, isCurrentMonth: true, dateStr: '2026-07-07' },
    { day: 8, isCurrentMonth: true, dateStr: '2026-07-08' },
    { day: 9, isCurrentMonth: true, dateStr: '2026-07-09' },
    { day: 10, isCurrentMonth: true, dateStr: '2026-07-10' },
    { day: 11, isCurrentMonth: true, dateStr: '2026-07-11' },
    { day: 12, isCurrentMonth: true, dateStr: '2026-07-12' },
    { day: 13, isCurrentMonth: true, dateStr: '2026-07-13' },
    { day: 14, isCurrentMonth: true, dateStr: '2026-07-14' },
    { day: 15, isCurrentMonth: true, dateStr: '2026-07-15' },
    { day: 16, isCurrentMonth: true, dateStr: '2026-07-16' },
    { day: 17, isCurrentMonth: true, dateStr: '2026-07-17' },
    { day: 18, isCurrentMonth: true, dateStr: '2026-07-18' }, 
    { day: 19, isCurrentMonth: true, dateStr: '2026-07-19' },
    { day: 20, isCurrentMonth: true, dateStr: '2026-07-20' },
    { day: 21, isCurrentMonth: true, dateStr: '2026-07-21' },
    { day: 22, isCurrentMonth: true, dateStr: '2026-07-22' },
    { day: 23, isCurrentMonth: true, dateStr: '2026-07-23' },
    { day: 24, isCurrentMonth: true, dateStr: '2026-07-24' },
    { day: 25, isCurrentMonth: true, dateStr: '2026-07-25' },
    { day: 26, isCurrentMonth: true, dateStr: '2026-07-26' },
    { day: 27, isCurrentMonth: true, dateStr: '2026-07-27' },
    { day: 28, isCurrentMonth: true, dateStr: '2026-07-28' },
    { day: 29, isCurrentMonth: true, dateStr: '2026-07-29' },
    { day: 30, isCurrentMonth: true, dateStr: '2026-07-30' },
    { day: 31, isCurrentMonth: true, dateStr: '2026-07-31' },
    { day: 1, isCurrentMonth: false, dateStr: '2026-08-01' },
    { day: 2, isCurrentMonth: false, dateStr: '2026-08-02' }
  ];

  // 선택된 날짜에 맞는 일정 정렬 추출
  const selectedDateEvents = (events || [])
    .filter(e => e.date === selectedDate)
    .sort((a, b) => (a.time || '23:59').localeCompare(b.time || '23:59'));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-bold text-neutral-950">2026년 7월</h3>
        <div className="flex items-center gap-3 text-neutral-400 text-xs font-mono">
          <button className="hover:text-neutral-900"><ChevronLeft size={16} /></button>
          <span className="tracking-widest">JUL</span>
          <button className="hover:text-neutral-900"><ChevronRight size={16} /></button>
        </div>
      </div>

      {/* 달력 판 */}
      <div className="border-t border-l border-neutral-200 grid grid-cols-7 text-center">
        {['월', '화', '수', '목', '금', '토', '일'].map((day) => (
          <div key={day} className="border-b border-r border-neutral-200 py-2 text-xs font-medium text-neutral-400 bg-neutral-50/50">{day}</div>
        ))}
        
        {baseCalendarDays.map((cell, idx) => {
          const matchingEvents = (events || [])
            .filter(e => e.date === cell.dateStr)
            .sort((a, b) => (a.time || '23:59').localeCompare(b.time || '23:59'));
          
          const isSelected = selectedDate === cell.dateStr;

          {/* 💡 [변경 완료] 실시간으로 컴퓨터의 오늘 날짜('YYYY-MM-DD')와 이 칸의 날짜가 같은지 확인합니다! */}
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
                {/* 💡 [변경 완료] cell.isToday 대신 실시간으로 계산된 변수 isToday를 바라봅니다. */}
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

      {/* 선택한 날짜의 상세 일정 리스트뷰 */}
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