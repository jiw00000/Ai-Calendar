import React from 'react'
import { CloudRain, Sun } from 'lucide-react'

export default function BriefingBanner() {
  const briefingText = "지우님, 오늘 오후에 비 소식이 있고 12시 반에 '알바 면접'이 있어요. 12시 정각에는 출발하시는 걸 추천해요.";

  return (
    <div className="border border-neutral-200 p-6 space-y-5 rounded-none shadow-none bg-neutral-50/20 relative">
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-neutral-950"></div>
      <div className="space-y-3">
        <p className="text-xs font-semibold text-neutral-400 tracking-wider">오늘의 브리핑</p>
        <h2 className="text-sm text-neutral-800 leading-relaxed font-normal">{briefingText}</h2>
      </div>
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
  )
}