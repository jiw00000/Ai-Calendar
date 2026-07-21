import { supabase } from '../supabaseClient'

export async function parseScheduleWithAI(userInput, existingEvents = []) {
  try {
    // 💡 API 키 노출 없이 Supabase Edge Function을 안전하게 호출합니다.
    const { data, error } = await supabase.functions.invoke('parse-schedule', {
      body: { userInput, existingEvents }
    })

    if (error) throw error

    return data
  } catch (error) {
    console.error("Gemini AI 분석 실패:", error)
    throw error
  }
}