export async function initFrames() {
  try {
    // Проверяем, что мы в браузере
    if (typeof window === "undefined") return false

    console.log("🖼️ Initializing frame SDK...")

    // Динамический импорт нового SDK для избежания ошибок SSR
    const { sdk } = await import("@farcaster/miniapp-sdk")

    // Инициализация Miniapp SDK с отключением нативных жестов
    await sdk.actions.ready({
      disableNativeGestures: true,
      timeout: 3000,
    })

    // Делаем SDK доступным глобально для использования в других компонентах
    ;(window as any).sdk = sdk

    console.log("✅ Miniapp SDK initialized successfully and made globally available")
    return true
  } catch (error) {
    console.error("❌ Error initializing Miniapp SDK:", error)
    return false
  }
}

// Функция для определения, открыто ли приложение в Warpcast/Farcaster
export function isInWarpcast(): boolean {
  try {
    if (typeof window === "undefined") return false

    const userAgent = navigator.userAgent.toLowerCase()
    const isWarpcastUA = userAgent.includes("warpcast") || userAgent.includes("farcaster")
    const isFramed = window.parent !== window
    const referrerCheck = document.referrer.includes("warpcast") || document.referrer.includes("farcaster")

    // Check for frame-specific URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const hasFrameParams = urlParams.has("frame") || urlParams.has("fid")

    // Check for frame-specific headers or meta tags
    const hasFrameMetaTag =
      !!document.querySelector('meta[property="fc:frame"]') || !!document.querySelector('meta[name="fc:frame"]')

    const result = isWarpcastUA || isFramed || referrerCheck || hasFrameParams || hasFrameMetaTag

    console.log("🖼️ Frame detection:", {
      isWarpcastUA,
      isFramed,
      referrerCheck,
      hasFrameParams,
      hasFrameMetaTag,
      result,
    })

    return result
  } catch (error) {
    console.error("Error checking if in Warpcast:", error)
    return false
  }
}
