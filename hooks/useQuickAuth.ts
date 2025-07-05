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

// Функция для создания гостевого пользователя
function createGuestUser() {
  const guestId = Math.floor(Math.random() * 10000).toString()
  return {
    fid: `guest_${guestId}`,
    username: `guest${guestId}`,
    displayName: `Guest User ${guestId}`,
    pfp: null,
    token: null,
  }
}

// Функция для сохранения данных в localStorage
const saveUserData = (userData: {
  fid: string
  username: string
  displayName: string
  pfp: string | null
  token?: string
}) => {
  try {
    localStorage.setItem("farcasterUser", JSON.stringify(userData))
    localStorage.setItem("fc_fid", userData.fid)
    localStorage.setItem("fc_username", userData.username)
    localStorage.setItem("fc_display_name", userData.displayName)
    localStorage.setItem("fc_pfp_url", userData.pfp || "")
    if (userData.token) {
      localStorage.setItem("fc_token", userData.token)
    }
    console.log("💾 User data saved to localStorage:", userData)
  } catch (error) {
    console.error("❌ Error saving user data:", error)
  }
}

// Функция для загрузки данных из localStorage
const loadUserDataFromStorage = (): {
  fid: string
  username: string
  displayName: string
  pfp: string | null
  token?: string
} | null => {
  try {
    const savedUser = localStorage.getItem("farcasterUser")
    if (!savedUser) return null

    const userData = JSON.parse(savedUser)

    if (userData.fid && userData.username) {
      return {
        fid: userData.fid,
        username: userData.username,
        displayName: userData.displayName || userData.username,
        pfp: userData.pfp,
        token: userData.token,
      }
    }

    return null
  } catch (error) {
    console.error("❌ Error loading user data from storage:", error)
    return null
  }
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
        console.log("🚀 Starting QuickAuth...")

        // Инициализируем SDK
        await sdk.actions.ready()
        console.log("✅ SDK ready")

        // Выполняем QuickAuth
        const result = await sdk.actions.quickAuth()

        if (result && result.fid) {
          console.log("✅ QuickAuth result:", result)

          // Устанавливаем данные пользователя
          setFid(result.fid.toString())
          setUsername(result.username || `user_${result.fid}`)
          setDisplayName(result.displayName || result.username || `User ${result.fid}`)
          setPfpUrl(result.pfpUrl || null)
          setIsAuthenticated(true)

          console.log("✅ User authenticated via QuickAuth")
        } else {
          console.log("⚠️ QuickAuth returned null, staying guest")
          setIsAuthenticated(false)
        }
      } catch (err: any) {
        console.error("❌ QuickAuth error:", err)
        setError(err.message || "QuickAuth failed")
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
