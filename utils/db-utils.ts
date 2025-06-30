// Функция для обновления баланса в базе данных
export const updateBalanceInDb = async (fid: string, username: string, balanceChange: number, reason?: string) => {
  try {
    const response = await fetch("/api/balance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fid,
        username,
        balanceChange,
        reason: reason || "game",
      }),
    })

    if (response.ok) {
      const data = await response.json()
      return data.balance
    } else {
      console.error("Failed to update balance in DB")
      return null
    }
  } catch (error) {
    console.error("Error updating balance in DB:", error)
    return null
  }
}

// Функция для получения баланса из базы данных
export const getBalanceFromDb = async (fid: string) => {
  try {
    const response = await fetch(`/api/balance?fid=${fid}&_t=${Date.now()}`, {
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    })

    if (response.ok) {
      const data = await response.json()
      return data.balance
    }
  } catch (error) {
    console.error("Error getting balance from DB:", error)
  }
  return null
}
