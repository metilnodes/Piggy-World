"use client"

import { useState, useEffect } from "react"
import { useBalance } from "@/contexts/balance-context"
import { useHybridAuth } from "@/hooks/useHybridAuth"
import { useDailyCheckinStatus } from "@/hooks/useDailyCheckinStatus"
import { Dices, ChevronRight, ArrowLeft, Coins, Calendar, X, Sparkles, CheckCircle } from "lucide-react"
import SlotsGame from "./slots-game"
import PokerGame from "./poker-game"
import RouletteGame from "./roulette-game"

// Game types
type GameType = "slots" | "poker" | "roulette"

// Available games data
const games = [
  {
    id: "slots",
    name: "Oink & Spin",
    description: "Feed the reels with coins and squeal at your wins!",
    icon: "/images/casino.png",
    color: "#fd0c96",
  },
  {
    id: "poker",
    name: "Piggy Hold'em",
    description: "All-in or oink out",
    icon: "/images/casino.png",
    color: "#fd0c96",
  },
  {
    id: "roulette",
    name: "Oinklette",
    description: "Spin the wheel, squeal the deal",
    icon: "/images/casino.png",
    color: "#fd0c96",
  },
]

// Daily Check-in Modal Component
function DailyOinkModal({
  isOpen,
  onClose,
  onCheckIn,
  hasCheckedInToday,
  currentStreak,
  isLoading,
  totalCheckins,
  lastCheckInResult,
  streakDates = [], // Add this parameter
}: {
  isOpen: boolean
  onClose: () => void
  onCheckIn: () => void
  hasCheckedInToday: boolean
  currentStreak: number
  isLoading: boolean
  totalCheckins: number
  lastCheckInResult?: { success: boolean; message: string; reward?: number } | null
  streakDates?: string[] // Add this type
}) {
  // Auto-close modal after successful check-in
  useEffect(() => {
    if (lastCheckInResult?.success) {
      const timer = setTimeout(() => {
        onClose()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [lastCheckInResult, onClose])

  if (!isOpen) return null

  // Get current month and year in GMT
  const now = new Date()
  const utcDate = new Date(now.getTime() + now.getTimezoneOffset() * 60000)
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]
  const currentMonth = monthNames[utcDate.getMonth()]
  const currentYear = utcDate.getFullYear()

  // Get days in current month
  const daysInMonth = new Date(utcDate.getFullYear(), utcDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(utcDate.getFullYear(), utcDate.getMonth(), 1).getDay()

  // Create calendar grid
  const calendarDays = []

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null)
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  const today = utcDate.getDate()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
      <div
        className="relative w-[350px] max-h-[620px] overflow-y-auto bg-black rounded-lg shadow-lg"
        style={{
          border: "2px solid #fd0c96",
          boxShadow: "0 0 10px #fd0c96, 0 0 20px #fd0c96",
        }}
      >
        <div className="flex items-center justify-between p-4 border-b border-[#fd0c96]">
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-[#fd0c96]" />
            <h2
              className="text-xl font-bold"
              style={{
                color: "#fd0c96",
                textShadow: "0 0 2px #fd0c96, 0 0 2px #fd0c96",
              }}
            >
              Daily Oink
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#fd0c96] hover:text-white transition-colors"
            style={{ textShadow: "0 0 5px #fd0c96" }}
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Success Message */}
          {lastCheckInResult?.success && (
            <div className="bg-green-500/20 border border-green-500 rounded-lg p-3 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-green-500 font-medium text-sm">{lastCheckInResult.message}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {lastCheckInResult && !lastCheckInResult.success && (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 flex items-center gap-2">
              <X className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-red-500 font-medium text-sm">{lastCheckInResult.message}</p>
              </div>
            </div>
          )}

          {/* Current Streak */}
          <div className="bg-black/50 border border-[#fd0c96]/30 rounded-lg p-3 flex items-center justify-between">
            <div>
              <p className="text-white font-medium text-sm">Current streak</p>
              <p className="text-xl font-bold text-white">{currentStreak} days</p>
              <p className="text-xs text-gray-400">Total check-ins: {totalCheckins}</p>
            </div>
            <div className="w-10 h-10 bg-[#fd0c96]/20 rounded-full flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-[#fd0c96]" />
            </div>
          </div>

          {/* Calendar */}
          <div className="bg-black/50 border border-[#fd0c96]/30 rounded-lg p-3">
            <h3 className="text-white font-bold mb-3 text-sm">
              {currentMonth} {currentYear} (GMT)
            </h3>

            {/* Calendar Header */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                <div key={index} className="text-center text-gray-400 text-xs font-medium p-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                if (day === null) {
                  return <div key={index} className="text-center p-1 text-xs"></div>
                }

                // Create date string for this day
                const dayDateStr = `${utcDate.getFullYear()}-${String(utcDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`

                // Check if this day is in streak
                const isStreakDay = streakDates.includes(dayDateStr)
                const isToday = day === today

                return (
                  <div
                    key={index}
                    className={`text-center p-1 text-xs ${
                      isToday
                        ? "bg-[#fd0c96] text-black font-bold rounded"
                        : isStreakDay
                          ? "bg-[#fd0c96]/60 text-white font-medium rounded"
                          : "text-white hover:bg-[#fd0c96]/20 rounded"
                    }`}
                  >
                    {day}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Check-in Button */}
          <button
            onClick={onCheckIn}
            disabled={hasCheckedInToday || isLoading}
            className={`w-full py-2 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all text-sm ${
              hasCheckedInToday || isLoading
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-[#fd0c96] text-black hover:bg-[#fd0c96]/80 cursor-pointer"
            }`}
            style={{
              boxShadow: hasCheckedInToday || isLoading ? "none" : "0 0 10px #fd0c96",
            }}
          >
            <Sparkles className="h-4 w-4" />
            {isLoading ? "Processing..." : hasCheckedInToday ? "Already checked in today" : "Check-in and get 10 OINK"}
          </button>
        </div>
      </div>
    </div>
  )
}

export function Casino() {
  // Используем BalanceContext
  const { balance, isLoading, error, fetchBalance, addToBalance, subtractFromBalance } = useBalance()
  const { fid, username, displayName, pfpUrl } = useHybridAuth()

  // Используем кастомный хук для Daily Check-in
  const { hasCheckedInToday, markAsCheckedIn, streakDates } = useDailyCheckinStatus()

  const [selectedGame, setSelectedGame] = useState<GameType | null>(null)
  const [showDailyOink, setShowDailyOink] = useState(false)

  // Состояния для Daily Oink (только для streak и totalCheckins)
  const [dailyOinkStatus, setDailyOinkStatus] = useState({
    currentStreak: 0,
    totalCheckins: 0,
    streakDates: [] as string[], // Add this
    isLoading: false,
  })

  // Результат последнего check-in
  const [lastCheckInResult, setLastCheckInResult] = useState<{
    success: boolean
    message: string
    reward?: number
  } | null>(null)

  // Создаем объект userData
  const userData =
    fid && username
      ? {
          fid,
          username,
          displayName: displayName || username,
          pfp: pfpUrl,
        }
      : null

  // Select game
  const handleSelectGame = (gameId: GameType) => {
    setSelectedGame(gameId)
  }

  // Return to game list
  const handleBackToList = () => {
    setSelectedGame(null)
  }

  // Function to update balance for the games
  const updateBalance = async (amount: number) => {
    console.log(`🎰 Casino: updating balance by ${amount}`)

    if (amount > 0) {
      await addToBalance(amount)
      return true
    } else {
      return await subtractFromBalance(Math.abs(amount))
    }
  }

  // Handle daily check-in
  const handleCheckIn = async () => {
    console.log("🎯 Check-in button clicked")

    if (!userData || !userData.fid || !userData.username) {
      console.error("❌ No user data available")
      setLastCheckInResult({
        success: false,
        message: "User data not available. Please authenticate first.",
      })
      return
    }

    if (hasCheckedInToday) {
      console.warn("⚠️ Already checked in today")
      setLastCheckInResult({
        success: false,
        message: "You have already checked in today. Come back tomorrow!",
      })
      return
    }

    if (dailyOinkStatus.isLoading) {
      console.warn("⚠️ Already processing check-in")
      return
    }

    setDailyOinkStatus((prev) => ({ ...prev, isLoading: true }))
    setLastCheckInResult(null)

    try {
      console.log("📤 Sending check-in request...")

      const response = await fetch("/api/daily-checkin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fid: userData.fid,
          username: userData.username,
        }),
      })

      const data = await response.json()
      console.log("📥 Check-in response:", { status: response.status, data })

      if (response.ok) {
        console.log("✅ Check-in successful")

        // Отмечаем как выполненный check-in в localStorage
        markAsCheckedIn()

        // Обновляем состояние
        setDailyOinkStatus({
          currentStreak: data.streak,
          totalCheckins: dailyOinkStatus.totalCheckins + 1,
          streakDates: [], // Will be updated by reload
          isLoading: false,
        })

        // Показываем результат
        setLastCheckInResult({
          success: true,
          message: data.message,
          reward: data.reward,
        })

        // Обновляем баланс из БД
        await fetchBalance()

        // Перезагружаем статус для получения обновленных streakDates
        setTimeout(async () => {
          const statusResponse = await fetch(`/api/daily-checkin?fid=${userData.fid}`)
          if (statusResponse.ok) {
            const statusData = await statusResponse.json()
            setDailyOinkStatus((prev) => ({
              ...prev,
              streakDates: statusData.streakDates || [],
            }))
          }
        }, 500)

        console.log("🎉 Check-in completed successfully!")
      } else {
        console.error("❌ Daily check-in failed:", data.error)
        setLastCheckInResult({
          success: false,
          message: data.error || "Failed to process daily check-in",
        })
        setDailyOinkStatus((prev) => ({ ...prev, isLoading: false }))
      }
    } catch (error) {
      console.error("❌ Error processing daily check-in:", error)
      setLastCheckInResult({
        success: false,
        message: "Network error. Please try again.",
      })
      setDailyOinkStatus((prev) => ({ ...prev, isLoading: false }))
    }
  }

  // Load daily oink status (только streak и totalCheckins)
  useEffect(() => {
    const loadDailyOinkStatus = async () => {
      if (userData && userData.fid) {
        try {
          console.log("🎰 Loading daily oink status for FID:", userData.fid)

          const response = await fetch(`/api/daily-checkin?fid=${userData.fid}`)

          if (response.ok) {
            const data = await response.json()
            console.log("📊 Daily oink status loaded:", data)

            setDailyOinkStatus({
              currentStreak: data.currentStreak,
              totalCheckins: data.totalCheckins,
              streakDates: data.streakDates || [], // Add this
              isLoading: false,
            })
          } else {
            console.error("❌ Failed to load daily oink status:", response.status)
          }
        } catch (error) {
          console.error("❌ Error loading daily oink status:", error)
        }
      }
    }

    loadDailyOinkStatus()
  }, [userData])

  // Загружаем баланс при монтировании
  useEffect(() => {
    console.log("🎰 Casino mounted, fetching balance...")
    fetchBalance()
  }, [fetchBalance])

  // Показываем loading состояние
  if (isLoading && balance === null) {
    return (
      <div className="flex items-center justify-center h-[520px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#fd0c96] mx-auto mb-2"></div>
          <p className="text-gray-400 text-sm">Loading casino...</p>
        </div>
      </div>
    )
  }

  // Показываем ошибку
  if (error) {
    return (
      <div className="flex items-center justify-center h-[520px]">
        <div className="text-center">
          <p className="text-red-500 text-sm mb-2">Error: {error}</p>
          <button onClick={fetchBalance} className="bg-[#fd0c96] text-black px-4 py-2 rounded-lg text-sm">
            Retry
          </button>
        </div>
      </div>
    )
  }

  // If a game is selected, show it
  if (selectedGame) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handleBackToList}
            className="flex items-center text-[#fd0c96] hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Back to games</span>
          </button>

          <div className="flex items-center gap-1 bg-[#fd0c96]/10 px-3 py-1 rounded-full border border-[#fd0c96]">
            <Coins className="h-3 w-3 text-[#fd0c96]" />
            <span className="text-sm font-medium text-[#fd0c96]">{isLoading ? "..." : balance} OINK</span>
          </div>
        </div>

        {selectedGame === "slots" && <SlotsGame updateBalance={updateBalance} balance={balance || 0} />}
        {selectedGame === "poker" && <PokerGame updateBalance={updateBalance} balance={balance || 0} />}
        {selectedGame === "roulette" && <RouletteGame updateBalance={updateBalance} balance={balance || 0} />}
      </div>
    )
  }

  // Show game list
  return (
    <div className="space-y-4">
      <div className="p-3 bg-black bg-opacity-50 rounded-lg border border-[#fd0c96] mb-4">
        <p className="text-center text-lg font-bold text-[#fd0c96]">
          Balance: {isLoading ? "Loading..." : balance} OINK
        </p>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Dices className="h-6 w-6 text-[#fd0c96]" />
        <h2 className="text-lg font-bold text-[#fd0c96]">Oink-O-Luck</h2>
      </div>

      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
        {games.map((game) => (
          <div
            key={game.id}
            className="bg-black/50 border border-[#fd0c96] rounded-lg p-3 cursor-pointer transition-all duration-300 hover:bg-[#fd0c96]/10 hover:border-[#fd0c96]/80"
            onClick={() => handleSelectGame(game.id as GameType)}
          >
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-lg bg-black/30 flex items-center justify-center mr-3 flex-shrink-0 border border-[#fd0c96]/30">
                <img src={game.icon || "/placeholder.svg"} alt={game.name} className="w-8 h-8 object-contain" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white">{game.name}</h3>
                <p className="text-xs text-gray-300">{game.description}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-[#fd0c96]" />
            </div>
          </div>
        ))}
      </div>

      {/* Daily Oink Button */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={() => setShowDailyOink(true)}
          className={`flex items-center gap-2 px-6 py-3 border-2 rounded-lg font-bold transition-all ${
            hasCheckedInToday
              ? "bg-green-500/20 border-green-500 text-green-500"
              : "bg-transparent border-[#fd0c96] text-[#fd0c96] hover:bg-[#fd0c96] hover:text-black"
          }`}
          style={{
            textShadow: "0 0 5px #fd0c96",
            boxShadow: hasCheckedInToday ? "0 0 10px #22c55e" : "0 0 10px #fd0c96",
          }}
        >
          {hasCheckedInToday ? (
            <>
              <CheckCircle className="h-5 w-5" />
              Checked In Today!
            </>
          ) : (
            <>
              <Calendar className="h-5 w-5" />
              Daily Oink
            </>
          )}
        </button>
      </div>

      {/* Daily Oink Modal */}
      <DailyOinkModal
        isOpen={showDailyOink}
        onClose={() => setShowDailyOink(false)}
        onCheckIn={handleCheckIn}
        hasCheckedInToday={hasCheckedInToday}
        currentStreak={dailyOinkStatus.currentStreak}
        isLoading={dailyOinkStatus.isLoading}
        totalCheckins={dailyOinkStatus.totalCheckins}
        lastCheckInResult={lastCheckInResult}
        streakDates={dailyOinkStatus.streakDates} // Add this line
      />
    </div>
  )
}
