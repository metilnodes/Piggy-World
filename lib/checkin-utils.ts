// checkin-utils.ts

export function checkLocalStorageForCheckinReset(): boolean {
  try {
    const lastDate = localStorage.getItem("lastCheckInDate")
    const todayGMT = new Date().toISOString().split("T")[0] // формат: YYYY-MM-DD

    if (!lastDate) return true // не найдено — сбрасываем

    if (lastDate !== todayGMT) {
      console.log("🌅 Новый день по GMT — сбрасываем чек-ин")
      localStorage.removeItem("lastCheckInDate")
      return true
    }

    return false
  } catch (e) {
    console.error("⚠️ Ошибка при проверке даты check-in:", e)
    return true
  }
}

// Новая функция для проверки статуса check-in
export function hasCheckedInToday(): boolean {
  try {
    const last = localStorage.getItem("lastCheckInDate")
    const today = new Date().toISOString().split("T")[0]
    return last === today
  } catch (e) {
    console.error("⚠️ Ош��бка при проверке статуса check-in:", e)
    return false
  }
}
