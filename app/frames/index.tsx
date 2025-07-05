"use client"

import { sdk } from "@farcaster/miniapp-sdk"

// Функция для проверки, находимся ли мы в Warpcast
export function isInWarpcast(): boolean {
  if (typeof window === "undefined") return false

  const userAgent = navigator.userAgent.toLowerCase()
  const isWarpcastUA = userAgent.includes("warpcast") || userAgent.includes("farcaster")
  const isFramed = window.parent !== window
  const referrerCheck = document.referrer.includes("warpcast") || document.referrer.includes("farcaster")

  return isWarpcastUA || isFramed || referrerCheck
}

// Функция для инициализации Frame SDK
export async function initFrames(): Promise<void> {
  try {
    console.log("🚀 Initializing Frame SDK...")

    // Инициализируем SDK
    await sdk.actions.ready()

    // Сохраняем SDK в глобальном объекте для доступа из других частей приложения
    ;(window as any).sdk = sdk

    console.log("✅ Frame SDK initialized successfully and made globally available")
  } catch (error) {
    console.error("❌ Failed to initialize Frame SDK:", error)
    throw error
  }
}

// Функция для выполнения QuickAuth
export async function performQuickAuth(): Promise<{
  success: boolean
  fid?: string
  token?: string
  error?: string
}> {
  try {
    console.log("🔐 Performing QuickAuth...")

    // Убеждаемся, что SDK инициализирован
    await sdk.actions.ready()

    // Выполняем QuickAuth
    const result = await sdk.actions.quickAuth()

    if (result && result.token) {
      console.log("✅ QuickAuth successful")
      return {
        success: true,
        fid: result.fid?.toString(),
        token: result.token,
      }
    } else {
      console.log("⚠️ QuickAuth returned no result")
      return {
        success: false,
        error: "No authentication result",
      }
    }
  } catch (error: any) {
    console.error("❌ QuickAuth failed:", error)
    return {
      success: false,
      error: error.message || "QuickAuth failed",
    }
  }
}

// Комбинированная функция для инициализации и добавления Mini App
export async function initAndMaybeAddMiniApp(): Promise<void> {
  try {
    // Проверяем, находимся ли мы в Warpcast
    if (!isInWarpcast()) {
      console.log("ℹ️ Not in Warpcast, skipping Frame SDK initialization")
      return
    }

    console.log("🚀 Initializing Farcaster SDK and checking for addMiniApp...")

    // Инициализируем SDK
    await initFrames()

    // Получаем контекст
    const context = await sdk.getContext()
    console.log("🔍 SDK Context:", context)

    // Проверяем, нужно ли добавить Mini App
    if (context?.client?.added === false && context?.client?.type === "warpcast") {
      console.log("ℹ️ Mini App not added yet, prompting...")
      await sdk.actions.addMiniApp()
      console.log("✅ Mini App prompt triggered")
    } else {
      console.log("ℹ️ Mini App already added or context unavailable")
    }
  } catch (err: any) {
    console.error("❌ Error in initAndMaybeAddMiniApp:", err)
  }
}
