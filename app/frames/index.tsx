"use client"

export function isInWarpcast(): boolean {
  if (typeof window === "undefined") return false

  try {
    // Проверяем различные способы определения Warpcast
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isWarpcastUA = userAgent.includes("warpcast")
    const isInIframe = window.self !== window.top
    const hasWarpcastContext = !!(window as any).warpcast

    console.log("🔍 Environment check:", {
      userAgent: userAgent,
      isWarpcastUA,
      isInIframe,
      hasWarpcastContext,
    })

    return isWarpcastUA || isInIframe || hasWarpcastContext
  } catch (error) {
    console.error("Error checking Warpcast environment:", error)
    return false
  }
}

export async function initFrames(): Promise<void> {
  try {
    console.log("🚀 Initializing Farcaster SDK...")

    // Динамический импорт нового SDK
    const { sdk } = await import("@farcaster/miniapp-sdk")

    // Инициализируем SDK
    await sdk.actions.ready()

    // Сохраняем SDK глобально для использования в других частях приложения
    ;(window as any).sdk = sdk

    console.log("✅ Frame SDK initialized successfully and made globally available")
  } catch (error) {
    console.error("❌ Failed to initialize Frame SDK:", error)
    throw error
  }
}

export async function initAndMaybeAddMiniApp(): Promise<void> {
  try {
    console.log("🚀 Starting Farcaster initialization and Mini App check...")

    // Проверяем, находимся ли мы в Warpcast
    const inWarpcast = isInWarpcast()
    console.log("🖼️ In Warpcast:", inWarpcast)

    if (!inWarpcast) {
      console.log("ℹ️ Not in Warpcast, skipping SDK initialization")
      return
    }

    // Инициализируем SDK
    await initFrames()

    // Получаем SDK из глобального объекта
    const sdk = (window as any).sdk
    if (!sdk || typeof sdk.getContext !== "function") {
      console.log("⚠️ SDK not available or getContext missing")
      return
    }

    // Получаем контекст
    const context = await sdk.getContext()
    console.log("🔍 SDK Context:", context)

    // Проверяем, нужно ли показывать prompt для добавления Mini App
    if (context?.client?.added === false && context?.client?.type === "warpcast") {
      console.log("ℹ️ Triggering addMiniApp prompt...")
      await sdk.actions.addMiniApp()
      console.log("✅ AddMiniApp prompt shown")
    } else {
      console.log("ℹ️ Mini App already added or not in Warpcast client")
    }
  } catch (error) {
    console.error("❌ Error in initAndMaybeAddMiniApp:", error)
  }
}
