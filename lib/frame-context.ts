"use client"

// Функция для проверки, запущено ли приложение в контексте Farcaster
export function isInFarcasterContext(): boolean {
  if (typeof window === "undefined") return false

  try {
    // Проверяем различные индикаторы Farcaster контекста
    const userAgent = navigator.userAgent.toLowerCase()
    const isWarpcast = userAgent.includes("warpcast") || userAgent.includes("farcaster")
    const isFramed = window.parent !== window
    const hasFrameMetaTag = !!document.querySelector('meta[name="fc:frame"]')
    const referrerCheck = document.referrer.includes("warpcast") || document.referrer.includes("farcaster")

    return isWarpcast || isFramed || hasFrameMetaTag || referrerCheck
  } catch (error) {
    console.error("Error checking Farcaster context:", error)
    return false
  }
}

// Функция для получения контекста Mini App
export async function getMiniAppContext() {
  try {
    if (!isInFarcasterContext()) {
      throw new Error("Not in Farcaster context")
    }

    const { sdk } = await import("@farcaster/frame-sdk")
    await sdk.actions.ready()

    // Получаем контекст от хоста
    const context = await sdk.context
    return context
  } catch (error) {
    console.error("Failed to get Mini App context:", error)
    return null
  }
}
