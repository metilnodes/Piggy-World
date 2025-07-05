"use client"

import { useState, useEffect } from "react"

interface QuickAuthResult {
  token: string | null
  fid: string | null
  username: string | null
  displayName: string | null
  pfpUrl: string | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
  refreshUserData: () => Promise<void>
  isRefreshing: boolean
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

export function useQuickAuth(): QuickAuthResult {
  const [token, setToken] = useState<string | null>(null)
  const [fid, setFid] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState<string | null>(null)
  const [pfpUrl, setPfpUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

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

  // Функция для обновления данных пользователя
  const refreshUserData = async () => {
    if (!fid || isRefreshing) {
      console.warn("Cannot refresh user data: no FID available or already refreshing")
      return
    }

    setIsRefreshing(true)
    try {
      // В демо-режиме просто обновляем displayName
      setDisplayName(`${username} (Refreshed)`)

      // Сохраняем в localStorage
      saveUserData({
        fid,
        username: username || `user_${fid}`,
        displayName: `${username} (Refreshed)`,
        pfp: pfpUrl,
        token,
      })

      console.log("💾 User data refreshed (demo mode)")
    } catch (err) {
      console.error("Failed to refresh user data:", err)
      setError("Failed to refresh user data")
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    async function initAuth() {
      try {
        setIsLoading(true)
        setError(null)

        console.log("🚀 Starting auth process...")

        if (typeof window === "undefined") {
          throw new Error("Not in browser environment")
        }

        // Force clear если есть параметр
        if (window.location.search.includes("forceClear=true")) {
          console.log("🧹 Force clear triggered via ?forceClear=true")
          localStorage.removeItem("farcasterUser")
          localStorage.removeItem("fc_token")
          localStorage.removeItem("fc_fid")
          localStorage.removeItem("fc_username")
          localStorage.removeItem("fc_display_name")
          localStorage.removeItem("fc_pfp_url")
        }

        // Проверяем сохраненные данные
        const savedUserData = loadUserDataFromStorage()
        if (savedUserData && !window.location.search.includes("forceClear=true")) {
          console.log("✅ Found valid saved user data:", savedUserData)

          // Устанавливаем данные
          setToken(savedUserData.token || null)
          setFid(savedUserData.fid)
          setUsername(savedUserData.username)
          setDisplayName(savedUserData.displayName)
          setPfpUrl(savedUserData.pfp)
          setIsAuthenticated(true)

          setIsLoading(false)
          return
        }

        // Проверяем, включен ли режим разработки
        const isDevelopment = process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_DEV_MODE === "true"

        // В режиме разработки создаем гостевого пользователя
        if (isDevelopment) {
          console.log("🧪 Development mode detected, creating demo user")
          const demoUser = createGuestUser()

          setFid(demoUser.fid)
          setUsername(demoUser.username)
          setDisplayName(demoUser.displayName)
          setPfpUrl(demoUser.pfp)
          setIsAuthenticated(true)

          saveUserData(demoUser)

          setIsLoading(false)
          return
        }

        // Пытаемся использовать Frame SDK если доступен
        try {
          console.log("🔍 Trying to use Frame SDK...")

          // Динамический импорт SDK
          const { sdk } = await import("@farcaster/frame-sdk")

          // Инициализируем SDK
          await sdk.actions.ready()

          // Вызываем QuickAuth
          const signInResult = await sdk.experimental.quickAuth()
          console.log("✅ QuickAuth action completed")

          if (!signInResult || !signInResult.token) {
            throw new Error("No token returned from QuickAuth")
          }

          const loginToken = signInResult.token

          // Отправляем токен на свой API-роут для валидации
          const res = await fetch("/api/auth/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: `Bearer ${loginToken}` }),
          })

          if (!res.ok) {
            throw new Error("JWT verification failed")
          }

          // Получаем данные из ответа сервера
          const verificationResult = await res.json()
          const userFid = verificationResult.fid

          // Создаем пользователя
          const userData = {
            fid: userFid,
            username: `user_${userFid}`,
            displayName: `User ${userFid}`,
            pfp: null,
            token: loginToken,
          }

          // Устанавливаем данные
          setToken(loginToken)
          setFid(userData.fid)
          setUsername(userData.username)
          setDisplayName(userData.displayName)
          setPfpUrl(userData.pfp)
          setIsAuthenticated(true)

          // Сохраняем в localStorage
          saveUserData(userData)

          console.log("✅ Auth successful:", userData)
        } catch (sdkError: any) {
          console.error("❌ SDK or QuickAuth error:", sdkError)

          // Создаем гостевого пользователя в случае ошибки
          console.log("🧪 Creating guest user due to SDK error")
          const guestUser = createGuestUser()

          setFid(guestUser.fid)
          setUsername(guestUser.username)
          setDisplayName(guestUser.displayName)
          setPfpUrl(guestUser.pfp)
          setIsAuthenticated(true)

          saveUserData(guestUser)
        }
      } catch (e: any) {
        console.error("❌ Auth error:", e)
        setError(e.message || String(e))

        // Создаем гостевого пользователя в случае ошибки
        const guestUser = createGuestUser()
        setFid(guestUser.fid)
        setUsername(guestUser.username)
        setDisplayName(guestUser.displayName)
        setPfpUrl(guestUser.pfp)
        setIsAuthenticated(true)

        saveUserData(guestUser)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  return {
    token,
    fid,
    username,
    displayName,
    pfpUrl,
    isLoading,
    error,
    isAuthenticated,
    refreshUserData,
    isRefreshing,
  }
}
