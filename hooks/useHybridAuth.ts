"use client"

import { useState, useEffect } from "react"

interface HybridAuthResult {
  token: string | null
  fid: string | null
  username: string | null
  displayName: string | null
  pfpUrl: string | null
  bio: string | null
  followerCount: number
  followingCount: number
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
  refreshUserData: () => Promise<void>
  isRefreshing: boolean
}

// Функция для создания демо пользователя
function createDemoUser() {
  const demoId = Math.floor(Math.random() * 10000).toString()
  return {
    fid: demoId,
    username: `demo_user_${demoId}`,
    displayName: `Demo User ${demoId}`,
    pfpUrl: null,
    bio: "Demo user for testing",
    followerCount: Math.floor(Math.random() * 1000),
    followingCount: Math.floor(Math.random() * 500),
    token: `demo_token_${demoId}`,
  }
}

export function useHybridAuth(): HybridAuthResult {
  const [token, setToken] = useState<string | null>(null)
  const [fid, setFid] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState<string | null>(null)
  const [pfpUrl, setPfpUrl] = useState<string | null>(null)
  const [bio, setBio] = useState<string | null>(null)
  const [followerCount, setFollowerCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Функция для сохранения данных в localStorage
  const saveUserData = (userData: {
    fid: string
    username: string
    displayName: string
    pfpUrl: string | null
    bio: string | null
    followerCount: number
    followingCount: number
    token?: string
  }) => {
    try {
      // ИСПРАВЛЕНО: Очищаем старые гостевые данные при сохранении настоящего пользователя
      if (userData.fid && !userData.fid.startsWith("guest")) {
        localStorage.removeItem("farcasterUser")
        console.log("🧹 Cleared old guest user data for real user:", userData.username)
      }

      localStorage.setItem("hybridUser", JSON.stringify(userData))
      localStorage.setItem("fc_fid", userData.fid)
      localStorage.setItem("fc_username", userData.username)
      localStorage.setItem("fc_display_name", userData.displayName)
      localStorage.setItem("fc_pfp_url", userData.pfpUrl || "")
      if (userData.token) {
        localStorage.setItem("fc_token", userData.token)
      }
      console.log("💾 Hybrid user data saved:", userData)
    } catch (error) {
      console.error("❌ Error saving user data:", error)
    }
  }

  // Функция для загрузки данных из localStorage
  const loadUserDataFromStorage = () => {
    try {
      // ИСПРАВЛЕНО: Приоритет hybridUser над farcasterUser
      const savedUser = localStorage.getItem("hybridUser") || localStorage.getItem("farcasterUser")
      if (!savedUser) return null

      const userData = JSON.parse(savedUser)
      if (userData.fid && userData.username) {
        console.log("📂 Loaded user data from storage:", userData)
        return userData
      }

      return null
    } catch (error) {
      console.error("❌ Error loading user data from storage:", error)
      return null
    }
  }

  // Функция для получения данных пользователя через Neynar
  const fetchUserDataFromNeynar = async (userFid: string) => {
    try {
      console.log(`🔍 Fetching user data from Neynar for FID: ${userFid}`)

      const response = await fetch(`/api/neynar/user?fid=${userFid}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch user data: ${response.status}`)
      }

      const data = await response.json()
      const user = data?.users?.[0]

      if (user) {
        const userData = {
          fid: user.fid.toString(),
          username: user.username,
          displayName: user.display_name || user.username,
          pfpUrl: user.pfp_url || null,
          bio: user.bio || null,
          followerCount: user.follower_count || 0,
          followingCount: user.following_count || 0,
        }

        console.log("✅ Successfully fetched user data from Neynar:", userData)
        return userData
      } else {
        throw new Error("No user data found in Neynar response")
      }
    } catch (error: any) {
      console.error("❌ Error fetching user data from Neynar:", error)

      // Возвращаем fallback данные только если это не реальный FID
      return {
        fid: userFid,
        username: `user_${userFid}`,
        displayName: `User ${userFid}`,
        pfpUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userFid}`,
        bio: `User with FID ${userFid}`,
        followerCount: 0,
        followingCount: 0,
      }
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
      console.log(`🔄 Refreshing user data for FID: ${fid}`)
      const userData = await fetchUserDataFromNeynar(fid)

      // Обновляем состояние
      setUsername(userData.username)
      setDisplayName(userData.displayName)
      setPfpUrl(userData.pfpUrl)
      setBio(userData.bio)
      setFollowerCount(userData.followerCount)
      setFollowingCount(userData.followingCount)

      // Сохраняем в localStorage
      saveUserData({
        ...userData,
        token,
      })

      console.log("💾 User data refreshed from Neynar:", userData)
    } catch (err: any) {
      console.error("Failed to refresh user data:", err)
      setError("Failed to refresh user data: " + err.message)
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    async function initAuth() {
      try {
        setIsLoading(true)
        setError(null)

        console.log("🚀 Starting hybrid auth process (Farcaster SDK + Neynar)...")

        if (typeof window === "undefined") {
          throw new Error("Not in browser environment")
        }

        // Force clear если есть параметр
        if (window.location.search.includes("forceClear=true")) {
          console.log("🧹 Force clear triggered")
          localStorage.removeItem("hybridUser")
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

          // ИСПРАВЛЕНО: Проверяем, не являются ли данные временными
          const isTemporaryData =
            savedUserData.username?.startsWith("user_") ||
            savedUserData.username?.startsWith("demo_") ||
            savedUserData.displayName?.startsWith("User ")

          if (isTemporaryData) {
            console.log("⚠️ Found temporary user data, will refresh from Neynar")

            // Устанавливаем временные данные
            setToken(savedUserData.token || null)
            setFid(savedUserData.fid)
            setUsername(savedUserData.username)
            setDisplayName(savedUserData.displayName)
            setPfpUrl(savedUserData.pfpUrl)
            setBio(savedUserData.bio)
            setFollowerCount(savedUserData.followerCount || 0)
            setFollowingCount(savedUserData.followingCount || 0)
            setIsAuthenticated(true)

            // Пытаемся обновить данные через Neynar
            try {
              const realUserData = await fetchUserDataFromNeynar(savedUserData.fid)

              // Обновляем с реальными данными
              setUsername(realUserData.username)
              setDisplayName(realUserData.displayName)
              setPfpUrl(realUserData.pfpUrl)
              setBio(realUserData.bio)
              setFollowerCount(realUserData.followerCount)
              setFollowingCount(realUserData.followingCount)

              // Сохраняем обновленные данные
              saveUserData({
                ...realUserData,
                token: savedUserData.token,
              })

              console.log("✅ Updated temporary data with real Neynar data:", realUserData)
            } catch (neynarError) {
              console.warn("⚠️ Failed to update with Neynar data, keeping temporary data")
            }
          } else {
            // Данные выглядят реальными, используем их
            setToken(savedUserData.token || null)
            setFid(savedUserData.fid)
            setUsername(savedUserData.username)
            setDisplayName(savedUserData.displayName)
            setPfpUrl(savedUserData.pfpUrl)
            setBio(savedUserData.bio)
            setFollowerCount(savedUserData.followerCount || 0)
            setFollowingCount(savedUserData.followingCount || 0)
            setIsAuthenticated(true)
          }

          setIsLoading(false)
          return
        }

        // Проверяем, включен ��и режим разработки
        const isDevelopment = process.env.NODE_ENV === "development"

        // В режиме разработки создаем демо пользователя ТОЛЬКО если нет реального FID
        if (isDevelopment && !window.location.search.includes("fid=")) {
          console.log("🧪 Development mode detected, creating demo user")
          const demoUser = createDemoUser()

          setToken(demoUser.token)
          setFid(demoUser.fid)
          setUsername(demoUser.username)
          setDisplayName(demoUser.displayName)
          setPfpUrl(demoUser.pfpUrl)
          setBio(demoUser.bio)
          setFollowerCount(demoUser.followerCount)
          setFollowingCount(demoUser.followingCount)
          setIsAuthenticated(true)

          saveUserData(demoUser)

          setIsLoading(false)
          return
        }

        // Пытаемся использовать Farcaster SDK для аутентификации
        try {
          console.log("🔍 Trying to use Farcaster SDK for QuickAuth...")

          // Динамический импорт SDK
          const { sdk } = await import("@farcaster/frame-sdk")

          // Инициализируем SDK
          await sdk.actions.ready()
          console.log("✅ Farcaster SDK initialized")

          // Вызываем QuickAuth
          const signInResult = await sdk.experimental.quickAuth()
          console.log("✅ QuickAuth completed:", signInResult)

          if (!signInResult || !signInResult.token) {
            throw new Error("No token returned from QuickAuth")
          }

          const loginToken = signInResult.token

          // Отправляем токен на свой API-роут для валидации и получения FID
          const res = await fetch("/api/auth/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: `Bearer ${loginToken}` }),
          })

          if (!res.ok) {
            throw new Error("JWT verification failed")
          }

          const verificationResult = await res.json()
          const userFid = verificationResult.fid

          console.log(`✅ Got FID from verification: ${userFid}`)

          // ИСПРАВЛЕНО: Теперь всегда получаем данные пользователя через Neynar
          console.log("🔍 Fetching real user data from Neynar...")
          const neynarUserData = await fetchUserDataFromNeynar(userFid)

          // Устанавливаем данные
          setToken(loginToken)
          setFid(neynarUserData.fid)
          setUsername(neynarUserData.username)
          setDisplayName(neynarUserData.displayName)
          setPfpUrl(neynarUserData.pfpUrl)
          setBio(neynarUserData.bio)
          setFollowerCount(neynarUserData.followerCount)
          setFollowingCount(neynarUserData.followingCount)
          setIsAuthenticated(true)

          // Сохраняем в localStorage
          saveUserData({
            ...neynarUserData,
            token: loginToken,
          })

          console.log("✅ Hybrid auth successful with real Neynar data:", neynarUserData)
        } catch (sdkError: any) {
          console.error("❌ SDK or QuickAuth error:", sdkError)

          // Создаем демо пользователя в случае ошибки SDK
          console.log("🧪 Creating demo user due to SDK error")
          const demoUser = createDemoUser()

          setToken(demoUser.token)
          setFid(demoUser.fid)
          setUsername(demoUser.username)
          setDisplayName(demoUser.displayName)
          setPfpUrl(demoUser.pfpUrl)
          setBio(demoUser.bio)
          setFollowerCount(demoUser.followerCount)
          setFollowingCount(demoUser.followingCount)
          setIsAuthenticated(true)

          saveUserData(demoUser)
        }
      } catch (e: any) {
        console.error("❌ Auth error:", e)
        setError(e.message || String(e))

        // Создаем демо пользователя в случае ошибки
        const demoUser = createDemoUser()
        setToken(demoUser.token)
        setFid(demoUser.fid)
        setUsername(demoUser.username)
        setDisplayName(demoUser.displayName)
        setPfpUrl(demoUser.pfpUrl)
        setBio(demoUser.bio)
        setFollowerCount(demoUser.followerCount)
        setFollowingCount(demoUser.followingCount)
        setIsAuthenticated(true)

        saveUserData(demoUser)
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
    bio,
    followerCount,
    followingCount,
    isLoading,
    error,
    isAuthenticated,
    refreshUserData,
    isRefreshing,
  }
}
