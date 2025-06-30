"use client"

import { useState, useEffect } from "react"

export function useDailyCheckinStatus() {
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false)
  const [todayDate, setTodayDate] = useState("")

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0]
    setTodayDate(today)

    const lastCheckin = localStorage.getItem("lastCheckInDate")
    if (lastCheckin === today) {
      setHasCheckedInToday(true)
    } else {
      setHasCheckedInToday(false)
    }
  }, [])

  // Call this after successful check-in
  const markAsCheckedIn = () => {
    const today = new Date().toISOString().split("T")[0]
    localStorage.setItem("lastCheckInDate", today)
    setHasCheckedInToday(true)
  }

  return {
    hasCheckedInToday,
    markAsCheckedIn,
    todayDate,
  }
}
