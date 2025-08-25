"use client"

import { AppProvider } from "@/contexts/app-context"
import { WorldMap } from "@/components/world-map"
import { useSimpleAuth } from "@/hooks/useSimpleAuth"
import { useState, useEffect } from "react"
import { AuthStatus } from "@/components/auth-status"

// Импорты дебагеров - только если нужны для разработки
import { SimpleAuthDebug } from "@/components/simple-auth-debug"
import { NeynarDebug } from "@/components/neynar-debug"
import { TipsDebugger } from "@/components/tips-debugger"

function AuthenticatedApp() {
  const auth = useSimpleAuth()
  const [mounted, setMounted] = useState(false)
  const [appEntered, setAppEntered] = useState(false)

  // Проверяем режим разработки
  const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === "true"

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const timer = setTimeout(() => {
      if (!auth.isAuthenticated && !auth.error) {
        console.log("🕐 Guest timeout - allowing guest access")
        setAppEntered(true)
      }
    }, 5000) // Reduced from 10 seconds to 5 seconds

    return () => clearTimeout(timer)
  }, [mounted, auth.isAuthenticated, auth.error])

  // Инициализация Frame SDK после монтирования
  useEffect(() => {
    if (!mounted) return

    const initializeFrames = async () => {
      try {
        const { initFrames, isInWarpcast } = await import("@/app/frames/index")
        const isInFrame = isInWarpcast()
        console.log("🖼️ Frame context:", { isInFrame })

        const frameInitialized = await initFrames()
        console.log("🖼️ Frame initialization result:", frameInitialized)

        if (isInFrame || frameInitialized) {
          // Добавляем поддержку Add Mini App с автоматическим добавлением при запуске
          const triggerAddMiniApp = async () => {
            if (typeof window === "undefined") return
            const sdk = (window as any).sdk
            if (sdk?.actions?.addMiniApp) {
              try {
                await sdk.actions.addMiniApp()
                console.log("🎯 Mini App addMiniApp triggered")
              } catch (e) {
                console.error("❌ addMiniApp error:", e)
              }
            }
          }

          // Вызываем добавление приложения
          setTimeout(triggerAddMiniApp, 1000) // Small delay to ensure SDK is ready
        }
      } catch (error) {
        console.error("Frame initialization error:", error)
      }
    }

    initializeFrames()
  }, [mounted])

  const handleRetry = () => {
    console.log("🔄 Retrying authentication...")
    window.location.reload()
  }

  // Не показываем ничего до монтирования
  if (!mounted) {
    return null
  }

  // Показываем загрузку только если не истек таймаут
  if (auth.isLoading && !appEntered) {
    return (
      <main
        className="relative w-full h-full overflow-hidden"
        style={{
          backgroundImage: "url('/background.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 backdrop-blur-md bg-black bg-opacity-50 z-0" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fd0c96] mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-[#fd0c96] mb-2">Loading...</h2>
          <p className="text-sm text-gray-300">Connecting to Farcaster...</p>
          <p className="text-xs text-gray-400 mt-2">Getting your profile data</p>
        </div>
      </main>
    )
  }

  // Если пользователь авторизован ИЛИ разрешен гостевой доступ
  if (auth.isAuthenticated || appEntered) {
    return (
      <main
        className="relative w-full h-full overflow-hidden"
        style={{
          backgroundImage: "url('/background.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="relative w-full h-full">
          <WorldMap />
        </div>

        {/* Все дебагеры и статус аутентификации - показываем только в режиме разработки */}
        {isDevMode && (
          <>
            <AuthStatus />
            <SimpleAuthDebug />
            <NeynarDebug />
            <TipsDebugger />
          </>
        )}
      </main>
    )
  }

  // Экран ошибки
  return (
    <main
      className="relative w-full h-full overflow-hidden"
      style={{
        backgroundImage: "url('/background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 backdrop-blur-md bg-black bg-opacity-30 z-0" />
      <div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-[360px] w-full bg-black bg-opacity-70 p-6 rounded-lg shadow-lg backdrop-blur-sm transition-all duration-500 z-10"
        style={{ border: "1px solid #fd0c96" }}
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ color: "#fd0c96" }}>
            Piggy World
          </h1>
          <p className="text-sm mb-4" style={{ color: "#fd0c96" }}>
            Interactive Piggy ecosystem
          </p>

          {auth.error ? (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-red-400 text-sm font-medium">Authentication Error</p>
              <p className="text-red-300 text-xs mt-1">{auth.error}</p>
            </div>
          ) : (
            <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/50 rounded-lg">
              <p className="text-blue-400 text-sm">Waiting for Farcaster authentication...</p>
            </div>
          )}

          <div className="space-y-2">
            <button onClick={handleRetry} className="neon-button w-full">
              Try Again
            </button>
            <button onClick={() => setAppEntered(true)} className="neon-button w-full opacity-75">
              Continue as Guest
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function Home() {
  return (
    <AppProvider>
      <AuthenticatedApp />
    </AppProvider>
  )
}
