// Утилита для открытия внешних ссылок в Farcaster Mini Apps
export const openExternalLink = async (url: string) => {
  try {
    // Проверяем, доступен ли Farcaster SDK
    if (typeof window !== "undefined") {
      // Попытка получить SDK из глобального объекта
      const sdk = (window as any).sdk || (window as any).parent?.sdk

      if (sdk && sdk.actions && sdk.actions.openUrl) {
        console.log("Opening URL with Farcaster SDK:", url)
        await sdk.actions.openUrl(url)
        return
      }

      // Попытка динамического импорта SDK
      try {
        const { sdk: farcasterSdk } = await import("@farcaster/frame-sdk")
        if (farcasterSdk && farcasterSdk.actions && farcasterSdk.actions.openUrl) {
          console.log("Opening URL with imported Farcaster SDK:", url)
          await farcasterSdk.actions.openUrl(url)
          return
        }
      } catch (importError) {
        console.log("Failed to import Farcaster SDK:", importError)
      }
    }

    // Fallback для обычных браузеров
    console.log("Opening URL with fallback method:", url)
    window.open(url, "_blank", "noopener,noreferrer")
  } catch (error) {
    console.error("Error opening external link:", error)
    // Последний fallback
    if (typeof window !== "undefined") {
      window.open(url, "_blank", "noopener,noreferrer")
    }
  }
}
