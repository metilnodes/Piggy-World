"use client"

import { useState, useEffect } from "react"
import { useAppContext } from "@/contexts/app-context"

export function useDailyCheckinStatus() {
  const { user } = useAppContext()
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false)
  const [todayDate, setTodayDate] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0]
    setTodayDate(today)

    const fetchStatus = async () => {
      if (!user?.fid) {
        console.log("No user FID available")
        setIsLoading(false)
        return
      }

      try {
        const res = await fetch(`/api/daily-checkin?fid=${user.fid}`, {
          method: "GET",
          headers: {
            "Cache-Control": "no-cache",
          },
        })
        const data = await res.json()
        setHasCheckedInToday(data.alreadyChecked || false)
      } catch (err) {
        console.error("Failed to fetch check-in status:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStatus()
  }, [user?.fid])

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
  }
}
