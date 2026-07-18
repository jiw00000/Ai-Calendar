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
  
  const [isEditing, setIsEditing] = useState(false)
  const [editingEventId, setEditingEventId] = useState(null)

  const [modalTitle, setModalTitle] = useState('')
  const [modalStartDate, setModalStartDate] = useState('') 
  const [modalEndDate, setModalEndDate] = useState('')     
  const [modalTime, setModalTime] = useState('')
  const [modalDuration, setModalDuration] = useState(1) 
  const [modalCategory, setModalCategory] = useState('딥 테일')
  const [modalIsTodo, setModalIsTodo] = useState(false)

  // 🔌 1. 앱 시작 시 인증 세션 초기화 및 감시
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

  // 💡 2. [대형 추가] Supabase Realtime 실시간 데이터베이스 브로드캐스팅 리스너 심기
  useEffect(() => {
    if (!userId) return

    // 📡 events 테이블 실시간 채널 구독 (내 user_id 데이터만 필터링)
    const eventsChannel = supabase
      .channel('public:events_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events', filter: `user_id=eq.${userId}` },
        (payload) => {
          console.log('⚡ [Realtime] 일정 변동 감지됨:', payload)
          fetchBackendData(userId) // 데이터 변경 시 자동으로 전수 리프레시!
        }
      )
      .subscribe()

    // 📡 todos 테이블 실시간 채널 구독 (내 user_id 데이터만 필터링)
    const todosChannel = supabase
      .channel('public:todos_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'todos', filter: `user_id=eq.${userId}` },
        (payload) => {
          console.log('⚡ [Realtime] 할 일 변동 감지됨:', payload)
          fetchBackendData(userId) // 데이터 변경 시 자동으로 전수 리프레시!
        }
      )
      .subscribe()

    // 🔌 컴포넌트가 꺼지거나 로그아웃될 때 실시간 스트림 채널을 안전하게 닫아줍니다 (메모리 누수 방지)
    return () => {
      supabase.removeChannel(eventsChannel)
      supabase.removeChannel(todosChannel)
    }
  }, [userId])

  // 📥 데이터베이스 데이터 덤프 로드 엔진
  const fetchBackendData = async (uid) => {
    const { data: eventsData, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', uid)
      
    if (eventsError) {
      console.error("일정 불러오기 실패:", eventsError.message)
    } else {
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
          
          parsedEvents.push({
            id: e.id, 
            title: e.title,
            category: e.category,
            color: e.color,
            user_id: e.user_id,
            date: dateStr,
            time: timeStr === '00:00' ? '종일' : timeStr,
            rawTime: timeStr,
            duration: Math.max(0.5, (end - start) / (1000 * 60 * 60)),
            origStart: origStartStr,
            origEnd: origEndStr
          })
          
          current.setDate(current.getDate() + 1)
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

  // 🧠 AI 분석 핸들러
  const handleAnalyze = async () => {
    if (!newScheduleInput.trim()) return
    setIsAnalyzing(true)
    
    try {
      const uniqueEvents = []
      const seenIds = new Set()
      events.forEach(e => {
        if (!seenIds.has(e.id)) {
          seenIds.add(e.id)
          uniqueEvents.push(e)
        }
      })

      const data = await parseScheduleWithAI(newScheduleInput, uniqueEvents)
      
      if (data.status === 'update' && data.id) {
        setIsEditing(true)
        setEditingEventId(data.id)
      } else {
        setIsEditing(false)
        setEditingEventId(null)
      }

      setModalTitle(data.title || '')
      setModalStartDate(data.date || '')
      setModalTime(data.time || '')
      setModalCategory(data.category || '딥 테일')
      setModalIsTodo(data.isTodo || false)
      setModalDuration(data.duration || 1) 

      if (data.date) {
        const startIso = `${data.date}T${data.time || '00:00'}:00`
        const startDateObj = new Date(startIso)
        const durationHours = data.duration || 1
        const endDateObj = new Date(startDateObj.getTime() + durationHours * 60 * 60 * 1000)

        let displayEndDate = endDateObj
        if (durationHours >= 24 && (!data.time || data.time === '00:00')) {
          displayEndDate = new Date(endDateObj.getTime() - 24 * 60 * 60 * 1000)
        }

        const yyyy = displayEndDate.getFullYear()
        const mm = String(displayEndDate.getMonth() + 1).padStart(2, '0')
        const dd = String(displayEndDate.getDate()).padStart(2, '0')
        setModalEndDate(`${yyyy}-${mm}-${dd}`)
      } else {
        setModalEndDate(data.date || '')
      }

      setIsModalOpen(true)
    } catch (error) {
      console.error("Gemini API 한도 초과 예외 트리거 처리:", error.message)
      
      const confirmManual = window.confirm(
        "⚠️ Gemini AI의 무료 사용량을 모두 소모했습니다!\n\n잠시 후 다시 시도하시거나, 지금 바로 수동으로 내용을 채워 일정을 등록하시겠습니까?"
      )
      
      if (confirmManual) {
        setIsEditing(false)
        setEditingEventId(null)
        setModalTitle(newScheduleInput)
        setModalStartDate(selectedDate)
        setModalEndDate(selectedDate)
        setModalTime('')
        setModalDuration(1)
        setModalCategory('딥 테일')
        setIsModalOpen(true)            
      }
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleOpenEditModal = (event) => {
    setIsEditing(true)
    setEditingEventId(event.id)
    setModalTitle(event.title)
    setModalStartDate(event.origStart)
    setModalEndDate(event.origEnd)
    setModalTime(event.rawTime === '00:00' ? '' : event.rawTime)
    setModalDuration(event.duration)
    setModalCategory(event.category)
    setModalIsTodo(false)
    setIsModalOpen(true)
  }

  // 저장 처리
  const handleSaveEvent = async () => {
    const color = categoryColors[modalCategory] || '#DBCBBD'
    if (!userId) return

    try {
      if (modalIsTodo) {
        const newTodo = {
          title: modalTitle,
          date: modalStartDate,
          completed: false,
          color,
          user_id: userId
        }
        const { error } = await supabase.from('todos').insert([newTodo])
        if (error) throw error 
      } else {
        const startIsoString = `${modalStartDate}T${modalTime || '00:00'}:00`
        const startDateObj = new Date(startIsoString)
        
        let endDateObj;
        if (modalStartDate === modalEndDate) {
          endDateObj = new Date(startDateObj.getTime() + Number(modalDuration) * 60 * 60 * 1000)
        } else {
          endDateObj = new Date(`${modalEndDate}T${modalTime || '23:59'}:59`)
        }

        const eventDataPayload = {
          title: modalTitle,
          start_time: startDateObj.toISOString(),
          end_time: endDateObj.toISOString(),
          category: modalCategory,
          color,
          user_id: userId
        }

        if (isEditing) {
          const { error } = await supabase
            .from('events')
            .update(eventDataPayload)
            .eq('id', editingEventId)
          if (error) throw error
        } else {
          const { error } = await supabase.from('events').insert([eventDataPayload])
          if (error) throw error 
        }
      }
      
      setIsModalOpen(false)
      setIsEditing(false)
      setEditingEventId(null)
      setNewScheduleInput('')
    } catch (error) {
      alert(`❌ 데이터베이스 저장 실패!\n원인: ${error.message}`)
    }
  }

  // 일정 삭제
  const handleDeleteEvent = async (id) => {
    const { error } = await supabase.from('events').delete().eq('id', id)
    if (error) alert(`삭제 실패: ${error.message}`)
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

    const { error } = await supabase.from('todos').insert([newTodo])
    if (error) alert(`할 일 추가 실패: ${error.message}`)
    e.target.reset()
  }

  const handleToggleTodo = async (id, completed) => {
    const { error } = await supabase.from('todos').update({ completed: !completed }).eq('id', id)
    if (error) alert(`상태 변경 실패: ${error.message}`)
  }

  const handleDeleteTodo = async (id) => {
    const { error } = await supabase.from('todos').delete().eq('id', id)
    if (error) alert(`할 일 삭제 실패: ${error.message}`)
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
            onEditEvent={handleOpenEditModal} 
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
        onClose={() => {
          setIsModalOpen(false)
          setIsEditing(false)
          setEditingEventId(null)
        }}
        title={modalTitle}
        setTitle={setModalTitle}
        startDate={modalStartDate}
        setStartDate={setModalStartDate}
        endDate={modalEndDate}
        setEndDate={setModalEndDate}
        time={modalTime}
        setTime={setModalTime}
        duration={modalDuration}       
        setDuration={setModalDuration} 
        category={modalCategory}
        setCategory={setModalCategory}
        onSave={handleSaveEvent}
        isEditing={isEditing} 
      />
    </div>
  )
}