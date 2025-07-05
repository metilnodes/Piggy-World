"use client"

import { useEffect, useState } from "react"

export async function initAndMaybeAddMiniApp() {
  try {
    console.log("🚀 Initializing SDK and checking addMiniApp...")

    // Динамический импорт SDK
    const { sdk } = await import("@farcaster/miniapp-sdk")

    // Инициализируем SDK
    await sdk.actions.ready()
    console.log("✅ SDK ready")

    // Получаем контекст
    const context = sdk.getContext()
    console.log("📱 SDK Context:", context)

    // Проверяем, добавлено ли уже приложение
    if (context?.client?.added) {
      console.log("✅ Mini App already added")
      return
    }

    // Пытаемся добавить Mini App
    console.log("➕ Attempting to add Mini App...")
    await sdk.actions.addMiniApp()
    console.log("✅ Mini App added successfully")
  } catch (error) {
    console.error("❌ Error in initAndMaybeAddMiniApp:", error)
  }
}

export default function FramesPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    initAndMaybeAddMiniApp()
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="p-4">
      <h1>Frames Integration</h1>
      <p>SDK initialization and Mini App setup</p>
    </div>
  )
}
