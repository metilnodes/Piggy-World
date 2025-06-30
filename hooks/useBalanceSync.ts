"use client"

import { useEffect } from "react"
import { useAppContext } from "../contexts/app-context"

export function useBalanceSync() {
  const { setBalance } = useAppContext()

  useEffect(() => {
    // Слушаем глобальные события обновления баланса
    const handleBalanceUpdate = (event: CustomEvent) => {
      const { balance } = event.detail
      console.log(`🔄 Global balance sync: ${balance}`)
      setBalance(balance)
      localStorage.setItem("oinkBalance", balance.toString())
    }

    // Слушаем фокус окна для синхронизации
    const handleWindowFocus = async () => {
      const savedUser = localStorage.getItem("farcasterUser")
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser)
          const response = await fetch(`/api/balance?fid=${user.fid}&_t=${Date.now()}`)
          if (response.ok) {
            const data = await response.json()
            setBalance(data.balance)
            localStorage.setItem("oinkBalance", data.balance.toString())
          }
        } catch (error) {
          console.error("Error syncing balance on focus:", error)
        }
      }
    }

    if (typeof window !== "undefined") {
      window.addEventListener("balanceUpdated", handleBalanceUpdate as EventListener)
      window.addEventListener("focus", handleWindowFocus)

      return () => {
        window.removeEventListener("balanceUpdated", handleBalanceUpdate as EventListener)
        window.removeEventListener("focus", handleWindowFocus)
      }
    }
  }, [setBalance])
}
