import React, { useState, useEffect } from 'react'
import BriefingBanner from './components/BriefingBanner'
import AiFloatingInput from './components/AiFloatingInput'
import AiResultModal from './components/AiResultModal'
import Calendar from './components/Calendar'
import TodoList from './components/TodoList'
import Auth from './components/Auth' 
import { parseScheduleWithAI } from './utils/gemini'
import { supabase } from './supabaseClient'

const categoryColors = {
  '딥 테일': '#7DCFB6', '뮤트 코랄': '#E87474', '뮤트 세이지': '#BCCBA3', '소프트 라벤더': '#D1C4E9', '뮤트 베이지': '#DBCBBD'
}

export default function App() {
  const [events, setEvents] = useState([])
  const [todos, setTodos] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('sv-SE'))
  const [userEmail, setUserEmail] = useState('')
  const [userId, setUserId] = useState(null)
  const [isSessionLoading, setIsSessionLoading] = useState(true) 
  const [newScheduleInput, setNewScheduleInput] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingEventId, setEditingEventId] = useState(null)
  const [darkMode, setDarkMode] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [modalStartDate, setModalStartDate] = useState('') 
  const [modalEndDate, setModalEndDate] = useState('')     
  const [modalTime, setModalTime] = useState('')
  const [modalDuration, setModalDuration] = useState(1) 
  const [modalCategory, setModalCategory] = useState('딥 테일')
  const [modalIsTodo, setModalIsTodo] = useState(false)

  useEffect(() => {
    const initSessionAndFetch = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) { setUserId(session.user.id); setUserEmail(session.user.email); await fetchBackendData(session.user.id); }
      } catch (err) { console.error("세션 초기화 에러:", err) } finally { setIsSessionLoading(false) }

      supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) { setUserId(session.user.id); setUserEmail(session.user.email); fetchBackendData(session.user.id); } 
        else { setUserId(null); setUserEmail(''); setEvents([]); setTodos([]); }
        setIsSessionLoading(false)
      })
    }
    initSessionAndFetch()
  }, [])

  useEffect(() => {
    if (!userId) return
    const eventsChannel = supabase.channel('public:events_realtime').on('postgres_changes', { event: '*', schema: 'public', table: 'events', filter: `user_id=eq.${userId}` }, () => { fetchBackendData(userId) }).subscribe()
    const todosChannel = supabase.channel('public:todos_realtime').on('postgres_changes', { event: '*', schema: 'public', table: 'todos', filter: `user_id=eq.${userId}` }, () => { fetchBackendData(userId) }).subscribe()
    return () => { supabase.removeChannel(eventsChannel); supabase.removeChannel(todosChannel); }
  }, [userId])

  const fetchBackendData = async (uid) => {
    const { data: eventsData, error: eventsError } = await supabase.from('events').select('*').eq('user_id', uid)
    if (eventsError) console.error("일정 불러오기 실패:", eventsError.message)
    else {
      const parsedEvents = []
      ;(eventsData || []).forEach(e => {
        if (!e.start_time) return
        const start = new Date(e.start_time)
        const end = e.end_time ? new Date(e.end_time) : new Date(start.getTime() + 60 * 60 * 1000)
        let current = new Date(start.getFullYear(), start.getMonth(), start.getDate())
        const endCeil = new Date(end.getTime() - 1)
        const limit = new Date(endCeil.getFullYear(), endCeil.getMonth(), endCeil.getDate())
        const origStartStr = start.toLocaleDateString('sv-SE')
        const origEndStr = limit.toLocaleDateString('sv-SE')
        
        while (current <= limit) {
          const dateStr = current.toLocaleDateString('sv-SE')
          const timeStr = String(start.getHours()).padStart(2, '0') + ':' + String(start.getMinutes()).padStart(2, '0')
          parsedEvents.push({ id: e.id, title: e.title, category: e.category, color: e.color, user_id: e.user_id, date: dateStr, time: timeStr === '00:00' ? '종일' : timeStr, rawTime: timeStr, duration: Math.max(0.5, (end - start) / (1000 * 60 * 60)), origStart: origStartStr, origEnd: origEndStr })
          current.setDate(current.getDate() + 1)
        }
      })
      setEvents(parsedEvents)
    }
    const { data: todosData, error: todosError } = await supabase.from('todos').select('*').eq('user_id', uid)
    if (todosError) console.error("할 일 불러오기 실패:", todosError.message)
    else setTodos(todosData || [])
  }

  const handleAnalyze = async () => {
    if (!newScheduleInput.trim()) return
    setIsAnalyzing(true)
    try {
      const uniqueEvents = []; const seenIds = new Set();
      events.forEach(e => { if (!seenIds.has(e.id)) { seenIds.add(e.id); uniqueEvents.push(e); } })
      const data = await parseScheduleWithAI(newScheduleInput, uniqueEvents)
      
      if (data.status === 'update' && data.id) { setIsEditing(true); setEditingEventId(data.id); } 
      else { setIsEditing(false); setEditingEventId(null); }
      setModalTitle(data.title || '')
      setModalStartDate(data.date || '')
      setModalTime(data.time || '')
      setModalCategory(data.category || '딥 테일')
      setModalIsTodo(data.isTodo || false)
      setModalDuration(data.duration || 1) 
      if (data.date) {
        const startDateObj = new Date(`${data.date}T${data.time || '00:00'}:00`)
        let displayEndDate = new Date(startDateObj.getTime() + (data.duration || 1) * 60 * 60 * 1000)
        if ((data.duration || 1) >= 24 && (!data.time || data.time === '00:00')) displayEndDate = new Date(displayEndDate.getTime() - 24 * 60 * 60 * 1000)
        setModalEndDate(`${displayEndDate.getFullYear()}-${String(displayEndDate.getMonth() + 1).padStart(2, '0')}-${String(displayEndDate.getDate()).padStart(2, '0')}`)
      } else { setModalEndDate(data.date || '') }
      setIsModalOpen(true)
    } catch (error) {
      if (window.confirm("⚠️ Gemini AI 한도 초과! 수동 등록으로 전환하시겠습니까?")) {
        setIsEditing(false); setEditingEventId(null); setModalTitle(newScheduleInput); setModalStartDate(selectedDate); setModalEndDate(selectedDate); setModalTime(''); setModalDuration(1); setModalCategory('딥 테일'); setIsModalOpen(true);            
      }
    } finally { setIsAnalyzing(false) }
  }

  const handleOpenEditModal = (event) => {
    setIsEditing(true); setEditingEventId(event.id); setModalTitle(event.title); setModalStartDate(event.origStart); setModalEndDate(event.origEnd); setModalTime(event.rawTime === '00:00' ? '' : event.rawTime); setModalDuration(event.duration); setModalCategory(event.category); setModalIsTodo(false); setIsModalOpen(true);
  }

  const handleSaveEvent = async () => {
    const color = categoryColors[modalCategory] || '#DBCBBD'
    if (!userId) return
    try {
      if (modalIsTodo) { await supabase.from('todos').insert([{ title: modalTitle, date: modalStartDate, completed: false, color, user_id: userId }]) } 
      else {
        const startIsoString = `${modalStartDate}T${modalTime || '00:00'}:00`
        const startDateObj = new Date(startIsoString)
        let endDateObj = modalStartDate === modalEndDate ? new Date(startDateObj.getTime() + Number(modalDuration) * 60 * 60 * 1000) : new Date(`${modalEndDate}T${modalTime || '23:59'}:59`)
        const payload = { title: modalTitle, start_time: startDateObj.toISOString(), end_time: endDateObj.toISOString(), category: modalCategory, color, user_id: userId }
        isEditing ? await supabase.from('events').update(payload).eq('id', editingEventId) : await supabase.from('events').insert([payload])
      }
      setIsModalOpen(false); setIsEditing(false); setEditingEventId(null); setNewScheduleInput('');
    } catch (error) { alert(`❌ 저장 실패!\n원인: ${error.message}`) }
  }

  const handleDeleteEvent = async (id) => { await supabase.from('events').delete().eq('id', id) }
  const handleAddTodoManual = async (e) => {
    e.preventDefault(); const input = e.target.elements.todoInput.value; if (!input.trim()) return;
    await supabase.from('todos').insert([{ title: input, date: selectedDate, completed: false, color: '#DBCBBD', user_id: userId }])
    e.target.reset()
  }
  const handleToggleTodo = async (id, completed) => { await supabase.from('todos').update({ completed: !completed }).eq('id', id) }
  const handleDeleteTodo = async (id) => { await supabase.from('todos').delete().eq('id', id) }
  const handleSignOut = async () => { await supabase.auth.signOut(); alert("안전하게 로그아웃 되었습니다.") }

  if (isSessionLoading) return <div className="min-h-screen bg-white flex items-center justify-center font-mono text-xs text-neutral-400 animate-pulse">CONNECTING TO BACKEND...</div>
  if (!userId) return <Auth />

  return (
    <div className={`min-h-screen transition-colors duration-300 p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-32 sm:pb-32 ${darkMode ? 'bg-neutral-950 text-white' : 'bg-white text-neutral-900'}`}>
      
      <div className="flex justify-end select-none -mb-2 sm:mb-0 relative z-10">
        <button onClick={() => setDarkMode(!darkMode)} className={`text-[10px] font-mono tracking-wider px-3 py-1.5 border transition-all active:scale-95 rounded-none ${darkMode ? 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white' : 'border-neutral-200 bg-neutral-50 text-neutral-500 hover:text-neutral-900'}`}>
          {darkMode ? '🌙 DARK MODE ON' : '☀️ LIGHT MODE ON'}
        </button>
      </div>

      <BriefingBanner events={events} userEmail={userEmail} darkMode={darkMode} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className={`lg:col-span-2 border-transparent sm:border p-0 sm:p-6 transition-colors duration-300 ${darkMode ? 'sm:border-neutral-800 bg-transparent sm:bg-neutral-900/40' : 'sm:border-neutral-200 bg-transparent sm:bg-white'}`}>
          <Calendar events={events} selectedDate={selectedDate} setSelectedDate={setSelectedDate} onDeleteEvent={handleDeleteEvent} onEditEvent={handleOpenEditModal} darkMode={darkMode} />
        </div>
        <div className={`border p-4 sm:p-6 transition-colors duration-300 ${darkMode ? 'border-neutral-800 bg-neutral-900/40' : 'border-neutral-200 bg-white'}`}>
          <TodoList todos={todos} onAddTodoManual={handleAddTodoManual} onToggleTodo={handleToggleTodo} onDeleteTodo={handleDeleteTodo} userEmail={userEmail} onSignOut={handleSignOut} darkMode={darkMode} />
        </div>
      </div>

      <AiFloatingInput newScheduleInput={newScheduleInput} setNewScheduleInput={setNewScheduleInput} isAnalyzing={isAnalyzing} onAnalyze={handleAnalyze} />
      
      {/* 💡 [버그 수정] 맨 아래 setCategory={setModalCategory} 로 완벽하게 오타 수정됨! */}
      <AiResultModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setIsEditing(false); setEditingEventId(null); }} title={modalTitle} setTitle={setModalTitle} startDate={modalStartDate} setStartDate={setModalStartDate} endDate={modalEndDate} setEndDate={setModalEndDate} time={modalTime} setTime={setModalTime} duration={modalDuration} setDuration={setModalDuration} category={modalCategory} setCategory={setModalCategory} onSave={handleSaveEvent} isEditing={isEditing} darkMode={darkMode} />
    </div>
  )
}