"use client"

import { useState, useEffect } from "react"
import { useAppContext } from "@/contexts/app-context"
import { PiggyBankIcon, Coins, Calendar, Flame, ExternalLink } from "lucide-react"
import { useDailyCheckinStatus } from "@/hooks/useDailyCheckinStatus"
import { SmartLink } from "@/components/smart-link"

export function PiggyBank() {
  const { balance, updateBalance } = useAppContext()
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastCheckinDate, setLastCheckinDate] = useState<string | null>(null)
  const [streak, setStreak] = useState(0)

  const { canCheckin, isLoadingStatus, lastCheckin, currentStreak, refreshStatus } = useDailyCheckinStatus()

  useEffect(() => {
    if (lastCheckin) {
      setLastCheckinDate(lastCheckin)
      setIsCheckedIn(!canCheckin)
    }
    if (currentStreak !== undefined) {
      setStreak(currentStreak)
    }
  }, [lastCheckin, canCheckin, currentStreak])

  const handleDailyCheckin = async () => {
    if (!canCheckin || isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/daily-checkin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to check in")
      }

      // Обновляем состояние
      setIsCheckedIn(true)
      setLastCheckinDate(new Date().toISOString())
      setStreak(data.streak || streak + 1)

      // Обновляем баланс
      updateBalance(data.newBalance)

      // Обновляем статус
      await refreshStatus()

      console.log("Daily checkin successful:", data)
    } catch (err) {
      console.error("Daily checkin error:", err)
      setError(err instanceof Error ? err.message : "Failed to check in")
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never"
    return new Date(dateString).toLocaleDateString()
  }

  const getStreakBonus = (streakCount: number) => {
    if (streakCount >= 30) return 500
    if (streakCount >= 14) return 200
    if (streakCount >= 7) return 100
    if (streakCount >= 3) return 50
    return 25
  }

  const baseReward = 25
  const streakBonus = getStreakBonus(streak)
  const totalReward = baseReward + (streak > 0 ? streakBonus : 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <PiggyBankIcon className="h-6 w-6 text-[#fd0c96]" />
        <h2 className="text-lg font-bold text-[#fd0c96]">Piggy Bank</h2>
      </div>

      {/* Balance Display */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Coins className="h-5 w-5 text-[#fd0c96]" />
          <span className="text-2xl font-bold text-[#fd0c96]">{balance.toLocaleString()}</span>
          <span className="text-sm text-gray-300">PIGGY</span>
        </div>
        <p className="text-xs text-gray-400">Your current balance</p>
      </div>

      {/* Daily Check-in Section */}
      <div className="bg-black/30 p-4 rounded-lg space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-[#fd0c96]" />
          <span className="font-semibold text-[#fd0c96]">Daily Check-in</span>
        </div>

        {/* Streak Display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-gray-300">Streak: {streak} days</span>
          </div>
          <div className="text-sm text-gray-300">
            Reward: <span className="text-[#fd0c96] font-semibold">{totalReward} PIGGY</span>
          </div>
        </div>

        {/* Check-in Button */}
        <button
          onClick={handleDailyCheckin}
          disabled={!canCheckin || isLoading || isLoadingStatus}
          className={`w-full py-2 px-4 rounded-lg font-semibold transition-all ${
            canCheckin && !isLoading
              ? "bg-[#fd0c96] hover:bg-[#fd0c96]/80 text-white"
              : "bg-gray-600 text-gray-400 cursor-not-allowed"
          }`}
        >
          {isLoading
            ? "Checking in..."
            : isLoadingStatus
              ? "Loading..."
              : canCheckin
                ? "Claim Daily Reward"
                : "Already claimed today"}
        </button>

        {error && <div className="text-red-400 text-sm text-center">{error}</div>}

        {/* Last Check-in Info */}
        <div className="text-xs text-gray-400 text-center">Last check-in: {formatDate(lastCheckinDate)}</div>
      </div>

      {/* Streak Bonuses Info */}
      <div className="bg-black/20 p-3 rounded-lg">
        <h4 className="text-sm font-semibold text-[#fd0c96] mb-2">Streak Bonuses</h4>
        <div className="text-xs text-gray-300 space-y-1">
          <div>3+ days: +50 PIGGY bonus</div>
          <div>7+ days: +100 PIGGY bonus</div>
          <div>14+ days: +200 PIGGY bonus</div>
          <div>30+ days: +500 PIGGY bonus</div>
        </div>
      </div>

      {/* External Links */}
      <div className="flex flex-col gap-2">
        <SmartLink
          href="https://piggyworld.com/tokenomics"
          className="w-full neon-button flex items-center justify-center relative text-sm"
        >
          <span className="mx-auto">TOKENOMICS</span>
          <ExternalLink className="h-3 w-3 absolute right-3" />
        </SmartLink>

        <SmartLink
          href="https://piggyworld.com/staking"
          className="w-full neon-button flex items-center justify-center relative text-sm"
        >
          <span className="mx-auto">STAKING</span>
          <ExternalLink className="h-3 w-3 absolute right-3" />
        </SmartLink>
      </div>
    </div>
  )
}
