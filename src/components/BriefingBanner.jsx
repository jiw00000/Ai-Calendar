import React, { useState, useEffect } from 'react'
import { Loader2, CloudRain, Sun, Cloud, CloudSun } from 'lucide-react'

// 컴팩트한 행동 단어 조각 (10개)
const fortuneActions = [
  "따뜻한 차를 마시면",
  "주변을 가볍게 정리하면",
  "잠시 깊은 숨을 쉬면",
  "새로운 음악을 들으면",
  "짧은 안부를 전하면",
  "과거 메모를 읽어보면",
  "다른 길로 걸어보면",
  "잠시 창밖을 바라보면",
  "폰을 잠시 내려놓으면",
  "작은 다정함을 베풀면"
];

// 컴팩트한 결과 단어 조각 (10개)
const fortuneResults = [
  "좋은 영감이 떠오르는",
  "마음이 한결 가벼워지는",
  "고민이 쉽게 풀리는",
  "새로운 에너지가 생기는",
  "명확한 실마리를 찾는",
  "깊은 몰입이 시작되는",
  "반가운 변화가 생기는",
  "뜻밖의 힌트를 얻는",
  "잔잔한 기쁨이 찾아오는",
  "하루가 더 밀도 있어지는"
];

export default function BriefingBanner({ events, userEmail }) {
  // 💡 실시간 시간 변화를 감지하기 위한 내부 시계 상태 (10초마다 갱신)
  const [now, setNow] = useState(new Date())
  
  const [weather, setWeather] = useState({
    temp: '24',
    rainChance: '0',
    desc: '맑음',
    location: '내 위치',
    windSpeed: '0.0',
    humidity: '0',
    precip: '0.0',
    loading: true
  })

  const [dynamicBriefing, setDynamicBriefing] = useState("오늘도 기분 좋은 하루 보내세요!")
  const [todayFortune, setTodayFortune] = useState("")

  // 1. 실시간 시계 작동 가동 (10초 주기로 현재 시각 업데이트)
  useEffect(() => {
    const timeTimer = setInterval(() => {
      setNow(new Date())
    }, 10000)
    return () => clearInterval(timeTimer)
  }, [])

  // 2. 💡 실시간 날씨 데이터 실시간 폴링 가동 (5분 주기 자동 리프레시)
  useEffect(() => {
    const fetchWeatherLive = () => {
      fetch('https://wttr.in/?format=j1')
        .then(res => res.json())
        .then(data => {
          const current = data.current_condition?.[0];
          const todayWeather = data.weather?.[0];
          
          const rawLocation = data.nearest_area?.[0]?.areaName?.[0]?.value || '내 위치';
          const koreanLocation = translateLocation(rawLocation);
          
          const maxRainChance = todayWeather?.hourly
            ? Math.max(...todayWeather.hourly.map(h => parseInt(h.chanceofrain || 0)))
            : 0;

          const windKmh = parseFloat(current?.windspeedKmph || 0);
          const windMs = (windKmh / 3.6).toFixed(1);
          const koreanDesc = translateWeatherDesc(current?.lang_kr?.[0]?.value || current?.weatherDesc?.[0]?.value || 'Clear');

          setWeather({
            temp: current?.temp_C || '24',
            rainChance: maxRainChance,
            desc: koreanDesc,
            location: koreanLocation,
            windSpeed: windMs,
            humidity: current?.humidity || '0',
            precip: current?.precipMM || '0.0',
            loading: false
          })
        })
        .catch(err => {
          console.error("실시간 날씨 갱신 실패:", err)
          setWeather(prev => ({ ...prev, loading: false }))
        })
    }

    fetchWeatherLive()
    const weatherTimer = setInterval(fetchWeatherLive, 300000) // 5분마다 실시간 체크
    return () => clearInterval(weatherTimer)
  }, [])

  // 3. 매일 고정되는 네잎클로버 한 줄 운세 생성
  useEffect(() => {
    const todayStr = new Date().toLocaleDateString('sv-SE');
    let dateHash = 0;
    for (let i = 0; i < todayStr.length; i++) {
      dateHash += todayStr.charCodeAt(i);
    }
    const actionIndex = dateHash % fortuneActions.length;
    const resultIndex = (dateHash + 7) % fortuneResults.length; 
    setTodayFortune(`${fortuneActions[actionIndex]} ${fortuneResults[resultIndex]} 하루가 될 것입니다.`);
  }, [])

  // 4. 💡 [엔진 대개조] 실시간 시간(now)과 날씨 변동을 조합하여 브리핑 실시간 연산
  useEffect(() => {
    const todayStr = now.toLocaleDateString('sv-SE');
    
    // 오늘 일정을 가져와 시간순 정렬 및 시작/종료 Date 객체 바인딩
    const todayEvents = (events || [])
      .filter(e => e.date === todayStr)
      .map(e => {
        if (!e.time) return { ...e, startObj: new Date(0), endObj: new Date(0) };
        const [hh, mm] = e.time.split(':').map(Number);
        const startObj = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm, 0);
        
        // 💡 만약 일정에 duration(시간 단위) 설정이 없으면 기본 1시간으로 처리
        const durationHours = e.duration || 1;
        const endObj = new Date(startObj.getTime() + durationHours * 60 * 60 * 1000);
        
        return { ...e, startObj, endObj };
      })
      .sort((a, b) => a.startObj - b.startObj);

    // 💡 아직 끝나지 않은 일정들만 필터링 (현재 진행 중이거나 앞으로 올 일정)
    const activeOrUpcomingEvents = todayEvents.filter(e => e.endObj > now);

    let scheduleText = "";
    if (todayEvents.length === 0) {
      scheduleText = "오늘 등록된 일정이 없습니다.";
    } else if (activeOrUpcomingEvents.length === 0) {
      scheduleText = "오늘 모든 일정을 마쳤습니다.";
    } else {
      // 현재 보여줄 가장 우선순위 높은 일정 선정
      const currentActive = activeOrUpcomingEvents[0];
      // 남은 일정 개수 계산 (현재 활성화된 일정 다음의 개수)
      const remainingCount = activeOrUpcomingEvents.length - 1;
      
      scheduleText = `${currentActive.time} ${currentActive.title} 일정이 있습니다. 남은 일정은 ${remainingCount}개입니다.`;
    }

    // 💡 실시간 날씨 데이터 가변 결합
    let weatherAlertText = "";
    const rainNum = parseInt(weather.rainChance || 0);
    const windNum = parseFloat(weather.windSpeed || 0);

    if (rainNum >= 50) {
      weatherAlertText = " 현재 강수 확률이 높으니 외출 시 우산을 꼭 챙기세요!";
    } else if (windNum >= 4.5) {
      weatherAlertText = ` 현재 바람이 ${weather.windSpeed}m/s로 강하게 부니 안전에 유의하세요.`;
    } else {
      weatherAlertText = " 쾌적한 날씨 속에서 기분 좋은 하루 보내세요!";
    }

    setDynamicBriefing(`${scheduleText}${weatherAlertText}`);
  }, [now, events, weather.rainChance, weather.windSpeed, weather.desc]) // 💡 이제 시간(now)이 바뀔 때마다 리런됩니다.

  // 영문 날씨 번역 사전
  const translateWeatherDesc = (desc) => {
    if (!desc) return '맑음';
    const d = desc.toLowerCase().trim();
    if (d.includes('clear') || d.includes('sunny')) return '맑음';
    if (d.includes('partly cloudy')) return '구름 조금';
    if (d.includes('cloudy') || d.includes('overcast')) return '흐림';
    if (d.includes('mist') || d.includes('fog') || d.includes('haze')) return '안개';
    if (d.includes('patchy rain') || d.includes('light rain shower')) return '한때 비';
    if (d.includes('light rain')) return '가벼운 비';
    if (d.includes('heavy rain') || d.includes('torrential')) return '폭우';
    if (d.includes('rain')) return '비 소식';
    if (d.includes('snow')) return '눈 소식';
    return desc; 
  };

  // 도시명 맵
  const translateLocation = (engLoc) => {
    const loc = engLoc.toLowerCase();
    if (loc.includes('seoul')) return '서울';
    if (loc.includes('busan')) return '부산';
    if (loc.includes('incheon')) return '인천';
    if (loc.includes('daegu')) return '대구';
    if (loc.includes('daejeon')) return '대전';
    if (loc.includes('gwangju')) return '광주';
    if (loc.includes('ulsan')) return '울산';
    if (loc.includes('gyeonggi')) return '경기';
    if (loc.includes('jeju')) return '제주';
    return engLoc;
  };

  const getWeatherIcon = (desc) => {
    const d = desc.toLowerCase();
    if (d.includes('비') || d.includes('rain') || d.includes('한때')) return <CloudRain size={14} className="text-neutral-500" />;
    if (d.includes('구름') || d.includes('cloud')) return <Cloud size={14} className="text-neutral-400" />;
    if (d.includes('흐림')) return <CloudSun size={14} className="text-neutral-500" />;
    return <Sun size={14} className="text-neutral-600" />;
  };

  return (
    <div className="border border-neutral-200 p-6 rounded-none shadow-none bg-neutral-50/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative min-h-[140px]">
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-neutral-950"></div>
      
      <div className="flex-1 w-full space-y-4 pr-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold text-neutral-400 tracking-wider flex items-center gap-2 select-none">
            오늘의 브리핑
            {weather.loading && <Loader2 size={10} className="animate-spin text-neutral-300" />}
          </p>
          <h2 className="text-sm text-neutral-800 leading-relaxed font-normal">
            {dynamicBriefing}
          </h2>
        </div>
        
        <div className="flex items-baseline gap-1.5 text-xs select-none pt-1">
          <span className="text-[11px] flex-shrink-0">🍀</span>
          <span className="italic text-neutral-500/90 leading-relaxed font-normal tracking-tight">
            {todayFortune}
          </span>
        </div>
      </div>

      <div className="shrink-0 w-full md:w-auto md:self-stretch flex flex-col items-end justify-center pl-8 border-t md:border-t-0 md:border-l border-neutral-200/80 font-sans text-right select-none space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium tracking-tight">
          {getWeatherIcon(weather.desc)}
          <span>{weather.location}</span>
        </div>
        <div className="text-5xl font-light text-neutral-950 font-sans tracking-tighter py-0.5">
          {weather.temp}°
        </div>
        <div className="text-xs text-neutral-400 font-medium flex items-center gap-1 tracking-tight">
          <span>{weather.desc}</span>
          <span className="text-neutral-200 font-light">·</span>
          <span className="inline-flex items-center gap-0.5 font-mono text-[11px]">
            🌬️ {weather.windSpeed} m/s
          </span>
        </div>
        <div className="text-[11px] text-neutral-400 font-medium tracking-tight font-mono pt-0.5">
          습도 {weather.humidity}% <span className="text-neutral-200 font-light font-sans px-0.5">·</span> 강수 {weather.precip}mm
        </div>
      </div>
    </div>
  )
}