// Утилита для открытия внешних ссылок в Farcaster Mini Apps
export const openExternalLink = async (url: string) => {
  try {
    // Проверяем, находимся ли мы в Farcaster контексте
    const isInFarcaster =
      typeof window !== "undefined" &&
      (window.location.href.includes("warpcast.com") ||
        window.location.href.includes("farcaster.xyz") ||
        (window as any).parent !== window || // iframe context
        !!(window as any).sdk ||
        !!(window as any).parent?.sdk)

    if (isInFarcaster && typeof window !== "undefined") {
      // Попытка получить SDK из глобального объекта
      const sdk = (window as any).sdk || (window as any).parent?.sdk

      if (sdk && sdk.actions && sdk.actions.openUrl) {
        console.log("Opening URL with Farcaster SDK:", url)
        await sdk.actions.openUrl(url)
        return
      }

      // Попытка динамического импорта SDK только в Farcaster контексте
      try {
        const { sdk: farcasterSdk } = await import("@farcaster/frame-sdk")
        if (farcasterSdk && farcasterSdk.actions && farcasterSdk.actions.openUrl) {
          console.log("Opening URL with imported Farcaster SDK:", url)
          await farcasterSdk.actions.openUrl(url)
          return
        }
      } catch (importError) {
        console.log("Failed to import Farcaster SDK, using fallback:", importError)
      }
    }

    // Fallback для обычных браузеров
    console.log("Opening URL with standard browser method:", url)
    if (typeof window !== "undefined") {
      window.open(url, "_blank", "noopener,noreferrer")
    }
  } catch (error) {
    console.error("Error opening external link:", error)
    // Последний fallback - гарантированно работает везде
    if (typeof window !== "undefined") {
      window.open(url, "_blank", "noopener,noreferrer")
    }
  }
}
