"use client"

import { sdk } from "@farcaster/miniapp-sdk"

let isInitialized = false

export async function initFrames() {
  if (isInitialized) {
    console.log("🔄 Frames already initialized")
    return
  }

  try {
    console.log("🚀 Initializing Frames SDK...")
    await sdk.actions.ready()
    isInitialized = true
    console.log("✅ Frames SDK initialized successfully")
  } catch (error) {
    console.error("❌ Failed to initialize Frames SDK:", error)
    throw error
  }
}

export async function addMiniApp() {
  try {
    console.log("🔍 Checking if Mini App is already added...")

    // Получаем контекст
    const context = await sdk.getContext()

    if (context?.client?.added) {
      console.log("✅ Mini App already added")
      return true
    }

    console.log("➕ Adding Mini App...")
    const result = await sdk.actions.addFrame()

    if (result) {
      console.log("✅ Mini App added successfully:", result)
      return true
    } else {
      console.log("⚠️ Add Mini App returned false")
      return false
    }
  } catch (error) {
    console.error("❌ Failed to add Mini App:", error)
    return false
  }
}

export async function initAndMaybeAddMiniApp() {
  try {
    // Сначала инициализируем SDK
    await initFrames()

    // Затем пытаемся добавить Mini App
    await addMiniApp()
  } catch (error) {
    console.error("❌ Error in initAndMaybeAddMiniApp:", error)
  }
}
