import React, { useState, useEffect } from 'react'
import { CloudRain, Sun, Loader2, MapPin } from 'lucide-react'

// 💡 userEmail 프로프(Props)를 부모로부터 새로 전달받습니다.
export default function BriefingBanner({ events, userEmail }) {
  // 이메일에서 @ 앞자리만 잘라내어 활동명(이름)으로 사용합니다. (없으면 '사용자'로 대체)
  const userName = userEmail ? userEmail.split('@')[0] : '사용자';

  // 날씨 및 지역 상태 관리
  const [weather, setWeather] = useState({
    temp: '24',
    rainChance: '0',
    desc: '맑음',
    location: '내 위치',
    loading: true
  })

  const [dynamicBriefing, setDynamicBriefing] = useState(`${userName}님, 오늘도 좋은 하루 보내세요!`)
  const [nextEventTime, setNextEventTime] = useState(null)

  // 1. 사용자의 IP 기반 실시간 자동 위치 및 날씨 감지 Fetch
  useEffect(() => {
    fetch('https://wttr.in/?format=j1')
      .then(res => res.json())
      .then(data => {
        const current = data.current_condition?.[0];
        const todayWeather = data.weather?.[0];
        const detectedLocation = data.nearest_area?.[0]?.areaName?.[0]?.value || '내 위치';
        
        const maxRainChance = todayWeather?.hourly
          ? Math.max(...todayWeather.hourly.map(h => parseInt(h.chanceofrain || 0)))
          : 0;

        setWeather({
          temp: current?.temp_C || '24',
          rainChance: maxRainChance,
          desc: current?.lang_kr?.[0]?.value || current?.weatherDesc?.[0]?.value || '맑음',
          location: detectedLocation,
          loading: false
        })
      })
      .catch(err => {
        console.error("날씨 로드 실패:", err)
        setWeather(prev => ({ ...prev, loading: false }))
      })
  }, [])

  // 2. 실제 등록된 일정 기반 실시간 브리핑 문구 생성 (💡 지우님 하드코딩 박멸 완료!)
  useEffect(() => {
    // 💡 고정된 문자열을 지우고 이 코드를 넣어주면 내일이 되어도 코드가 알아서 작동합니다.
    const todayStr = new Date().toLocaleDateString('sv-SE'); 
    const todayEvents = (events || [])
      .filter(e => e.date === todayStr)
      .sort((a, b) => (a.time || '23:59').localeCompare(b.time || '23:59'));

    if (todayEvents.length > 0) {
      const firstEvent = todayEvents[0]
      setNextEventTime(firstEvent.time || '종일')

      if (parseInt(weather.rainChance) >= 50) {
        setDynamicBriefing(
          `${userName}님, 오늘 강수확률이 ${weather.rainChance}%로 높고, ${firstEvent.time ? `${firstEvent.time}에` : '종일'} '${firstEvent.title}' 일정이 있어요. 외출 시 우산을 꼭 챙기세요!`
        )
      } else {
        setDynamicBriefing(
          `${userName}님, 오늘 ${firstEvent.time ? `${firstEvent.time}에` : '종일'} '${firstEvent.title}' 일정이 준비되어 있어요. 기분 좋은 하루 보내세요!`
        )
      }
    } else {
      setNextEventTime(null)
      if (parseInt(weather.rainChance) >= 50) {
        setDynamicBriefing(`${userName}님, 오늘 특별한 일정은 없지만 비 소식이 있어요 (${weather.rainChance}%). 창문을 잘 확인하세요!`)
      } else {
        setDynamicBriefing(`${userName}님, 오늘 등록된 일정이 없습니다. 하단 바를 통해 새로운 계획을 말해 주세요!`)
      }
    }
  }, [events, weather.rainChance, userName]) // 💡 userName이 바뀌어도 브리핑 문구가 실시간으로 리프레시됩니다.

  return (
    <div className="border border-neutral-200 p-6 space-y-5 rounded-none shadow-none bg-neutral-50/20 relative">
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-neutral-950"></div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <p className="text-xs font-semibold text-neutral-400 tracking-wider flex items-center gap-2">
            오늘의 AI 브리핑
            {weather.loading && <Loader2 size={10} className="animate-spin text-neutral-300" />}
          </p>
          
          <div className="flex items-center gap-1 text-[10px] text-neutral-400 font-mono">
            <MapPin size={10} />
            <span>{weather.location.toUpperCase()}</span>
          </div>
        </div>
        
        <h2 className="text-sm text-neutral-800 leading-relaxed font-normal">
          {dynamicBriefing}
        </h2>
      </div>
      
      {/* 메트릭 영역 */}
      <div className="flex items-center gap-6 pt-1 text-xs text-neutral-500 font-mono tracking-wide">
        <div className="flex items-center gap-1.5">
          <CloudRain size={14} className="text-neutral-400" />
          <span>강수확률 {weather.rainChance}%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Sun size={14} className="text-neutral-400" />
          <span>현재 <span className="font-bold text-neutral-800">{weather.temp}°C</span> ({weather.desc})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-neutral-300"></span>
          <span>오늘 첫 일정: <span className="font-bold text-neutral-800">{nextEventTime || '없음'}</span></span>
        </div>
      </div>
    </div>
  )
}