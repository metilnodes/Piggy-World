export async function initFrames() {
  try {
    // Проверяем, что мы в браузере
    if (typeof window === "undefined") return false

    // Динамический импорт нового SDK для избежания ошибок SSR
    const { sdk } = await import("@farcaster/miniapp-sdk")

    // Инициализация Miniapp SDK с отключением нативных жестов
    await sdk.actions.ready({ disableNativeGestures: true })

    // Делаем SDK доступным глобально для использования в других компонентах
    ;(window as any).sdk = sdk

    console.log("Miniapp SDK initialized successfully and made globally available")
    return true
  } catch (error) {
    console.error("Error initializing Miniapp SDK:", error)
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
