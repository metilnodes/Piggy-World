"use client"

import { useState } from "react"
import { RefreshCw, User } from "lucide-react"
import { useQuickAuth } from "@/hooks/useQuickAuth"

export function ProfileRefreshButton() {
  const { fid, username, refreshUserData, isLoading } = useQuickAuth()
  const [isRefreshing, setIsRefreshing] = useState(false)

  // ИСПРАВЛЕНО: Добавляем проверку типов для startsWith
  const needsRefresh =
    (username && typeof username === "string" && username.startsWith("user_")) ||
    (username && typeof username === "string" && username.startsWith("guest")) ||
    (fid && typeof fid === "string" && !fid.startsWith("guest_"))

  if (!needsRefresh || !fid) {
    return null
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshUserData()
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <button
      onClick={handleRefresh}
      disabled={isRefreshing || isLoading}
      className="flex items-center gap-2 px-3 py-1 bg-[#fd0c96]/20 border border-[#fd0c96]/50 rounded-lg text-[#fd0c96] hover:bg-[#fd0c96]/30 transition-colors text-sm"
      title="Обновить профиль"
    >
      <User className="h-4 w-4" />
      <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
      {isRefreshing ? "Обновление..." : "Обновить профиль"}
    </button>
  )
}
