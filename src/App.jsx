import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Auth from './components/Auth'
import { parseScheduleWithAI } from './utils/gemini'

// 💡 쪼갠 컴포넌트들 깔끔하게 임포트 완료
import BriefingBanner from './components/BriefingBanner'
import Calendar from './components/Calendar'
import TodoList from './components/TodoList'
import AiFloatingInput from './components/AiFloatingInput'
import AiResultModal from './components/AiResultModal'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dbLoading, setDbLoading] = useState(false)
  
  // 실시간 DB 데이터 상태
  const [events, setEvents] = useState([])
  const [todos, setTodos] = useState([])

  // sv-SE 포맷을 쓰면 'YYYY-MM-DD' 형태로 오늘 날짜가 자동 추출됩니다!
const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('sv-SE'))

  // 입력 및 AI 모달 상태
  const [newScheduleInput, setNewScheduleInput] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showAiModal, setShowAiModal] = useState(false)
  
  const [parsedResult, setParsedResult] = useState({ title: '', date: '', time: '', isTodo: false, category: '', color: '' })

  const sophisticatedColors = [
    { name: '딥 테일', hex: '#7DCFB6' },
    { name: '뮤트 코랄', hex: '#E87474' },
    { name: '뮤트 세이지', hex: '#BCCBA3' },
    { name: '소프트 라벤더', hex: '#D1C4E9' },
    { name: '뮤트 베이지', hex: '#DBCBBD' }
  ];

  // Supabase 실시간 데이터 불러오기 (R)
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
      console.error(err.message);
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

  // AI 분석 및 최종 저장 로직 (C)
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

  // To-do 수동 추가 (C)
  const handleAddTodoManual = async (e) => {
    e.preventDefault();
    if (!session?.user?.id) return;
    const inputVal = e.target.todoInput.value;
    if(!inputVal.trim()) return;
    try {
      const { data, error } = await supabase.from('schedules').insert([{ user_id: session.user.id, title: inputVal, is_todo: true, completed: false, date: '2026-07-17', category: '', color: '' }]).select();
      if (error) throw error;
      if (data?.[0]) setTodos(prev => [data[0], ...(prev || [])]);
      e.target.reset();
    } catch (error) { alert(error.message); }
  }

  // To-do 완료 여부 체크박스 수정 (U)
  const handleToggleTodo = async (todoId, currentCompleted) => {
    try {
      const { error } = await supabase.from('schedules').update({ completed: !currentCompleted }).eq('id', todoId);
      if (error) throw error;
      setTodos(prev => (prev || []).map(t => t.id === todoId ? { ...t, completed: !currentCompleted } : t));
    } catch (error) { alert(error.message); }
  }

  // To-do 삭제 (D)
  const handleDeleteTodo = async (todoId) => {
    try {
      const { error } = await supabase.from('schedules').delete().eq('id', todoId);
      if (error) throw error;
      setTodos(prev => (prev || []).filter(t => t.id !== todoId));
    } catch (error) { alert(error.message); }
  }

  // 💡 [4번 핵심 기능 구현!] 달력의 일정 삭제 처리 함수 (D)
  const handleDeleteEvent = async (eventId) => {
    try {
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      
      // 화면 상태 동기화
      setEvents(prev => (prev || []).filter(e => e.id !== eventId));
    } catch (error) {
      alert('일정 삭제에 실패했습니다: ' + error.message);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-neutral-400 font-mono text-xs tracking-widest">
        LOADING...
      </div>
    )
  }

  if (!session) {
    return <Auth />
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans antialiased px-8 pt-6 pb-32 max-w-7xl mx-auto space-y-8 relative">
      
      {/* 1. 오늘의 비서 브리핑 배너 */}
      <BriefingBanner events={events} userEmail={session?.user?.email} />

      {dbLoading && <div className="text-left text-[10px] font-mono text-neutral-400 animate-pulse tracking-widest">SYNCING DATABASE...</div>}

      {/* 2. 메인 그리드 레이아웃 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-4">
        
        {/* 달력 및 하단 상세보기 섹션 */}
        <div className="lg:col-span-2">
          <Calendar 
            events={events} 
            selectedDate={selectedDate} 
            setSelectedDate={setSelectedDate} 
            onDeleteEvent={handleDeleteEvent} // 💡 4번 삭제 핸들러 전달
          />
        </div>

        {/* 우측 할 일 관리 섹션 */}
        <div>
          <TodoList 
            todos={todos} 
            onAddTodoManual={handleAddTodoManual} 
            onToggleTodo={handleToggleTodo} 
            onDeleteTodo={handleDeleteTodo} 
            userEmail={session?.user?.email}
            onSignOut={() => supabase.auth.signOut()}
          />
        </div>
      </div>

      {/* 3. 하단 블랙 플로팅 AI 바 */}
      <AiFloatingInput 
        newScheduleInput={newScheduleInput} 
        setNewScheduleInput={setNewScheduleInput} 
        isAnalyzing={isAnalyzing} 
        onAnalyze={handleAnalyze} 
      />

      {/* 4. AI 파싱 결과 수정 모달 */}
      <AiResultModal 
        showAiModal={showAiModal} 
        setShowAiModal={setShowAiModal} 
        parsedResult={parsedResult} 
        setParsedResult={setParsedResult} 
        onSaveResult={handleSaveResult} 
        sophisticatedColors={sophisticatedColors}
      />

    </div>
  )
}