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
  '딥 테일': '#7DCFB6',
  '뮤트 코랄': '#E87474',
  '뮤트 세이지': '#BCCBA3',
  '소프트 라벤더': '#D1C4E9',
  '뮤트 베이지': '#DBCBBD'
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
  
  const [modalTitle, setModalTitle] = useState('')
  const [modalDate, setModalDate] = useState('')
  const [modalTime, setModalTime] = useState('')
  const [modalDuration, setModalDuration] = useState(1)
  const [modalCategory, setModalCategory] = useState('딥 테일')
  const [modalIsTodo, setModalIsTodo] = useState(false)

  useEffect(() => {
    const initSessionAndFetch = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setUserId(session.user.id)
          setUserEmail(session.user.email)
          await fetchBackendData(session.user.id)
        }
      } catch (err) {
        console.error("세션 초기화 에러:", err)
      } finally {
        setIsSessionLoading(false)
      }

      supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUserId(session.user.id)
          setUserEmail(session.user.email)
          fetchBackendData(session.user.id)
        } else {
          setUserId(null)
          setUserEmail('')
          setEvents([])
          setTodos([])
        }
        setIsSessionLoading(false)
      })
    }

    initSessionAndFetch()
  }, [])

  // 📥 [데이터 변환 로드] DB의 start_time, end_time을 프론트엔드가 이해하는 date, time, duration으로 쪼갭니다.
  const fetchBackendData = async (uid) => {
    const { data: eventsData, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', uid)
      
    if (eventsError) {
      console.error("일정 불러오기 실패:", eventsError.message)
    } else {
      // 💡 데이터 포맷 가공 변환기 실행
      const parsedEvents = (eventsData || []).map(e => {
        if (!e.start_time) return { ...e, date: '', time: '', duration: 1 }
        
        const startDateObj = new Date(e.start_time)
        const endDateObj = e.end_time ? new Date(e.end_time) : new Date(startDateObj.getTime() + 60 * 60 * 1000)
        
        // 날짜 파싱 (YYYY-MM-DD)
        const yyyy = startDateObj.getFullYear()
        const mm = String(startDateObj.getMonth() + 1).padStart(2, '0')
        const dd = String(startDateObj.getDate()).padStart(2, '0')
        const date = `${yyyy}-${mm}-${dd}`
        
        // 시간 파싱 (HH:MM)
        const time = String(startDateObj.getHours()).padStart(2, '0') + ':' + String(startDateObj.getMinutes()).padStart(2, '0')
        
        // 진행 시간 계산 (시간 단위)
        const duration = Math.max(0.5, (endDateObj - startDateObj) / (1000 * 60 * 60))
        
        return {
          id: e.id,
          title: e.title,
          category: e.category,
          color: e.color,
          user_id: e.user_id,
          date,
          time,
          duration
        }
      })
      setEvents(parsedEvents)
    }

    const { data: todosData, error: todosError } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', uid)
    if (todosError) console.error("할 일 불러오기 실패:", todosError.message)
    else setTodos(todosData || [])
  }

  // AI 분석 핸들러
  const handleAnalyze = async () => {
    if (!newScheduleInput.trim()) return
    setIsAnalyzing(true)
    try {
      const data = await parseScheduleWithAI(newScheduleInput)
      setModalTitle(data.title || '')
      setModalDate(data.date || '')
      setModalTime(data.time || '')
      setModalDuration(data.duration || 1)
      setModalCategory(data.category || '딥 테일')
      setModalIsTodo(data.isTodo || false)
      setIsModalOpen(true)
    } catch (error) {
      alert(`AI 분석 실패: ${error.message}`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // 📤 [데이터 변환 저장] 저장할 때는 다시 start_time과 end_time 타임스탬프로 합쳐서 날립니다.
  const handleSaveEvent = async () => {
    const color = categoryColors[modalCategory] || '#DBCBBD'

    if (!userId) {
      alert("로그인 정보가 유실되었습니다.")
      return
    }

    try {
      if (modalIsTodo) {
        const newTodo = {
          title: modalTitle,
          date: modalDate,
          completed: false,
          color,
          user_id: userId
        }
        
        const { data, error } = await supabase.from('todos').insert([newTodo]).select()
        if (error) throw error 
        if (data && data.length > 0) setTodos((prev) => [...prev, data[0]])
      } else {
        // 💡 프론트엔드의 date + time 문자열을 조합해 Date 객체 생성
        const startIsoString = `${modalDate}T${modalTime || '00:00'}:00`
        const startDateObj = new Date(startIsoString)
        
        // 시작 시간에 duration(시간 단위)을 더해 종료 시간 객체 생성
        const endDateObj = new Date(startDateObj.getTime() + Number(modalDuration) * 60 * 60 * 1000)

        // Supabase 테이블 양식에 완벽 정렬 매칭
        const newEventForDB = {
          title: modalTitle,
          start_time: startDateObj.toISOString(),
          end_time: endDateObj.toISOString(),
          category: modalCategory,
          color,
          user_id: userId
        }

        const { data, error } = await supabase.from('events').insert([newEventForDB]).select()
        if (error) throw error 
        
        if (data && data.length > 0) {
          // 로컬 상태에는 캘린더가 이해할 수 있는 규격으로 복원해서 업로드
          const newEventForState = {
            id: data[0].id,
            title: modalTitle,
            date: modalDate,
            time: modalTime || null,
            duration: Number(modalDuration),
            category: modalCategory,
            color
          }
          setEvents((prev) => [...prev, newEventForState])
        }
      }
      
      setIsModalOpen(false)
      setNewScheduleInput('')
    } catch (error) {
      console.error("Supabase 저장 실패:", error)
      alert(`❌ 데이터베이스 저장 실패!\n원인: ${error.message}`)
    }
  }

  // 일정 삭제
  const handleDeleteEvent = async (id) => {
    const { error } = await supabase.from('events').delete().eq('id', id)
    if (error) alert(`삭제 실패: ${error.message}`)
    else setEvents(prev => prev.filter(e => e.id !== id))
  }

  // 수동 할 일 추가
  const handleAddTodoManual = async (e) => {
    e.preventDefault()
    const input = e.target.elements.todoInput.value
    if (!input.trim()) return
    
    const newTodo = {
      title: input,
      date: selectedDate,
      completed: false,
      color: '#DBCBBD',
      user_id: userId
    }

    const { data, error } = await supabase.from('todos').insert([newTodo]).select()
    if (error) alert(`할 일 추가 실패: ${error.message}`)
    else if (data) setTodos(prev => [...prev, data[0]])
    e.target.reset()
  }

  const handleToggleTodo = async (id, completed) => {
    const { error } = await supabase.from('todos').update({ completed: !completed }).eq('id', id)
    if (error) alert(`상태 변경 실패: ${error.message}`)
    else setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !completed } : t))
  }

  const handleDeleteTodo = async (id) => {
    const { error } = await supabase.from('todos').delete().eq('id', id)
    if (error) alert(`할 일 삭제 실패: ${error.message}`)
    else setTodos(prev => prev.filter(t => t.id !== id))
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    alert("안전하게 로그아웃 되었습니다.")
  }

  if (isSessionLoading) {
    return <div className="min-h-screen bg-white flex items-center justify-center font-mono text-xs text-neutral-400 animate-pulse">CONNECTING TO BACKEND...</div>
  }

  if (!userId) {
    return <Auth />
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900 p-6 space-y-6 max-w-7xl mx-auto pb-32">
      <BriefingBanner events={events} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 border border-neutral-200 p-6">
          <Calendar 
            events={events} 
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            onDeleteEvent={handleDeleteEvent}
          />
        </div>
        <div className="border border-neutral-200 p-6">
          <TodoList 
            todos={todos}
            onAddTodoManual={handleAddTodoManual}
            onToggleTodo={handleToggleTodo}
            onDeleteTodo={handleDeleteTodo}
            userEmail={userEmail}
            onSignOut={handleSignOut}
          />
        </div>
      </div>

      <AiFloatingInput 
        newScheduleInput={newScheduleInput}
        setNewScheduleInput={setNewScheduleInput}
        isAnalyzing={isAnalyzing}
        onAnalyze={handleAnalyze}
      />

      <AiResultModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
        setTitle={setModalTitle}
        date={modalDate}
        setDate={setModalDate}
        time={modalTime}
        setTime={setModalTime}
        duration={modalDuration}
        setDuration={setModalDuration}
        category={modalCategory}
        setCategory={setModalCategory}
        onSave={handleSaveEvent}
      />
    </div>
  )
}