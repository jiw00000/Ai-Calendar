import React, { useState, useEffect } from 'react'
import { Loader2, CloudRain, Sun, Cloud, CloudSun } from 'lucide-react'

// 컴팩트하게 줄인 행동 단어 (10개)
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

// 슬림하게 압축한 결과 단어 (10개)
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
  // 날씨 상태 구조
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

  // 영문 날씨 텍스트 번역 사전
  const translateWeatherDesc = (desc) => {
    if (!desc) return '맑음';
    const d = desc.toLowerCase().trim();
    if (d.includes('clear') || d.includes('sunny')) return '맑음';
    if (d.includes('partly cloudy')) return '구름 조금';
    if (d.includes('cloudy')) return '흐림';
    if (d.includes('overcast')) return '흐림';
    if (d.includes('mist') || d.includes('fog') || d.includes('haze')) return '안개';
    if (d.includes('patchy rain') || d.includes('light rain shower')) return '한때 비';
    if (d.includes('light rain')) return '가벼운 비';
    if (d.includes('heavy rain') || d.includes('torrential')) return '폭우';
    if (d.includes('rain')) return '비 소식';
    if (d.includes('snow')) return '눈 소식';
    return desc; 
  };

  // 영문 도시명 한국어 맵
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

  // 미니멀 날씨 아이콘 매칭
  const getWeatherIcon = (desc) => {
    const d = desc.toLowerCase();
    if (d.includes('비') || d.includes('rain') || d.includes('한때')) return <CloudRain size={14} className="text-neutral-500" />;
    if (d.includes('구름') || d.includes('cloud')) return <Cloud size={14} className="text-neutral-400" />;
    if (d.includes('흐림') || d.includes('overcast')) return <CloudSun size={14} className="text-neutral-500" />;
    return <Sun size={14} className="text-neutral-600" />;
  };

  // 1. 실시간 위치 기반 날씨 데이터 가져오기 및 조립형 고정 운세 연산
  useEffect(() => {
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

        const rawDesc = current?.lang_kr?.[0]?.value || current?.weatherDesc?.[0]?.value || 'Clear';
        const koreanDesc = translateWeatherDesc(rawDesc);

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
        console.error("날씨 정보 갱신 에러:", err)
        setWeather(prev => ({ ...prev, loading: false }))
      })

    // 오늘 진짜 실시간 날짜 기반 해시 연산
    const todayStr = new Date().toLocaleDateString('sv-SE');
    let dateHash = 0;
    for (let i = 0; i < todayStr.length; i++) {
      dateHash += todayStr.charCodeAt(i);
    }
    
    const actionIndex = dateHash % fortuneActions.length;
    const resultIndex = (dateHash + 7) % fortuneResults.length; 
    
    const combinedSentence = `${fortuneActions[actionIndex]} ${fortuneResults[resultIndex]} 하루가 될 것입니다.`;
    setTodayFortune(combinedSentence);

  }, [])

  // 2. 일정 + 실시간 강수량/바람 조건 분석 브리핑 시스템
  useEffect(() => {
    const todayStr = new Date().toLocaleDateString('sv-SE'); 
    const todayEvents = (events || [])
      .filter(e => e.date === todayStr)
      .sort((a, b) => (a.time || '23:59').localeCompare(b.time || '23:59'));

    let scheduleText = "";
    if (todayEvents.length > 0) {
      const firstEvent = todayEvents[0];
      scheduleText = `오늘 ${firstEvent.time ? `${firstEvent.time}에` : '종일'} '${firstEvent.title}' 일정이 준비되어 있어요.`;
    } else {
      scheduleText = `오늘 등록된 일정이 없습니다.`;
    }

    let weatherAlertText = "";
    const rainNum = parseInt(weather.rainChance || 0);
    const windNum = parseFloat(weather.windSpeed || 0);

    if (rainNum >= 50) {
      weatherAlertText = " 현재 강수 확률이 높으니 외출 시 우산을 꼭 챙기세요!";
    } else if (windNum >= 4.5) {
      weatherAlertText = ` 현재 바람이 ${weather.windSpeed}m/s로 강하게 부니 옷차림과 안전에 유의하세요.`;
    } else {
      weatherAlertText = " 쾌적한 날씨 속에서 기분 좋은 하루 보내세요!";
    }

    setDynamicBriefing(`${scheduleText}${weatherAlertText}`);
  }, [events, weather.rainChance, weather.windSpeed])

  return (
    <div className="border border-neutral-200 p-6 rounded-none shadow-none bg-neutral-50/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative min-h-[140px]">
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-neutral-950"></div>
      
      {/* [왼쪽 영역] 브리핑 텍스트 + 네잎클로버 오늘의 문장 조각 */}
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
        
        {/* 💡 [수정 완료] 첫 일정 라인을 완전히 제거하고, 🍀 아이콘과 함께 문장만 투명하게 배치 */}
        <div className="flex items-baseline gap-1.5 text-xs select-none pt-1">
          <span className="text-[11px] flex-shrink-0">🍀</span>
          <span className="italic text-neutral-500/90 leading-relaxed font-normal tracking-tight">
            {todayFortune}
          </span>
        </div>
      </div>

      {/* [오른쪽 영역] 우측 밀착 날씨 섹션 */}
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