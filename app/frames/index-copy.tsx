import { sdk } from "@farcaster/frame-sdk"

export async function initFrames() {
  try {
    // Инициализация Frame SDK с отключением нативных жестов
    await sdk.actions.ready({ disableNativeGestures: true })
    console.log("Frame SDK initialized successfully")
    return true
  } catch (error) {
    console.error("Error initializing Frame SDK:", error)
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
