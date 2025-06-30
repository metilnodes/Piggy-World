"use client"

import { createContext, useContext, useState, type ReactNode, useEffect } from "react"
import { updateBalanceInDb, getBalanceFromDb } from "../utils/db-utils"

type Location = "piggy-ai" | "piggy-bank" | "casino" | "nft-hall" | "superform-area" | "oink-oink" | "game-zone" | null

interface AppContextType {
  balance: number
  setBalance: (balance: number) => void
  addCoins: (amount: number, reason?: string) => Promise<void>
  removeCoins: (amount: number, reason?: string) => Promise<boolean>
  activeLocation: Location
  openLocation: (location: Location) => void
  closeLocation: () => void
  loadBalanceFromDb: (fid: string) => Promise<number>
  syncBalanceWithDb: (fid: string, username: string) => Promise<void>
  forceBalanceSync: (fid: string, username: string) => Promise<number>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState<number>(1000)
  const [activeLocation, setActiveLocation] = useState<Location>(null)

  // Load balance from localStorage on component mount
  useEffect(() => {
    if (typeof window === "undefined") return

    const savedBalance = localStorage.getItem("oinkBalance")
    if (savedBalance) {
      setBalance(Number(savedBalance))
    } else {
      setBalance(1000)
      localStorage.setItem("oinkBalance", "1000")
    }
  }, [])

  // Save balance to localStorage whenever it changes
  useEffect(() => {
    if (typeof window === "undefined") return
    localStorage.setItem("oinkBalance", balance.toString())
  }, [balance])

  // Функция для синхронизации баланса с базой данных
  const syncBalanceWithDb = async (fid: string, username: string) => {
    try {
      const dbBalance = await getBalanceFromDb(fid)
      if (dbBalance !== null) {
        setBalance(dbBalance)
        localStorage.setItem("oinkBalance", dbBalance.toString())
        return dbBalance
      }
    } catch (error) {
      console.error("Error syncing balance with DB:", error)
    }
    return balance
  }

  // Функция для принудительной синхронизации баланса во всех модулях
  const forceBalanceSync = async (fid: string, username: string) => {
    try {
      console.log(`🔄 Force syncing balance across all modules...`)

      const dbBalance = await getBalanceFromDb(fid)
      if (dbBalance !== null) {
        console.log(`💰 Force sync: updating balance to ${dbBalance}`)

        setBalance(dbBalance)
        localStorage.setItem("oinkBalance", dbBalance.toString())

        // Уведомляем все компоненты об изменении
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("balanceUpdated", {
              detail: { balance: dbBalance, fid, username },
            }),
          )
        }

        return dbBalance
      }
    } catch (error) {
      console.error("❌ Error force syncing balance:", error)
    }
    return balance
  }

  const addCoins = async (amount: number, reason?: string) => {
    const newBalance = balance + amount
    setBalance(newBalance)
    localStorage.setItem("oinkBalance", newBalance.toString())

    const savedUser = localStorage.getItem("farcaster_user")
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser)
        await updateBalanceInDb(user.fid, user.username, amount, reason)
      } catch (error) {
        console.error("Error updating balance in DB:", error)
      }
    }
  }

  const removeCoins = async (amount: number, reason?: string): Promise<boolean> => {
    console.log(`💰 Removing ${amount} coins (reason: ${reason})`)

    if (balance >= amount) {
      // Мгновенно обновляем UI
      const newBalance = balance - amount
      setBalance(newBalance)
      localStorage.setItem("oinkBalance", newBalance.toString())

      // Затем синхронизируем с БД в фоне
      const savedUser = localStorage.getItem("farcasterUser")
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser)
          const dbBalance = await updateBalanceInDb(user.fid, user.username, -amount, reason)
          if (dbBalance !== null && dbBalance !== newBalance) {
            // Если БД вернула другой баланс, обновляем
            console.log(`🔄 DB returned different balance: ${newBalance} -> ${dbBalance}`)
            setBalance(dbBalance)
            localStorage.setItem("oinkBalance", dbBalance.toString())
          }
        } catch (error) {
          console.error("❌ Error updating user balance:", error)
          // В случае ошибки возвращаем старый баланс
          setBalance(balance)
          localStorage.setItem("oinkBalance", balance.toString())
          return false
        }
      }
      return true
    }
    return false
  }

  const loadBalanceFromDb = async (fid: string) => {
    try {
      const dbBalance = await getBalanceFromDb(fid)
      if (dbBalance !== null) {
        setBalance(dbBalance)
        localStorage.setItem("oinkBalance", dbBalance.toString())
        return dbBalance
      }
    } catch (error) {
      console.error("Error loading balance from DB:", error)
    }
    return balance
  }

  const openLocation = (location: Location) => {
    setActiveLocation(location)
  }

  const closeLocation = () => {
    setActiveLocation(null)
  }

  return (
    <AppContext.Provider
      value={{
        balance,
        setBalance,
        addCoins,
        removeCoins,
        activeLocation,
        openLocation,
        closeLocation,
        loadBalanceFromDb,
        syncBalanceWithDb,
        forceBalanceSync,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider")
  }
  return context
}
