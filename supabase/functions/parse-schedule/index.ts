import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // CORS Preflight 처리
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userInput, existingEvents } = await req.json()
    const apiKey = Deno.env.get('GEMINI_API_KEY')

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY가 설정되지 않았습니다.')
    }

    // 💡 오늘 날짜 자동 계산 (한국 표준시 기준)
    const todayStr = new Date().toLocaleDateString('sv-SE')

    // 현재 등록된 일정 목록 컨텍스트 변환
    const eventsContext = (existingEvents || [])
      .map((e: any) => `[ID: ${e.id}] 제목: ${e.title}, 기간: ${e.origStart || e.date} ~ ${e.origEnd || e.date}`)
      .join('\n')

    const prompt = `
      너는 사용자의 자연어 입력창에서 일정 정보를 정밀하게 추출하여 JSON 데이터로 변환해주는 AI 비서야.
      오늘의 날짜는 ${todayStr}이야. 이 기준 날짜를 기반으로 상대적인 날짜를 계산해줘.

      [현재 달력에 등록된 사용자 일정 목록]
      ${eventsContext || '등록된 일정 없음'}

      [규칙]
      1. 반드시 아무런 부연 설명 없이, 마크다운 코드 블럭도 없이 오직 순수한 JSON 문자열 하나만 반환해줘.
      2. 💡 [중요 - 자연어 수정 감지]
         - 사용자의 문장이 기존 일정을 "변경", "수정", "연장", "바꿔줘", "옮겨줘" 하는 요청이라면, 위 목록에서 제목이 가장 유사한 일정을 찾아 그 일정의 ID를 "id" 필드에 적고 "status"를 "update"로 지정해줘.
         - 새로운 일정을 그냥 등록하는 거라면 "status": "create", "id": null 이야.
         - 만약 수정을 하는 거라면, 사용자가 변경 요청한 새로운 날짜/시간 정보를 계산해 반영해줘.
      3. 사용자의 문장에 명확한 '시간'이 명시되어 있다면 isTodo는 false이고, 시간 정보가 전혀 없고 할 일만 있다면 isTodo는 true야.
      4. 카테고리는 다음 제공되는 목록 중 가장 관련성이 높은 것 1개를 골라줘: '딥 테일', '뮤트 코랄', '뮤트 세이지', '소프트 라벤더', '뮤트 베이지'.
      5. 다중일(Multi-day) 일정인 경우 시작일을 date로 지정하고 [총 일수 × 24시간]을 계산하여 duration에 대입해줘.
         - 예: "21일부터 24일까지"이면 21, 22, 23, 24 총 4일이므로 4 × 24 = 96 즉, duration은 4일치인 96이 되어야 해.

      [출력할 JSON 포맷]
      {
        "status": "create" 또는 "update",
        "id": 수정할 일정의 고유 ID (새로운 일정일 경우 null),
        "title": "일정 또는 할 일 제목",
        "date": "YYYY-MM-DD 형식의 시작 날짜",
        "time": "HH:MM 형식 또는 null",
        "duration": 소요 시간 (숫자 형식, 다중일 일정이면 일수 × 24),
        "isTodo": true 또는 false,
        "category": "선택된 카테고리 이름"
      }

      사용자 입력 문장: "${userInput}"
    `

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    )

    const data = await response.json()
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
    const cleanJsonString = responseText.replace(/```json|```/g, "").trim()
    const parsedData = JSON.parse(cleanJsonString)

    return new Response(JSON.stringify(parsedData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})