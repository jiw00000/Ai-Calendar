import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const categories = [
  { name: '딥 테일', hex: '#7DCFB6' },
  { name: '뮤트 코랄', hex: '#E87474' },
  { name: '뮤트 세이지', hex: '#BCCBA3' },
  { name: '소프트 라벤더', hex: '#D1C4E9' },
  { name: '뮤트 베이지', hex: '#DBCBBD' }
];

export async function parseScheduleWithAI(userInput) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

    const prompt = `
      너는 사용자의 자연어 입력창에서 일정 정보를 정밀하게 추출하여 JSON 데이터로 변환해주는 AI 비서야.
      오늘의 날짜는 2026-07-18 (토요일)이야. 이 기준 날짜를 기반으로 상대적인 날짜(오늘, 내일, 모레, 다음주 등)를 계산해줘.

      [규칙]
      1. 반드시 아무런 부연 설명 없이, 마크다운 코드 블럭도 없이 오직 순수한 JSON 문자열 하나만 반환해줘.
      2. 사용자의 문장에 명확한 '시간(Hour/Minute)'이 명시되어 있다면 isTodo는 false이고, 시간 정보가 전혀 없고 할 일만 있다면 isTodo는 true야.
      3. 카테고리는 다음 제공되는 목록 중 가장 관련성이 높은 것 1개를 골라줘: '딥 테일', '뮤트 코랄', '뮤트 세이지', '소프트 라벤더', '뮤트 베이지'.
      
      4. 💡 [중요 - 진행 시간 및 다중일 계산]
         - "7시부터 10시까지" 처럼 당일 시간 범위는 단시간 차이를 숫자로 구해줘. (예: 3시간이면 duration: 3)
         - "3일부터 5일까지 여행", "내일부터 3일 동안 휴가" 처럼 여러 날짜에 걸친 다중일(Multi-day) 일정인 경우, 시작일을 date로 지정하고 [총 일수 × 24시간]을 계산하여 duration에 대입해줘.
         - 예: "3일, 4일, 5일" 총 3일간의 여정이면 3 × 24 = 72이므로 duration은 72야. 이때 시작 시간(time)은 무조건 "00:00"으로 세팅해줘.
         - 단일 시간만 있거나 정보가 없으면 duration 기본값은 1이야.

      [카테고리 가이드]
      - 딥 테일: 업무, 알바, 공부, 자기계발
      - 뮤트 코랄: 치과, 병원, 건강 관리
      - 뮤트 세이지: 집안일, 청소, 식료품 구매 등 개인 정돈
      - 소프트 라벤더: 약속, 데이트, 친목, 문화생활
      - 뮤트 베이지: 기타 금융, 확인, 중요 리마인더

      [출력할 JSON 포맷]
      {
        "title": "일정 또는 할 일 제목 (양옆에 따옴표를 포함하지 마십시오)",
        "date": "YYYY-MM-DD 형식의 시작 날짜 (도저히 알 수 없으면 2026-07-18)",
        "time": "HH:MM 형식 (예: 15:00. 시간이 없는 할 일인 경우 null, 다중일 여행은 '00:00')",
        "duration": 소요 시간 (숫자 형식, 다중일 일정이면 일수 × 24, 예: 72),
        "isTodo": true 또는 false,
        "category": "선택된 카테고리 이름 (예: '딥 테일')",
        "color": "선택된 카테고리의 헥사코드 (예: '#7DCFB6')"
      }

      사용자 입력 문장: "${userInput}"
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    const cleanJsonString = responseText.replace(/```json|```/g, "").trim();
    
    return JSON.parse(cleanJsonString);
  } catch (error) {
    console.error("Gemini AI 분석 실패:", error);
    throw error;
  }
}