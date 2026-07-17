import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Auth from './components/Auth'
import { Sun, CloudRain, ChevronLeft, ChevronRight, Plus, X, Square, CheckSquare, Mic } from 'lucide-react'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // UI 테스트용 상태 제어
  const [showAiModal, setShowAiModal] = useState(false)
  const [newScheduleInput, setNewScheduleInput] = useState('')

  // 지우님이 정해주신 세련된 뮤트 톤 카테고리 컬러 팔레트
  const sophisticatedColors = [
    { name: '딥 테일', hex: '#7DCFB6' },
    { name: '뮤트 코랄', hex: '#E87474' },
    { name: '뮤트 세이지', hex: '#BCCBA3' },
    { name: '소프트 라벤더', hex: '#D1C4E9' },
    { name: '뮤트 베이지', hex: '#DBCBBD' }
  ];

  // 오늘의 브리핑 문구 (image_12.png 복제)
  const briefingText = "지우님, 오늘 오후에 비 소식이 있고 12시 반에 '알바 면접'이 있어요. 12시 정각에는 출발하시는 걸 추천해요.";

  // 2026년 7월 기준 35칸 완전한 달력 데이터 설계 (이전/이후 달 포함 5주 그리드)
  const calendarDays = [
    { day: 29, isCurrentMonth: false, dateStr: '2026-06-29' },
    { day: 30, isCurrentMonth: false, dateStr: '2026-06-30' },
    { day: 1, isCurrentMonth: true, dateStr: '2026-07-01' },
    { day: 2, isCurrentMonth: true, dateStr: '2026-07-02' },
    { day: 3, isCurrentMonth: true, dateStr: '2026-07-03' },
    { day: 4, isCurrentMonth: true, dateStr: '2026-07-04' },
    { day: 5, isCurrentMonth: true, dateStr: '2026-07-05' },
    { day: 6, isCurrentMonth: true, dateStr: '2026-07-06' },
    { day: 7, isCurrentMonth: true, dateStr: '2026-07-07', event: { time: '10:00', title: '치과', color: sophisticatedColors[1].hex } },
    { day: 8, isCurrentMonth: true, dateStr: '2026-07-08' },
    { day: 9, isCurrentMonth: true, dateStr: '2026-07-09' },
    { day: 10, isCurrentMonth: true, dateStr: '2026-07-10', event: { time: '19:00', title: '저녁 약속', color: sophisticatedColors[4].hex } },
    { day: 11, isCurrentMonth: true, dateStr: '2026-07-11' },
    { day: 12, isCurrentMonth: true, dateStr: '2026-07-12' },
    { day: 13, isCurrentMonth: true, dateStr: '2026-07-13' },
    { day: 14, isCurrentMonth: true, dateStr: '2026-07-14' },
    { day: 15, isCurrentMonth: true, dateStr: '2026-07-15' },
    { day: 16, isCurrentMonth: true, dateStr: '2026-07-16' },
    { day: 17, isCurrentMonth: true, dateStr: '2026-07-17', isToday: true, event: { time: '12:30', title: '알바 면접', color: sophisticatedColors[0].hex } },
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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

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
      
      {/* 1. 오늘의 비서 브리핑 배너 (image_12.png 복제) */}
      <div className="border border-neutral-200 p-6 space-y-5 rounded-none shadow-none bg-neutral-50/20 relative">
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-neutral-950"></div>
        <div className="space-y-3">
          <p className="text-xs font-semibold text-neutral-400 tracking-wider">오늘의 브리핑</p>
          <h2 className="text-sm text-neutral-800 leading-relaxed font-normal">{briefingText}</h2>
        </div>
        
        {/* 하단 기상 및 일정 메트릭 */}
        <div className="flex items-center gap-6 pt-1 text-xs text-neutral-500 font-mono tracking-wide">
          <div className="flex items-center gap-1.5">
            <CloudRain size={14} className="text-neutral-400" />
            <span>강수확률 70%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sun size={14} className="text-neutral-400" />
            <span>현재 <span className="font-bold text-neutral-800">24°C</span></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-neutral-300"></span>
            <span>다음 일정 <span className="font-bold text-neutral-800">12:30</span></span>
          </div>
        </div>
      </div>

      {/* 테스트 편의를 위한 임시 UI 조작 버튼 (AI 분석 레이아웃 확인용) */}
      <div className="flex justify-end">
        <button 
          onClick={() => setShowAiModal(true)} 
          className="text-xs text-neutral-400 hover:text-neutral-900 border border-neutral-200 px-2 py-1 rounded-sm"
        >
          [UI 테스트용] AI 확인 모달 켜기
        </button>
      </div>

      {/* 2. 메인 컨텐츠 그리드 (달력 + 할일 레이아웃) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-4">
        
        {/* 달력 섹션 (좌측 2/3 차지) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-neutral-950">2026년 7월</h3>
            <div className="flex items-center gap-3 text-neutral-400 text-xs font-mono">
              <button className="hover:text-neutral-900"><ChevronLeft size={16} /></button>
              <span className="tracking-widest">JUL</span>
              <button className="hover:text-neutral-900"><ChevronRight size={16} /></button>
            </div>
          </div>

          {/* 달력 그리드 (31일까지 전체 표시) */}
          <div className="border-t border-l border-neutral-200 grid grid-cols-7 text-center">
            {/* 요일 헤더 */}
            {['월', '화', '수', '목', '금', '토', '일'].map((day) => (
              <div key={day} className="border-b border-r border-neutral-200 py-2 text-xs font-medium text-neutral-400 bg-neutral-50/50">
                {day}
              </div>
            ))}
            
            {/* 35일 전체 그리드 출력 */}
            {calendarDays.map((cell, idx) => (
              <div 
                key={idx} 
                className={`border-b border-r border-neutral-200 p-2 min-h-[90px] text-left text-xs font-mono space-y-1 ${
                  cell.isCurrentMonth ? 'text-neutral-500' : 'text-neutral-300'
                } ${cell.isToday ? 'bg-neutral-50/10' : ''}`}
              >
                <div className="flex justify-between items-center">
                  {cell.isToday ? (
                    <span className="w-5 h-5 flex items-center justify-center bg-neutral-950 text-white rounded-full font-bold">{cell.day}</span>
                  ) : (
                    <span>{cell.day < 10 && cell.isCurrentMonth ? `0${cell.day}` : cell.day}</span>
                  )}
                </div>
                
                {cell.event && (
                  <div style={{ borderColor: cell.event.color }} className="border-l-2 pl-1.5 py-0.5 text-[10px] leading-tight text-neutral-700 bg-neutral-50/50">
                    <span className="font-mono text-neutral-400 block">{cell.event.time}</span>
                    {cell.event.title}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 할 일 관리 섹션 (우측 1/3 차지) */}
        <div className="space-y-6">
          <div className="flex justify-between items-baseline">
            <h3 className="text-base font-bold text-neutral-950">할 일</h3>
            <span className="text-xs font-mono text-neutral-400">4개 남음</span>
          </div>

          {/* 할 일 입력창 */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="새 할 일을 입력하고 Enter..."
              className="flex-1 rounded-sm border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-950 outline-none focus:border-neutral-900"
            />
            <button className="rounded-sm bg-neutral-950 px-4 py-2 text-sm font-medium text-white flex items-center gap-1 hover:opacity-90">
              <Plus size={14} />
              <span>추가</span>
            </button>
          </div>

          {/* 할 일 리스트 루프 */}
          <div className="divide-y divide-neutral-200 border-b border-neutral-200">
            {/* 진행 중인 리스트 */}
            <div className="flex items-center justify-between py-3 group">
              <div className="flex items-center gap-3">
                <button className="text-neutral-300 hover:text-neutral-900"><Square size={18} /></button>
                <div className="flex items-baseline gap-2">
                  <span style={{ backgroundColor: sophisticatedColors[2].hex }} className="w-1.5 h-1.5 rounded-full block"></span>
                  <span className="text-sm text-neutral-800">한국사 책 읽기</span>
                </div>
              </div>
              <span className="text-xs font-mono text-neutral-400 hidden group-hover:block">07-18</span>
            </div>

            <div className="flex items-center justify-between py-3 group">
              <div className="flex items-center gap-3">
                <button className="text-neutral-300 hover:text-neutral-900"><Square size={18} /></button>
                <div className="flex items-baseline gap-2">
                  <span className="w-1.5 h-1.5 rounded-full block bg-neutral-300"></span>
                  <span className="text-sm text-neutral-800">이번 주말 방 청소</span>
                </div>
              </div>
              <button className="text-neutral-300 hover:text-neutral-500 hidden group-hover:block"><X size={14} /></button>
            </div>

            <div className="flex items-center justify-between py-3 group">
              <div className="flex items-center gap-3">
                <button className="text-neutral-300 hover:text-neutral-900"><Square size={18} /></button>
                <div className="flex items-baseline gap-2">
                  <span style={{ backgroundColor: sophisticatedColors[3].hex }} className="w-1.5 h-1.5 rounded-full block"></span>
                  <span className="text-sm text-neutral-800">신용카드 명세서 확인</span>
                </div>
              </div>
              <span className="text-xs font-mono text-neutral-400">07-20</span>
            </div>

            <div className="flex items-center justify-between py-3 group">
              <div className="flex items-center gap-3">
                <button className="text-neutral-300 hover:text-neutral-900"><Square size={18} /></button>
                <span className="text-sm text-neutral-800">포트폴리오 업데이트</span>
              </div>
            </div>
          </div>

          {/* 완료 목록 분리 처리 */}
          <div className="space-y-2 pt-2">
            <p className="text-xs text-neutral-400 font-mono">완료됨 — 2</p>
            <div className="divide-y divide-neutral-100">
              <div className="flex items-center gap-3 py-2">
                <button className="text-neutral-900"><CheckSquare size={18} /></button>
                <span className="text-sm text-neutral-400 line-through">보험 서류 제출</span>
              </div>
              <div className="flex items-center gap-3 py-2">
                <button className="text-neutral-900"><CheckSquare size={18} /></button>
                <span className="text-sm text-neutral-400 line-through">주간 식료품 구매</span>
              </div>
            </div>
          </div>

          {/* 하단 로그아웃 버튼 배치 */}
          <div className="pt-8">
            <button
              onClick={() => supabase.auth.signOut()}
              className="text-xs text-neutral-400 hover:text-neutral-900 underline underline-offset-4"
            >
              로그아웃 계정: {session.user.email}
            </button>
          </div>
        </div>
      </div>

      {/* 3. [요청 핵심 반영] 화면 하단 고정형 반투명 AI 입력 바 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/85 backdrop-blur-md border-t border-neutral-200 py-4 px-8 z-40">
        <div className="max-w-7xl mx-auto flex gap-2 items-center">
          
          {/* 마이크 음성 입력 아이콘 버튼 */}
          <button 
            type="button"
            className="p-2.5 text-neutral-500 hover:text-neutral-900 border border-neutral-300 rounded-sm bg-white active:bg-neutral-50 transition-colors"
            title="음성 인식 시작"
          >
            <Mic size={18} />
          </button>

          {/* 인풋 영역 */}
          <input
            type="text"
            value={newScheduleInput}
            onChange={(e) => setNewScheduleInput(e.target.value)}
            placeholder="대충 말해도 괜찮아요 - 예: 다음 주 주말 방 청소"
            className="flex-1 rounded-sm border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-950 outline-none focus:border-neutral-900 transition-colors"
          />

          {/* 분석 버튼 */}
          <button 
            onClick={() => {
              if(newScheduleInput.trim()){ setShowAiModal(true); setNewScheduleInput(''); }
            }}
            className="rounded-sm bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 active:opacity-100 disabled:opacity-40 transition-opacity"
            disabled={!newScheduleInput.trim()}
          >
            분석
          </button>
        </div>
      </div>

      {/* 4. AI 파싱 확인 모달 오버레이 */}
      {showAiModal && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-white border border-neutral-200 p-6 space-y-6 rounded-none shadow-none">
            <div className="space-y-1">
              <span className="text-xs font-medium text-neutral-400 block">AI 분석 결과</span>
              <h4 className="text-sm font-bold text-neutral-950">"내일 3시 알바 면접" 을 분석했어요</h4>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-neutral-600">제목</label>
                <input type="text" defaultValue="알바 면접" className="w-full border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-950 outline-none focus:border-neutral-900 rounded-sm" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-neutral-600">날짜</label>
                  <input type="text" defaultValue="2026.07.18" className="w-full border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-950 outline-none focus:border-neutral-900 rounded-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-neutral-600">시간</label>
                  <input type="text" defaultValue="15:00" className="w-full border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-950 outline-none focus:border-neutral-900 rounded-sm" />
                </div>
              </div>

              {/* 카테고리 선택 */}
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-medium text-neutral-600 mb-2">카테고리</label>
                <div className="flex gap-2">
                  <span className="w-8 h-8 rounded-full flex items-center justify-center border border-neutral-950 cursor-pointer">
                    <CheckSquare size={14} className="text-neutral-950" />
                  </span>
                  {sophisticatedColors.map(color => (
                    <span 
                      key={color.hex} 
                      style={{ backgroundColor: color.hex }} 
                      className="w-8 h-8 rounded-full border border-neutral-100 cursor-pointer transition-transform hover:scale-110 active:scale-95" 
                      title={color.name}
                    ></span>
                  ))}
                  <span className="w-8 h-8 rounded-full bg-neutral-950 flex items-center justify-center cursor-pointer border border-neutral-950">
                    <Plus size={14} className="text-white" />
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button onClick={() => setShowAiModal(false)} className="border border-neutral-300 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50 rounded-sm">
                취소
              </button>
              <button onClick={() => setShowAiModal(false)} className="bg-neutral-950 py-2 text-sm font-medium text-white hover:opacity-90 rounded-sm">
                최종 저장
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}