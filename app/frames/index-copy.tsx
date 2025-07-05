import { sdk } from "@farcaster/miniapp-sdk"

export async function initFrames() {
  try {
    // Инициализация Miniapp SDK с отключением нативных жестов
    await sdk.actions.ready({ disableNativeGestures: true })
    console.log("Miniapp SDK initialized successfully")
    return true
  } catch (error) {
    console.error("Error initializing Miniapp SDK:", error)
    return false
  }
}

// Функция для определения, открыто ли приложение в Warpcast
export function isInWarpcast(): boolean {
  try {
    if (typeof window === "undefined") return false

    return (
      window.location.ancestorOrigins?.[0]?.includes("warpcast.com") ||
      /warpcast|farcaster/i.test(navigator.userAgent) ||
      document.referrer.includes("warpcast.com")
    )
  } catch (error) {
    console.error("Error checking if in Warpcast:", error)
    return false
  }
}
