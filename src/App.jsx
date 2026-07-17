import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Auth from './components/Auth'
import { parseScheduleWithAI } from './utils/gemini'
import { Sun, CloudRain, ChevronLeft, ChevronRight, Plus, X, Square, CheckSquare, Mic, Loader2 } from 'lucide-react'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dbLoading, setDbLoading] = useState(false)
  
  // 실시간 DB 데이터 상태
  const [events, setEvents] = useState([])
  const [todos, setTodos] = useState([])

  // 현재 사용자가 선택한 날짜 상태 (기본값: 오늘 17일)
  const [selectedDate, setSelectedDate] = useState('2026-07-17')

  // 입력 및 AI 모달 상태
  const [newScheduleInput, setNewScheduleInput] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showAiModal, setShowAiModal] = useState(false)
  
  const [parsedResult, setParsedResult] = useState({
    title: '',
    date: '',
    time: '',
    isTodo: false,
    category: '',
    color: ''
  })

  // 세련된 뮤트 톤 카테고리 컬러 팔레트
  const sophisticatedColors = [
    { name: '딥 테일', hex: '#7DCFB6' },
    { name: '뮤트 코랄', hex: '#E87474' },
    { name: '뮤트 세이지', hex: '#BCCBA3' },
    { name: '소프트 라벤더', hex: '#D1C4E9' },
    { name: '뮤트 베이지', hex: '#DBCBBD' }
  ];

  const briefingText = "지우님, 오늘 오후에 비 소식이 있고 12시 반에 '알바 면접'이 있어요. 12시 정각에는 출발하시는 걸 추천해요.";

  // 2026년 7월 기준 달력 그리드 기본 뼈대 데이터
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
    { day: 17, isCurrentMonth: true, dateStr: '2026-07-17', isToday: true },
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

  // Supabase 실시간 데이터 불러오기
  const fetchSchedules = async (userId) => {
    if (!userId) return
    setDbLoading(true)
    try {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const safeData = data || [];
      setEvents(safeData.filter(item => !item.is_todo));
      setTodos(safeData.filter(item => item.is_todo));
    } catch (err) {
      console.error("데이터 로딩 실패:", err.message);
    } finally {
      setDbLoading(false);
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user?.id) fetchSchedules(session.user.id);
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user?.id) {
        fetchSchedules(session.user.id);
      } else {
        setEvents([]);
        setTodos([]);
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  // AI 분석 및 최종 저장 로직
  const handleAnalyze = async () => {
    if (!newScheduleInput.trim()) return;
    setIsAnalyzing(true);
    try {
      const aiResult = await parseScheduleWithAI(newScheduleInput);
      setParsedResult({
        title: aiResult.title || '새로운 일정',
        date: aiResult.date || '2026-07-17',
        time: aiResult.time || '',
        isTodo: aiResult.isTodo || false,
        category: aiResult.category || '딥 테일',
        color: aiResult.color || '#7DCFB6'
      });
      setShowAiModal(true);
      setNewScheduleInput('');
    } catch (error) {
      alert('AI 분석 실패');
    } finally {
      setIsAnalyzing(false);
    }
  }

  const handleSaveResult = async () => {
    if (!session?.user?.id) return;
    try {
      const { data, error } = await supabase
        .from('schedules')
        .insert([{
          user_id: session.user.id,
          title: parsedResult.title,
          date: parsedResult.date,
          time: parsedResult.time || null,
          is_todo: parsedResult.isTodo,
          category: parsedResult.category,
          color: parsedResult.color,
          completed: false
        }])
        .select();

      if (error) throw error;
      
      const savedItem = data?.[0];
      if (savedItem) {
        if (savedItem.is_todo) {
          setTodos(prev => [savedItem, ...(prev || [])]);
        } else {
          setEvents(prev => [...(prev || []), savedItem]);
          setSelectedDate(savedItem.date);
        }
      }
      setShowAiModal(false);
    } catch (error) {
      alert(error.message);
    }
  }

  // To-do 관련 핸들러들
  const handleAddTodoManual = async (e) => {
    e.preventDefault();
    if (!session?.user?.id) return;
    const inputVal = e.target.todoInput.value;
    if(!inputVal.trim()) return;
    try {
      const { data, error } = await supabase.from('schedules').insert([{ user_id: session.user.id, title: inputVal, is_todo: true, completed: false, date: '2026-07-17', category: '', color: '' }]).select();
      if (error) throw error;
      if (data?.[0]) {
        setTodos(prev => [data[0], ...(prev || [])]);
      }
      e.target.reset();
    } catch (error) { alert(error.message); }
  }

  const handleToggleTodo = async (todoId, currentCompleted) => {
    try {
      const { error } = await supabase.from('schedules').update({ completed: !currentCompleted }).eq('id', todoId);
      if (error) throw error;
      setTodos(prev => (prev || []).map(t => t.id === todoId ? { ...t, completed: !currentCompleted } : t));
    } catch (error) { alert(error.message); }
  }

  const handleDeleteTodo = async (todoId) => {
    try {
      const { error } = await supabase.from('schedules').delete().eq('id', todoId);
      if (error) throw error;
      setTodos(prev => (prev || []).filter(t => t.id !== todoId));
    } catch (error) { alert(error.message); }
  }

  // 선택된 날짜에 매칭되는 상세 일정 추출 및 시간순 정렬
  const selectedDateEvents = (events || [])
    .filter(e => e.date === selectedDate)
    .sort((a, b) => (a.time || '23:59').localeCompare(b.time || '23:59'));

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans antialiased px-8 pt-6 pb-32 max-w-7xl mx-auto space-y-8 relative">
      
      {/* 1. 브리핑 배너 */}
      <div className="border border-neutral-200 p-6 space-y-5 rounded-none shadow-none bg-neutral-50/20 relative">
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-neutral-950"></div>
        <div className="space-y-3">
          <p className="text-xs font-semibold text-neutral-400 tracking-wider">오늘의 브리핑</p>
          <h2 className="text-sm text-neutral-800 leading-relaxed font-normal">{briefingText}</h2>
        </div>
        <div className="flex items-center gap-6 pt-1 text-xs text-neutral-500 font-mono tracking-wide">
          <div className="flex items-center gap-1.5"><CloudRain size={14} className="text-neutral-400" /><span>강수확률 70%</span></div>
          <div className="flex items-center gap-1.5"><Sun size={14} className="text-neutral-400" /><span>현재 <span className="font-bold text-neutral-800">24°C</span></span></div>
          <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-neutral-300"></span><span>다음 일정 <span className="font-bold text-neutral-800">12:30</span></span></div>
        </div>
      </div>

      {dbLoading && <div className="text-left text-[10px] font-mono text-neutral-400 animate-pulse tracking-widest">SYNCING DATABASE...</div>}

      {/* 2. 메인 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-4">
        
        {/* 달력 섹션 */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-neutral-950">2026년 7월</h3>
            <div className="flex items-center gap-3 text-neutral-400 text-xs font-mono">
              <button className="hover:text-neutral-900"><ChevronLeft size={16} /></button>
              <span className="tracking-widest">JUL</span>
              <button className="hover:text-neutral-900"><ChevronRight size={16} /></button>
            </div>
          </div>

          {/* 달력 그리드 */}
          <div className="border-t border-l border-neutral-200 grid grid-cols-7 text-center">
            {['월', '화', '수', '목', '금', '토', '일'].map((day) => (
              <div key={day} className="border-b border-r border-neutral-200 py-2 text-xs font-medium text-neutral-400 bg-neutral-50/50">{day}</div>
            ))}
            
            {baseCalendarDays.map((cell, idx) => {
              const matchingEvents = (events || [])
                .filter(e => e.date === cell.dateStr)
                .sort((a, b) => (a.time || '23:59').localeCompare(b.time || '23:59'));
              
              const isSelected = selectedDate === cell.dateStr;

              return (
                <div 
                  key={idx} 
                  onClick={() => setSelectedDate(cell.dateStr)}
                  className={`border-b border-r border-neutral-200 p-1.5 h-[104px] text-left text-xs font-mono space-y-1 cursor-pointer transition-colors relative select-none ${
                    cell.isCurrentMonth ? 'text-neutral-500' : 'text-neutral-300 bg-neutral-50/10'
                  } ${isSelected ? 'bg-neutral-950/[0.03] ring-1 ring-inset ring-neutral-950' : 'hover:bg-neutral-50/50'}`}
                >
                  <div className="flex justify-between items-center">
                    {cell.isToday ? (
                      <span className="w-5 h-5 flex items-center justify-center bg-neutral-950 text-white rounded-full font-bold text-[10px]">{cell.day}</span>
                    ) : (
                      <span className={isSelected ? 'font-bold text-neutral-950' : ''}>
                        {cell.day < 10 && cell.isCurrentMonth ? `0${cell.day}` : cell.day}
                      </span>
                    )}
                  </div>
                  
                  {/* 💡 [수정] 첫 번째 피드백: 달력 내부 일정들을 아웃라인 없는 이전 디자인으로 복구 */}
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
            
            {/* 💡 [수정] 세 번째 피드백: 일정이 없을 때 오직 '등록된 일정이 없습니다.' 문구만 노출 */}
            {selectedDateEvents.length === 0 ? (
              <p className="text-xs text-neutral-400 py-2">등록된 일정이 없습니다.</p>
            ) : (
              <div className="space-y-2.5 max-h-48 overflow-y-auto">
                {/* 💡 [수정] 두 번째 피드백: 상세 항목에서 우측 카테고리 텍스트 라벨 태그 제거 */}
                {selectedDateEvents.map(event => (
                  <div key={event.id} className="flex items-center gap-3 py-1 text-sm">
                    <span style={{ backgroundColor: event.color || '#neutral-950' }} className="w-1.5 h-3 block flex-shrink-0"></span>
                    <span className="font-mono text-neutral-400 text-xs w-10 flex-shrink-0">
                      {event.time || '종일'}
                    </span>
                    <span className="text-neutral-800 font-medium">{event.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 할 일 관리 섹션 */}
        <div className="space-y-6">
          <div className="flex justify-between items-baseline">
            <h3 className="text-base font-bold text-neutral-950">할 일</h3>
            <span className="text-xs font-mono text-neutral-400">{(todos || []).filter(t => !t.completed).length}개 남음</span>
          </div>

          <form onSubmit={handleAddTodoManual} className="flex gap-2">
            <input name="todoInput" type="text" placeholder="새 할 일을 입력하고 Enter..." className="flex-1 rounded-sm border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-950 outline-none focus:border-neutral-900" />
            <button type="submit" className="rounded-sm bg-neutral-950 px-4 py-2 text-sm font-medium text-white flex items-center gap-1 hover:opacity-90"><Plus size={14} /><span>추가</span></button>
          </form>

          <div className="divide-y divide-neutral-200 border-b border-neutral-200">
            {/* 완료되지 않은 일 */}
            {(todos || []).filter(t => !t.completed).map(todo => (
              <div key={todo.id} className="flex items-center justify-between py-3 group">
                <div className="flex items-center gap-3">
                  <button onClick={() => handleToggleTodo(todo.id, todo.completed)} className="text-neutral-300 hover:text-neutral-900"><Square size={18} /></button>
                  <div className="flex items-baseline gap-2">
                    {todo.color && <span style={{ backgroundColor: todo.color }} className="w-1.5 h-1.5 rounded-full block"></span>}
                    <span className="text-sm text-neutral-800">{todo.title}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {todo.date && <span className="text-xs font-mono text-neutral-400">{todo.date.slice(5)}</span>}
                  <button onClick={() => handleDeleteTodo(todo.id)} className="text-neutral-300 hover:text-neutral-500 hidden group-hover:block"><X size={14} /></button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-2">
            <p className="text-xs text-neutral-400 font-mono">완료됨 — {(todos || []).filter(t => t.completed).length}</p>
            <div className="divide-y divide-neutral-100">
              {/* 완료된 일 */}
              {(todos || []).filter(t => t.completed).map(todo => (
                <div key={todo.id} className="flex items-center justify-between py-2 group">
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleToggleTodo(todo.id, todo.completed)} className="text-neutral-950"><CheckSquare size={18} /></button>
                    <span className="text-sm text-neutral-400 line-through">{todo.title}</span>
                  </div>
                  <button onClick={() => handleDeleteTodo(todo.id)} className="text-neutral-300 hover:text-neutral-500 hidden group-hover:block"><X size={14} /></button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8">
            <button onClick={() => supabase.auth.signOut()} className="text-xs text-neutral-400 hover:text-neutral-900 underline underline-offset-4">
              로그아웃 계정: {session?.user?.email}
            </button>
          </div>
        </div>
      </div>

      {/* 3. 화면 하단 고정형 AI 입력 바 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/85 backdrop-blur-md border-t border-neutral-200 py-4 px-8 z-40">
        <div className="max-w-7xl mx-auto flex gap-2 items-center">
          <button type="button" className="p-2.5 text-neutral-500 hover:text-neutral-900 border border-neutral-300 rounded-sm bg-white active:bg-neutral-50 transition-colors"><Mic size={18} /></button>
          <input type="text" value={newScheduleInput} onChange={(e) => setNewScheduleInput(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter' && !isAnalyzing) handleAnalyze(); }} placeholder="대충 말해도 괜찮아요 - 예: 다음 주 주말 방 청소" className="flex-1 rounded-sm border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-950 outline-none focus:border-neutral-900 transition-colors" disabled={isAnalyzing} />
          <button onClick={handleAnalyze} className="rounded-sm bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 active:opacity-100 disabled:opacity-40 transition-all flex items-center gap-2" disabled={!newScheduleInput.trim() || isAnalyzing}>
            {isAnalyzing && <Loader2 size={14} className="animate-spin" />}
            <span>{isAnalyzing ? '분석 중' : '분석'}</span>
          </button>
        </div>
      </div>

      {/* 4. AI 파싱 결과 확인 모달 */}
      {showAiModal && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-white border border-neutral-200 p-6 space-y-6 rounded-none shadow-none">
            <div className="space-y-1"><span className="text-xs font-medium text-neutral-400 block">AI 분석 결과</span><h4 className="text-sm font-bold text-neutral-950">분석된 정밀 데이터를 확인해 주세요</h4></div>
            <div className="space-y-4">
              <div className="space-y-1.5"><label className="block text-xs font-medium text-neutral-600">제목</label><input type="text" value={parsedResult.title} onChange={(e) => setParsedResult(prev => ({ ...prev, title: e.target.value }))} className="w-full border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-950 outline-none focus:border-neutral-900 rounded-sm" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><label className="block text-xs font-medium text-neutral-600">날짜</label><input type="text" value={parsedResult.date} onChange={(e) => setParsedResult(prev => ({ ...prev, date: e.target.value }))} className="w-full border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-950 outline-none focus:border-neutral-900 rounded-sm" /></div>
                <div className="space-y-1.5"><label className="block text-xs font-medium text-neutral-600">시간 (비워둘 시 To-do로 변경)</label><input type="text" value={parsedResult.time || ''} onChange={(e) => setParsedResult(prev => ({ ...prev, time: e.target.value, isTodo: !e.target.value }))} placeholder="예: 15:00" className="w-full border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-950 outline-none focus:border-neutral-900 rounded-sm" /></div>
              </div>
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-medium text-neutral-600 mb-2">카테고리: <span className="font-bold text-neutral-800">{parsedResult.category}</span></label>
                <div className="flex gap-2">
                  {sophisticatedColors.map(color => (
                    <button key={color.hex} type="button" onClick={() => setParsedResult(prev => ({ ...prev, category: color.name, color: color.hex }))} style={{ backgroundColor: color.hex }} className={`w-8 h-8 rounded-full border cursor-pointer transition-all hover:scale-110 active:scale-95 ${parsedResult.category === color.name ? 'ring-2 ring-neutral-950 ring-offset-2 scale-105' : 'border-neutral-100'}`} title={color.name} />
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button onClick={() => setShowAiModal(false)} className="border border-neutral-300 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50 rounded-sm">취소</button>
              <button onClick={handleSaveResult} className="bg-neutral-950 py-2 text-sm font-medium text-white hover:opacity-90 rounded-sm">최종 저장</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}