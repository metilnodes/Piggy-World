"use client"

import { useEffect, useState } from "react"
import { RefreshCw, CheckCircle } from "lucide-react"

interface AutoRefreshIndicatorProps {
  isRefreshing: boolean
  lastRefresh?: Date
}

export function AutoRefreshIndicator({ isRefreshing, lastRefresh }: AutoRefreshIndicatorProps) {
  const [showIndicator, setShowIndicator] = useState(false)

  useEffect(() => {
    if (isRefreshing) {
      setShowIndicator(true)
    } else if (lastRefresh) {
      // Показываем индикатор успеха на 3 секунды
      const timer = setTimeout(() => {
        setShowIndicator(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isRefreshing, lastRefresh])

  if (!showIndicator) return null

  return (
    <div className="fixed top-4 right-4 bg-black/90 border border-[#fd0c96]/50 rounded-lg p-3 flex items-center gap-2 z-50">
      {isRefreshing ? (
        <>
          <RefreshCw className="h-4 w-4 text-[#fd0c96] animate-spin" />
          <span className="text-[#fd0c96] text-sm">Обновление профиля...</span>
        </>
      ) : (
        <>
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="text-green-500 text-sm">Профиль обновлен!</span>
        </>
      )}
    </div>
  )
}
