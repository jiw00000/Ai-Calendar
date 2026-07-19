import React, { useState, useEffect } from 'react'
import { Loader2, CloudRain, Sun, Cloud, CloudSun, Wind } from 'lucide-react'

const fortuneActions = [
  "따뜻한 차를 마시면", "주변을 가볍게 정리하면", "잠시 깊은 숨을 쉬면", "새로운 음악을 들으면", "짧은 안부를 전하면",
  "과거 메모를 읽어보면", "다른 길로 걸어보면", "잠시 창밖을 바라보면", "폰을 잠시 내려놓으면", "작은 다정함을 베풀면"
];

const fortuneResults = [
  "좋은 영감이 떠오르는", "마음이 한결 가벼워지는", "고민이 쉽게 풀리는", "새로운 에너지가 생기는", "명확한 실마리를 찾는",
  "깊은 몰입이 시작되는", "반가운 변화가 생기는", "뜻밖의 힌트를 얻는", "잔잔한 기쁨이 찾아오는", "하루가 더 밀도 있어지는"
];

export default function BriefingBanner({ events, userEmail, darkMode }) { 
  const [now, setNow] = useState(new Date()) 
  const [weather, setWeather] = useState({
    temp: '24', rainChance: '0', desc: '맑음', location: '내 위치', windSpeed: '0.0', humidity: '0', loading: true
  })
  const [dynamicBriefing, setDynamicBriefing] = useState("오늘도 기분 좋은 하루 보내세요!")
  const [todayFortune, setTodayFortune] = useState("")

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

  useEffect(() => {
    const timeTimer = setInterval(() => { setNow(new Date()) }, 10000)
    return () => clearInterval(timeTimer)
  }, [])

  useEffect(() => {
    const fetchWeatherLive = () => {
      fetch('https://wttr.in/?format=j1')
        .then(res => res.json())
        .then(data => {
          const current = data.current_condition?.[0];
          const todayWeather = data.weather?.[0];
          const rawLocation = data.nearest_area?.[0]?.areaName?.[0]?.value || '내 위치';
          const koreanLocation = translateLocation(rawLocation); 
          
          const maxRainChance = todayWeather?.hourly ? Math.max(...todayWeather.hourly.map(h => parseInt(h.chanceofrain || 0))) : 0;
          const windKmh = parseFloat(current?.windspeedKmph || 0);
          const windMs = (windKmh / 3.6).toFixed(1);
          
          let desc = '맑음';
          const rawDesc = (current?.lang_kr?.[0]?.value || current?.weatherDesc?.[0]?.value || 'Clear').toLowerCase();
          if (rawDesc.includes('rain') || rawDesc.includes('비')) desc = '비';
          else if (rawDesc.includes('cloud') || rawDesc.includes('흐림')) desc = '흐림';

          setWeather({
            temp: current?.temp_C || '24', rainChance: maxRainChance, desc, location: koreanLocation, windSpeed: windMs, humidity: current?.humidity || '0', loading: false
          })
        })
        .catch(err => {
          console.error("실시간 날씨 갱신 실패:", err)
          setWeather(prev => ({ ...prev, loading: false }))
        })
    }
    fetchWeatherLive()
    const weatherTimer = setInterval(fetchWeatherLive, 300000) 
    return () => clearInterval(weatherTimer)
  }, [])

  useEffect(() => {
    const todayStr = new Date().toLocaleDateString('sv-SE');
    let dateHash = 0;
    for (let i = 0; i < todayStr.length; i++) { dateHash += todayStr.charCodeAt(i); }
    const actionIndex = dateHash % fortuneActions.length;
    const resultIndex = (dateHash + 7) % fortuneResults.length; 
    setTodayFortune(`${fortuneActions[actionIndex]} ${fortuneResults[resultIndex]} 하루가 될 것입니다.`);
  }, [])

  // 💡 [실시간 브리핑 완전 개조] 일정 문구 뒤에 지우님이 정의한 5대 날씨 멘트가 유기적으로 따라붙습니다.
  useEffect(() => {
    const todayStr = now.toLocaleDateString('sv-SE');
    const todayEvents = (events || [])
      .filter(e => e.date === todayStr)
      .map(e => {
        if (!e.time) return { ...e, startObj: new Date(0), endObj: new Date(0) };
        const [hh, mm] = e.time.split(':').map(Number);
        const startObj = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm, 0);
        const durationHours = e.duration || 1;
        const endObj = new Date(startObj.getTime() + durationHours * 60 * 60 * 1000);
        return { ...e, startObj, endObj };
      })
      .sort((a, b) => a.startObj - b.startObj);

    const activeOrUpcomingEvents = todayEvents.filter(e => e.endObj > now);

    // 1단계: 일정 상태 파악
    let scheduleText = "";
    if (todayEvents.length === 0) { 
      scheduleText = "오늘 등록된 일정이 없습니다."; 
    } 
    else if (activeOrUpcomingEvents.length === 0) { 
      scheduleText = "오늘 모든 일정을 마쳤습니다."; 
    } 
    else {
      const currentActive = activeOrUpcomingEvents[0];
      const remainingCount = activeOrUpcomingEvents.length - 1;
      const timeStr = currentActive.time === '00:00' || !currentActive.time ? '종일' : currentActive.time;
      scheduleText = `${timeStr} '${currentActive.title}' 일정이 있습니다. 남은 일정은 ${remainingCount}개입니다.`;
    }

    // 2단계: 지우님 전용 5가지 날씨 조건 연산 처리
    let weatherAlertText = "";
    const rainNum = parseInt(weather.rainChance || 0);
    const windNum = parseFloat(weather.windSpeed || 0);
    const tempNum = parseInt(weather.temp || 24);

    if (rainNum >= 50) {
      weatherAlertText = " 현재 강수 확률이 높으니 외출 시 우산을 꼭 챙기세요!";
    } else if (windNum >= 4.5) {
      weatherAlertText = ` 현재 바람이 ${weather.windSpeed}m/s로 강하게 부니 안전에 유의하세요.`;
    } else if (tempNum >= 30) {
      // 섭씨 30도 이상 더운 날씨 멘트
      weatherAlertText = ` 현재 기온이 ${weather.temp}°C로 더운 날씨이니 지치지 않게 유의하세요!`;
    } else if (tempNum <= 8) {
      // 섭씨 8도 이하 추운 날씨 멘트
      weatherAlertText = ` 현재 기온이 ${weather.temp}°C로 추운 날씨이니 따뜻하게 입고 외출하세요!`;
    } else {
      weatherAlertText = " 쾌적한 날씨 속에서 기분 좋은 하루 보내세요!";
    }

    setDynamicBriefing(`${scheduleText}${weatherAlertText}`);
  }, [now, events, weather.rainChance, weather.windSpeed, weather.temp]) 

  const getWeatherIcon = (desc) => {
    if (desc === '비') return <CloudRain size={14} className="text-neutral-500" />;
    if (desc === '흐림') return <Cloud size={14} className="text-neutral-400" />;
    return <Sun size={14} className="text-neutral-400" />;
  };

  return (
    <div className={`border p-4 sm:p-6 rounded-none shadow-none flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-6 relative transition-colors duration-300 ${
      darkMode ? 'border-neutral-800 bg-neutral-900/60' : 'border-neutral-200 bg-white sm:bg-neutral-50/10'
    }`}>
      <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${darkMode ? 'bg-white' : 'bg-neutral-950'}`}></div>
      
      <div className="flex-1 w-full space-y-2.5 sm:space-y-4 pr-0 sm:pr-4">
        <div className="space-y-1.5 sm:space-y-2">
          <p className="text-[11px] sm:text-xs font-semibold text-neutral-400 tracking-wider flex items-center gap-2 select-none">
            오늘의 브리핑
            {weather.loading && <Loader2 size={10} className="animate-spin text-neutral-300" />}
          </p>
          <h2 className={`text-[13px] sm:text-sm leading-relaxed font-normal ${darkMode ? 'text-white' : 'text-neutral-800'}`}>
            {dynamicBriefing}
          </h2>
        </div>

        <div className="text-[11px] sm:text-xs flex items-center gap-1.5 font-medium pt-0.5 italic">
          <span className="not-italic">🍀</span> <span className={darkMode ? 'text-neutral-400' : 'text-neutral-600'}>{todayFortune}</span>
        </div>

        {/* 💡 [모바일 뷰] 구조 그대로 순서 유지 + 강수량 탈락 후 아이콘 포함 강수확률 안착 */}
        <div className={`flex md:hidden items-center gap-2 text-[12px] font-medium pt-1.5 select-none tracking-tight ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
          <span>{weather.location}</span>
          <span className="text-neutral-300 dark:text-neutral-600">|</span>
          <span>{weather.desc}</span>
          <span className="text-neutral-300 dark:text-neutral-600">|</span>
          <span>{weather.temp}°C</span>
          <span className="text-neutral-300 dark:text-neutral-600">|</span>
          <span className="flex items-center gap-1"><CloudRain size={13} className="text-neutral-400" /> {weather.rainChance}%</span>
        </div>
      </div>

      {/* 💡 [데스크탑 뷰] 여기도 동일하게 아이콘 포함 강수확률로 완벽 변환 */}
      <div className={`hidden md:flex shrink-0 w-full md:w-auto md:self-stretch flex-col items-end justify-center md:pl-8 md:border-l font-sans text-right select-none space-y-1 transition-colors ${
        darkMode ? 'border-white/20' : 'border-neutral-200/80'
      }`}>
        <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium tracking-tight">
          {getWeatherIcon(weather.desc)}
          <span className={darkMode ? 'text-neutral-400' : ''}>{weather.location}</span>
        </div>
        <div className={`text-5xl font-light font-sans tracking-tighter py-0.5 ${darkMode ? 'text-white' : 'text-neutral-950'}`}>
          {weather.temp}°
        </div>
        <div className="text-xs text-neutral-400 font-medium flex items-center gap-1 tracking-tight">
          <span>{weather.desc}</span>
          <span className="text-neutral-200 font-light">·</span>
          <span className="inline-flex items-center gap-0.5 font-mono text-[11px]">
            🌬️ {weather.windSpeed} m/s
          </span>
        </div>
        <div className="text-[11px] text-neutral-400 font-medium tracking-tight font-mono pt-0.5 flex items-center gap-1 justify-end select-none">
          습도 {weather.humidity}% <span className="text-neutral-200 font-light font-sans px-0.5">·</span> <CloudRain size={12} className="text-neutral-400" /> {weather.rainChance}%
        </div>
      </div>
    </div>
  )
}