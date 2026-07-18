import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// 사용자가 설정한 세련된 컬러 팔레트 정보
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

    // AI에게 내릴 엄격하고 상세한 프롬프트 지침
    const prompt = `
      너는 사용자의 자연어 입력창에서 일정 정보를 정밀하게 추출하여 JSON 데이터로 변환해주는 AI 비서야.
      오늘의 날짜는 2026-07-18 (토요일)이야. 이 기준 날짜를 기반으로 상대적인 날짜(오늘, 내일, 모레, 다음주 등)를 계산해줘.

      [규칙]
      1. 반드시 아무런 부연 설명 없이, 마크다운 코드 블럭도 없이 오직 순수한 JSON 문자열 하나만 반환해줘.
      2. 사용자의 문장에 명확한 '시간(Hour/Minute)'이 명시되어 있다면 isTodo는 false이고, 시간 정보가 전혀 없고 할 일만 있다면 isTodo는 true야.
      3. 카테고리는 다음 제공되는 목록 중 가장 관련성이 높은 것 1개를 골라줘: '딥 테일', '뮤트 코랄', '뮤트 세이지', '소프트 라벤더', '뮤트 베이지'.
      
      4. 💡 [중요 - 진행 시간 계산]
         - 사용자가 "7시부터 10시까지", "19시~22시", "3시간 동안" 처럼 종료 시간이나 소요 시간을 함께 명시한 경우, 이를 계산해서 진행 시간(숫자)을 구해줘.
         - 예: "7시부터 10시까지 회식" -> 시작 시간은 19:00, 소요 시간은 3시간이므로 duration은 3이야.
         - 예: "오후 2시부터 3시 반까지 미팅" -> duration은 1.5야.
         - 만약 시작 시간만 있고 종료 시간이나 소요 시간이 언급되지 않았다면, duration의 기본값은 1로 지정해줘.

      [카테고리 가이드]
      - 딥 테일: 업무, 알바, 공부, 자기계발
      - 뮤트 코랄: 치과, 병원, 건강 관리
      - 뮤트 세이지: 집안일, 청소, 식료품 구매 등 개인 정돈
      - 소프트 라벤더: 약속, 데이트, 친목, 문화생활
      - 뮤트 베이지: 기타 금융, 확인, 중요 리마인더

      [출력할 JSON 포맷]
      {
        "title": "일정 또는 할 일 제목 (양옆에 따옴표를 포함하지 마십시오)",
        "date": "YYYY-MM-DD 형식의 날짜 (시간이 없는 할 일이라도 예정된 날짜가 있다면 추정해서 적고, 도저히 알 수 없으면 2026-07-18)",
        "time": "HH:MM 형식 (예: 15:00. 시간이 없는 할 일인 경우 null)",
        "duration": 소요 시간 (숫자 형식, 예: 3 또는 1.5. 시작 시간만 있거나 알 수 없는 경우 기본값은 1),
        "isTodo": true 또는 false,
        "category": "선택된 카테고리 이름 (예: '딥 테일')",
        "color": "선택된 카테고리의 헥사코드 (예: '#7DCFB6')"
      }

      사용자 입력 문장: "${userInput}"
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    
    // 혹시 모를 마크다운 찌꺼기 제거
    const cleanJsonString = responseText.replace(/```json|```/g, "").trim();
    
    return JSON.parse(cleanJsonString);
  } catch (error) {
    console.error("Gemini AI 분석 실패:", error);
    throw error;
  }
}