"use client"

import { sdk } from "@farcaster/miniapp-sdk"

let isInitialized = false

export async function initFrames() {
  if (isInitialized) {
    console.log("✅ SDK already initialized")
    return
  }

  try {
    console.log("🚀 Initializing Farcaster SDK...")
    await sdk.actions.ready()
    isInitialized = true
    console.log("✅ SDK initialized successfully")
  } catch (error) {
    console.error("❌ Failed to initialize SDK:", error)
    throw error
  }
}

export async function addMiniApp() {
  try {
    console.log("🔍 Checking if mini app is already added...")

    const context = await sdk.getContext()

    if (context.client.added) {
      console.log("✅ Mini app is already added")
      return true
    }

    console.log("➕ Adding mini app...")
    await sdk.actions.addFrame()
    console.log("✅ Mini app added successfully")
    return true
  } catch (error) {
    console.error("❌ Failed to add mini app:", error)
    return false
  }
}

export async function initAndMaybeAddMiniApp() {
  try {
    await initFrames()
    await addMiniApp()
  } catch (error) {
    console.error("❌ Error in initAndMaybeAddMiniApp:", error)
  }
}
