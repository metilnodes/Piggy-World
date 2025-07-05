"use client"

import { useState, useEffect } from "react"
import { sdk } from "@farcaster/miniapp-sdk"

interface QuickAuthResult {
  fid: string | null
  username: string | null
  displayName: string | null
  pfpUrl: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export function useQuickAuth(): QuickAuthResult {
  const [fid, setFid] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState<string | null>(null)
  const [pfpUrl, setPfpUrl] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      try {
        console.log("🚀 Starting signIn...")

        // Инициализируем SDK
        await sdk.actions.ready()
        console.log("✅ SDK ready")

        // Выполняем signIn (правильный метод вместо quickAuth)
        const result = await sdk.actions.signIn()

        if (result && result.fid) {
          console.log("✅ signIn result:", result)

          // Устанавливаем данные пользователя
          setFid(result.fid.toString())
          setUsername(result.username || `user_${result.fid}`)
          setDisplayName(result.displayName || result.username || `User ${result.fid}`)
          setPfpUrl(result.pfpUrl || null)
          setIsAuthenticated(true)

          console.log("✅ User authenticated via signIn")
        } else {
          console.log("⚠️ signIn returned null, staying guest")
          setIsAuthenticated(false)
        }
      } catch (err: any) {
        console.error("❌ signIn error:", err)
        setError(err.message || "signIn failed")
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    run()
  }, [])

  return {
    fid,
    username,
    displayName,
    pfpUrl,
    isAuthenticated,
    isLoading,
    error,
  }
}
