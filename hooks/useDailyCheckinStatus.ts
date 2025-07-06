"use client"

import { useState, useEffect } from "react"
import { useHybridAuth } from "@/hooks/useHybridAuth"

export function useDailyCheckinStatus() {
  const { fid, username } = useHybridAuth()
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false)
  const [todayDate, setTodayDate] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [streakDates, setStreakDates] = useState<string[]>([])

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0]
    setTodayDate(today)

    const fetchStatus = async () => {
      if (!fid) {
        console.log("No FID available, skipping status fetch")
        setIsLoading(false)
        return
      }

      try {
        console.log(`Fetching daily check-in status for FID: ${fid}`)

        const res = await fetch(`/api/daily-checkin?fid=${fid}`, {
          method: "GET",
          headers: {
            "Cache-Control": "no-cache",
          },
        })

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        }

        const data = await res.json()
        console.log("Daily check-in status response:", data)

        setHasCheckedInToday(data.hasCheckedInToday || data.alreadyChecked || false)
        setStreakDates(data.streakDates || [])
      } catch (err) {
        console.error("Failed to fetch check-in status:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStatus()
  }, [fid])

  const markAsCheckedIn = () => {
    const today = new Date().toISOString().split("T")[0]
    localStorage.setItem("lastCheckInDate", today)
    setHasCheckedInToday(true)
  }

  return {
    hasCheckedInToday,
    markAsCheckedIn,
    todayDate,
    isLoading,
    streakDates,
  }
}
