# 📅 Ai-Calendar

> **"대충 말하면 알아서 척척"** — AI 기반 개인 맞춤형 스케줄러 & 비서 앱 🚀
>
> 일일이 날짜와 시간을 입력하는 번거로움 없이, **한 줄의 텍스트나 목소리(음성)로 일정을 대충 말하면 AI가 스스로 분석하여 캘린더와 할 일 목록에 착착 분류 및 정리**해 주는 똑똑한 1인용 스케줄러입니다. PWA 기술을 적용해 모바일 기기 홈 화면에 앱처럼 다운로드하여 사용할 수 있습니다.

---

## 🛠️ 기술 스택 (Tech Stack)

- **Frontend:** React (Vite), Tailwind CSS (v4), Lucide React (아이콘)
- **Backend & DB:** Supabase (Auth 로그인, PostgreSQL DB, RLS 보안 적용)
- **AI Engine:** Gemini API (자연어 파싱 및 오늘의 브리핑 생성)
- **Device API:** Web Speech API (브라우저 내장 음성인식 STT)
- **External API:** OpenWeatherMap API (실시간 날씨 수집)
- **Distribution:** Vite PWA Plugin (`vite-plugin-pwa`)

---

## 🎯 핵심 기능 정의 (Core Features)

### F-1. 회원가입 및 로그인 (Authentication)
- Supabase Auth를 사용해 **이메일/비밀번호 로그인** 또는 **구글 소셜 로그인** 구현.
- 로그인한 유저만 메인 달력(Calendar) 대시보드 진입 가능. 비로그인 유저는 로그인 페이지로 자동 리다이렉트.

### F-2. 오늘의 비서 브리핑 배너 (Daily Briefing)
- **날씨 API 연동:** OpenWeatherMap API를 사용해 현재 위치의 실시간 날씨 데이터 수집.
- **일정 데이터 로드:** 로그인한 유저의 Supabase DB에서 '오늘(Today)'에 해당하는 일정 및 투두 리스트 수집.
- **AI 브리핑:** 위 날씨 정보와 일정 리스트를 융합하여 Gemini API가 유저 맞춤형 브리핑 문장을 구어체로 자동 생성하여 화면 최상단에 노출.

### F-3. "말 한마디로 등록" 음성 입력 (Voice Input STT)
- 브라우저 내장 `Web Speech API`를 활용하여 별도 비용 없이 한국어 음성 인식 구현.
- 마이크 아이콘을 누르고 말을 하면 실시간으로 내 말이 텍스트 입력창에 받아쓰기(STT)됨.

### F-4. 대충 쓰는 AI 일정/할 일 분석기 (AI Parser)
- 유저가 텍스트 입력 후 `[분석]`을 누르면 Gemini API가 자연어를 처리해 JSON 형식으로 변환.
- **일정 vs 할 일 자동 분류:**
  - **일정(Event):** 명확한 시간 정보가 포함된 경우 ➔ 달력 격자(Calendar Grid)에 표시.
  - **할 일(Todo):** 명확한 시간 없이 할 일 자체만 정의된 경우 ➔ 달력 아래쪽 체크리스트 영역에 표시.
- **확인 모달창 (UX 안전장치):** AI가 분석한 결과를 팝업창으로 먼저 보여주어 유저가 잘못 입력된 부분을 수정한 후 최종 저장하도록 구현.

### F-5. 애플 감성 미니멀 캘린더 & 투두 리스트 (Dashboard UI)
- 애플 캘린더 스타일의 월 단위 달력 그리드.
- 일정 클릭 또는 투두 항목 길게 누를 시 상세 보기 및 삭제 기능 제공.

### F-6. 홈 화면 앱처럼 다운로드 (PWA)
- `vite-plugin-pwa` 플러그인을 활용해 아이콘, 스플래시 화면 정의.
- 모바일 기기로 웹 접속 시 "홈 화면에 앱 추가" 팝업 가이드 노출.

---

## 💾 데이터베이스 설계 (Database Schema)

### `events` 테이블 구조

| 컬럼명 | 데이터 타입 | 설명 | 제약 조건 |
| :--- | :--- | :--- | :--- |
| `id` | UUID | 일정의 고유 ID | PRIMARY KEY, 기본 생성값 |
| `user_id` | UUID | 로그인한 유저의 ID | REFERENCES auth.users(id), CASCADE |
| `title` | TEXT | 일정 또는 할 일 제목 | NOT NULL |
| `start_time` | TIMESTAMPTZ | 시작 일시 (**값이 없으면 To-do**) | NULLABLE |
| `end_time` | TIMESTAMPTZ | 종료 일시 | NULLABLE |
| `category` | TEXT | AI가 자동 분류한 카테고리 | NULLABLE (ex: '공부', '약속') |
| `color` | TEXT | AI가 매칭해준 헥사코드 | NULLABLE (ex: '#4A90E2') |
| `is_completed` | BOOLEAN | To-do의 완료 상태 여부 | DEFAULT false |
| `created_at` | TIMESTAMPTZ | 생성 날짜 및 시간 | DEFAULT now() |