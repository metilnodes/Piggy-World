"use client"

import { useEffect, useState } from "react"
import { useHybridAuth } from "@/hooks/useHybridAuth"
import { WorldMap } from "@/components/world-map"
import { BalanceProvider } from "@/contexts/balance-context"
import { AppProvider } from "@/contexts/app-context"
import { SplashScreen } from "@/components/splash-screen"

export default function FrameApp() {
  const { isAuthenticated, isLoading } = useHybridAuth()
  const [showSplash, setShowSplash] = useState(true)
  const [sdkLoaded, setSdkLoaded] = useState(false)

  // Load Farcaster SDK
  useEffect(() => {
    const loadSDK = async () => {
      try {
        // Динамический импорт нового SDK
        const { default: sdk } = await import("@farcaster/miniapp-sdk")

        // Инициализация SDK
        await sdk.actions.ready()
        console.log("✅ Farcaster MiniApp SDK loaded successfully")
        setSdkLoaded(true)
      } catch (error) {
        console.error("❌ Failed to load Farcaster MiniApp SDK:", error)
        // Продолжаем работу даже если SDK не загрузился
        setSdkLoaded(true)
      }
    }

    loadSDK()
  }, [])

  // Hide splash screen after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  // Show splash screen
  if (showSplash || !sdkLoaded) {
    return <SplashScreen />
  }

  return (
    <AppProvider>
      <BalanceProvider>
        <div className="min-h-screen bg-black text-white">
          <WorldMap />
        </div>
      </BalanceProvider>
    </AppProvider>
  )
}
