import React from 'react'

export default function AiResultModal({ showAiModal, setShowAiModal, parsedResult, setParsedResult, onSaveResult, sophisticatedColors }) {
  if (!showAiModal) return null;

  return (
    <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md bg-white border border-neutral-200 p-6 space-y-6 rounded-none shadow-none">
        <div className="space-y-1"><span className="text-xs font-medium text-neutral-400 block">AI 분석 결과</span><h4 className="text-sm font-bold text-neutral-950">분석된 정밀 데이터를 확인해 주세요</h4></div>
        
        <div className="space-y-4">
          <div className="space-y-1.5"><label className="block text-xs font-medium text-neutral-600">제목</label><input type="text" value={parsedResult.title} onChange={(e) => setParsedResult(prev => ({ ...prev, title: e.target.value }))} className="w-full border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-950 outline-none focus:border-neutral-900 rounded-sm" /></div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><label className="block text-xs font-medium text-neutral-600">날짜</label><input type="text" value={parsedResult.date} onChange={(e) => setParsedResult(prev => ({ ...prev, date: e.target.value }))} className="w-full border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-950 outline-none focus:border-neutral-900 rounded-sm" /></div>
            <div className="space-y-1.5"><label className="block text-xs font-medium text-neutral-600">시간 (비워둘 시 To-do로 변경)</label><input type="text" value={parsedResult.time || ''} onChange={(e) => setParsedResult(prev => ({ ...prev, time: e.target.value, isTodo: !e.target.value }))} placeholder="예: 15:00" className="w-full border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-950 outline-none focus:border-neutral-900 rounded-sm" /></div>
          </div>
          
          <div className="space-y-2 pt-1">
            <label className="block text-xs font-medium text-neutral-600 mb-2">카테고리: <span className="font-bold text-neutral-800">{parsedResult.category}</span></label>
            <div className="flex gap-2">
              {sophisticatedColors.map(color => (
                <button key={color.hex} type="button" onClick={() => setParsedResult(prev => ({ ...prev, category: color.name, color: color.hex }))} style={{ backgroundColor: color.hex }} className={`w-8 h-8 rounded-full border cursor-pointer transition-all hover:scale-110 active:scale-95 ${parsedResult.category === color.name ? 'ring-2 ring-neutral-950 ring-offset-2 scale-105' : 'border-neutral-100'}`} title={color.name} />
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button onClick={() => setShowAiModal(false)} className="border border-neutral-300 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-50 rounded-sm">취소</button>
          <button onClick={onSaveResult} className="bg-neutral-950 py-2 text-sm font-medium text-white hover:opacity-90 rounded-sm">최종 저장</button>
        </div>
      </div>
    </div>
  )
}