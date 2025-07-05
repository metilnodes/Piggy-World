"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect } from "react"

interface BalanceContextType {
  balance: number | null
  isLoading: boolean
  error: string | null
  // Методы для получения и обновления ��аланса
  fetchBalance: () => Promise<void>
  updateBalance: (newValue: number) => Promise<void>
  addToBalance: (amount: number) => Promise<void>
  subtractFromBalance: (amount: number) => Promise<boolean>
  refreshBalance: () => Promise<void>
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined)

export function BalanceProvider({ children }: { children: React.ReactNode }) {
  const [balance, setBalance] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Получение текущего пользователя
  const getCurrentUser = () => {
    try {
      // ИСПРАВЛЕНО: Приоритет hybridUser над farcasterUser
      const savedUser = localStorage.getItem("hybridUser") || localStorage.getItem("farcasterUser")
      if (savedUser) {
        const user = JSON.parse(savedUser)
        if (user.fid && user.username) {
          console.log("👤 BalanceContext using user:", user.username, "FID:", user.fid)
          return user
        }
      }
    } catch (error) {
      console.error("Error getting current user:", error)
    }

    // Fallback пользователь для тестирования
    const fallbackUser = {
      fid: "guest_" + Math.floor(Math.random() * 10000),
      username: "guest" + Math.floor(Math.random() * 1000),
    }
    console.log("⚠️ BalanceContext using fallback user:", fallbackUser)
    return fallbackUser
  }

  // 1) Метод для запроса актуального баланса из Neon (GET /api/balance)
  const fetchBalance = useCallback(async () => {
    const user = getCurrentUser()
    if (!user?.fid) {
      console.warn("No user found for balance fetch")
      setError("No user data available")
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      console.log(`🔍 BalanceContext: fetching balance for fid=${user.fid} (${user.username})`)

      // Используем GET запрос с fid параметром
      const res = await fetch(`/api/balance?fid=${user.fid}&_t=${Date.now()}`, {
        method: "GET",
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      })

      if (!res.ok) {
        throw new Error(`Failed to fetch balance: ${res.status}`)
      }

      const data = await res.json()
      console.log("✅ BalanceContext: Balance fetched from DB:", data.balance, "for user:", user.username)

      setBalance(data.balance)
      localStorage.setItem("oinkBalance", data.balance.toString())
    } catch (e: any) {
      console.error("❌ BalanceContext fetchBalance error:", e)
      setError(e.message || "Failed to fetch balance")
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 2) Метод для принудительного обновления баланса (POST /api/balance)
  const updateBalance = useCallback(
    async (newValue: number) => {
      const user = getCurrentUser()
      if (!user?.fid) {
        console.warn("No user found for balance update")
        setError("No user data available")
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        console.log(`🔄 BalanceContext: updating balance to ${newValue} for fid=${user.fid} (${user.username})`)

        // Мгновенно обновляем UI для лучшего UX
        setBalance(newValue)
        localStorage.setItem("oinkBalance", newValue.toString())

        // Используем POST запрос с правильными параметрами
        const res = await fetch("/api/balance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fid: user.fid,
            username: user.username,
            newBalance: newValue,
            reason: "direct_update",
          }),
        })

        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || "Failed to update balance")
        }

        const data = await res.json()
        console.log("✅ BalanceContext: Balance updated in DB:", data.balance, "for user:", user.username)

        // Обновляем с актуальным значением из БД
        setBalance(data.balance)
        localStorage.setItem("oinkBalance", data.balance.toString())
      } catch (e: any) {
        console.error("❌ BalanceContext updateBalance error:", e)
        setError(e.message || "Failed to update balance")

        // В случае ошибки возвращаем предыдущее значение
        await fetchBalance()
      } finally {
        setIsLoading(false)
      }
    },
    [fetchBalance],
  )

  // 3) Метод для добавления к балансу
  const addToBalance = useCallback(
    async (amount: number) => {
      const user = getCurrentUser()
      if (!user?.fid || amount <= 0) return

      try {
        setIsLoading(true)
        setError(null)

        console.log(`➕ BalanceContext: adding ${amount} to balance for fid=${user.fid} (${user.username})`)

        // Оптимистичное обновление
        const newBalance = (balance || 0) + amount
        setBalance(newBalance)
        localStorage.setItem("oinkBalance", newBalance.toString())

        // Используем POST с balanceChange
        const res = await fetch("/api/balance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fid: user.fid,
            username: user.username,
            balanceChange: amount,
            reason: "add_coins",
          }),
        })

        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || "Failed to add to balance")
        }

        const data = await res.json()
        console.log(
          `✅ BalanceContext: Added ${amount} to balance, new total:`,
          data.balance,
          "for user:",
          user.username,
        )

        setBalance(data.balance)
        localStorage.setItem("oinkBalance", data.balance.toString())
      } catch (e: any) {
        console.error("❌ BalanceContext addToBalance error:", e)
        setError(e.message || "Failed to add to balance")
        await fetchBalance() // Восстанавливаем актуальный баланс
      } finally {
        setIsLoading(false)
      }
    },
    [balance, fetchBalance],
  )

  // 4) Метод для вычитания из баланса
  const subtractFromBalance = useCallback(
    async (amount: number): Promise<boolean> => {
      const user = getCurrentUser()
      if (!user?.fid || amount <= 0) return false

      const currentBalance = balance || 0
      if (currentBalance < amount) {
        console.warn(
          `❌ BalanceContext: Insufficient balance: ${currentBalance} < ${amount} for user: ${user.username}`,
        )
        return false
      }

      try {
        setIsLoading(true)
        setError(null)

        console.log(`➖ BalanceContext: subtracting ${amount} from balance for fid=${user.fid} (${user.username})`)

        // Оптимистичное обновление
        const newBalance = currentBalance - amount
        setBalance(newBalance)
        localStorage.setItem("oinkBalance", newBalance.toString())

        // Используем POST с отрицательным balanceChange
        const res = await fetch("/api/balance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fid: user.fid,
            username: user.username,
            balanceChange: -amount,
            reason: "subtract_coins",
          }),
        })

        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || "Failed to subtract from balance")
        }

        const data = await res.json()
        console.log(
          `✅ BalanceContext: Subtracted ${amount} from balance, new total:`,
          data.balance,
          "for user:",
          user.username,
        )

        setBalance(data.balance)
        localStorage.setItem("oinkBalance", data.balance.toString())

        return true
      } catch (e: any) {
        console.error("❌ BalanceContext subtractFromBalance error:", e)
        setError(e.message || "Failed to subtract from balance")
        await fetchBalance() // Восстанавливаем актуальный баланс
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [balance, fetchBalance],
  )

  // 5) Метод для принудительного обновления
  const refreshBalance = useCallback(async () => {
    console.log("🔄 BalanceContext: Refreshing balance...")
    await fetchBalance()
  }, [fetchBalance])

  // Инициализация баланса при загрузке
  useEffect(() => {
    const user = getCurrentUser()
    if (user?.fid) {
      console.log("🚀 BalanceContext: Initializing for user:", user.username, "FID:", user.fid)

      // Сначала загружаем из localStorage для быстрого отображения
      const savedBalance = localStorage.getItem("oinkBalance")
      if (savedBalance) {
        setBalance(Number(savedBalance))
      }

      // Затем синхронизируем с БД
      fetchBalance()
    } else {
      console.error("❌ BalanceContext: No valid user found")
      setError("No user data available")
    }
  }, [fetchBalance])

  // Слушатель для глобальных обновлений баланса
  useEffect(() => {
    const handleBalanceUpdate = (event: CustomEvent) => {
      const { balance: newBalance } = event.detail
      console.log("🔄 BalanceContext: Global balance update received:", newBalance)
      setBalance(newBalance)
      localStorage.setItem("oinkBalance", newBalance.toString())
    }

    window.addEventListener("balanceUpdated", handleBalanceUpdate as EventListener)
    return () => {
      window.removeEventListener("balanceUpdated", handleBalanceUpdate as EventListener)
    }
  }, [])

  return (
    <BalanceContext.Provider
      value={{
        balance,
        isLoading,
        error,
        fetchBalance,
        updateBalance,
        addToBalance,
        subtractFromBalance,
        refreshBalance,
      }}
    >
      {children}
    </BalanceContext.Provider>
  )
}

// Хук-помощник для доступа к контексту
export function useBalance() {
  const ctx = useContext(BalanceContext)
  if (!ctx) {
    throw new Error("useBalance must be used within BalanceProvider")
  }
  return ctx
}
