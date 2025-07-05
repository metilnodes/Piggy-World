export async function initFrames() {
  try {
    // Проверяем, что мы в браузере
    if (typeof window === "undefined") return false

    // Динамический импорт SDK для избежания ошибок SSR
    const { sdk } = await import("@farcaster/miniapp-sdk")

    // Инициализация Frame SDK с отключением нативных жестов
    await sdk.actions.ready({ disableNativeGestures: true })

    // Делаем SDK доступным глобально для использования в других компонентах
    ;(window as any).sdk = sdk

    console.log("Frame SDK initialized successfully and made globally available")
    return true
  } catch (error) {
    console.error("Error initializing Frame SDK:", error)
    return false
  }
}

// Функция для определения, открыто ли приложение в Warpcast/Farcaster
export function isInWarpcast(): boolean {
  try {
    if (typeof window === "undefined") return false

    // Проверяем мета-тег fc:frame
    const hasFrameMetaTag = !!document.querySelector('meta[name="fc:frame"]')

    // Дополнительные проверки
    const userAgent = navigator.userAgent.toLowerCase()
    const isWarpcastUA = userAgent.includes("warpcast") || userAgent.includes("farcaster")
    const isFramed = window.parent !== window
    const referrerCheck = document.referrer.includes("warpcast") || document.referrer.includes("farcaster")

    return hasFrameMetaTag || isWarpcastUA || isFramed || referrerCheck
  } catch (error) {
    console.error("Error checking if in Warpcast:", error)
    return false
  }
}

// Новая функция, которая объединяет инициализацию SDK и проверку/добавление Mini App
export async function initAndMaybeAddMiniApp() {
  try {
    // Проверяем, находимся ли мы в Warpcast
    const isInFrame = isInWarpcast()
    console.log("🖼️ Frame context:", { isInFrame })

    if (!isInFrame) {
      console.log("ℹ️ Not in Warpcast, skipping SDK initialization")
      return false
    }

    // Инициализируем SDK
    const ok = await initFrames()
    if (!ok) {
      console.log("⚠️ Failed to initialize SDK")
      return false
    }

    // Получаем SDK из глобального объекта
    const sdk = (window as any).sdk
    if (!sdk || typeof sdk.getContext !== "function") {
      console.log("⚠️ SDK not available or getContext missing")
      return false
    }

    // Получаем контекст и проверяем, добавлено ли приложение
    const context = await sdk.getContext()
    console.log("🔍 SDK Context:", context)

    if (context?.client?.added === false && context?.client?.type === "warpcast") {
      console.log("ℹ️ Triggering addMiniApp prompt...")
      await sdk.actions.addMiniApp()
      console.log("✅ Prompt shown")
      return true
    } else {
      console.log("ℹ️ App already added or not in Warpcast")
      return false
    }
  } catch (error) {
    console.error("❌ Error in initAndMaybeAddMiniApp:", error)
    return false
  }
}

// Функция для выполнения QuickAuth согласно официальной документации
export async function performQuickAuth() {
  try {
    console.log("🚀 Starting QuickAuth process...")

    // Проверяем, что мы в браузере
    if (typeof window === "undefined") {
      throw new Error("Not in browser environment")
    }

    // Динамический импорт SDK
    const { sdk } = await import("@farcaster/miniapp-sdk")

    // Инициализируем SDK
    await sdk.actions.ready()

    console.log("✅ SDK ready, starting QuickAuth...")

    // Выполняем QuickAuth
    const result = await sdk.experimental.quickAuth()

    if (!result || !result.token) {
      throw new Error("QuickAuth failed: no token received")
    }

    console.log("✅ QuickAuth successful, got token")

    // Верифицируем токен через наш API
    const response = await fetch("/api/auth/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: `Bearer ${result.token}`,
      }),
    })

    if (!response.ok) {
      throw new Error(`Token verification failed: ${response.status}`)
    }

    const verificationData = await response.json()
    console.log("✅ Token verified, FID:", verificationData.fid)

    return {
      token: result.token,
      fid: verificationData.fid,
      success: true,
    }
  } catch (error) {
    console.error("❌ QuickAuth error:", error)
    return {
      token: null,
      fid: null,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}
