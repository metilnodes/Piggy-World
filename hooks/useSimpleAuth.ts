"use client"

import { useState, useEffect } from "react"

interface SimpleAuthResult {
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

export function useSimpleAuth(): SimpleAuthResult {
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
      localStorage.setItem("simpleUser", JSON.stringify(userData))
      localStorage.setItem("fc_fid", userData.fid)
      localStorage.setItem("fc_username", userData.username)
      localStorage.setItem("fc_display_name", userData.displayName)
      localStorage.setItem("fc_pfp_url", userData.pfpUrl || "")
      if (userData.token) {
        localStorage.setItem("fc_token", userData.token)
      }
      console.log("💾 User data saved:", userData)
    } catch (error) {
      console.error("❌ Error saving user data:", error)
    }
  }

  // Функция для загрузки данных из localStorage
  const loadUserDataFromStorage = () => {
    try {
      const savedUser = localStorage.getItem("simpleUser")
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

      // Возвращаем fallback данные
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

  // Функция для проверки, находимся ли мы в Farcaster
  const isInFarcaster = () => {
    if (typeof window === "undefined") return false

    const userAgent = navigator.userAgent.toLowerCase()
    const isWarpcastUA = userAgent.includes("warpcast") || userAgent.includes("farcaster")
    const isFramed = window.parent !== window
    const referrerCheck = document.referrer.includes("warpcast") || document.referrer.includes("farcaster")

    return isWarpcastUA || isFramed || referrerCheck
  }

  useEffect(() => {
    async function initAuth() {
      try {
        setIsLoading(true)
        setError(null)

        console.log("🚀 Starting authentication process...")

        if (typeof window === "undefined") {
          throw new Error("Not in browser environment")
        }

        // Force clear если есть параметр
        if (window.location.search.includes("forceClear=true")) {
          console.log("🧹 Force clear triggered")
          localStorage.removeItem("simpleUser")
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
          setPfpUrl(savedUserData.pfpUrl)
          setBio(savedUserData.bio)
          setFollowerCount(savedUserData.followerCount || 0)
          setFollowingCount(savedUserData.followingCount || 0)
          setIsAuthenticated(true)

          setIsLoading(false)
          return
        }

        // Проверяем, находимся ли мы в Farcaster
        const inFarcaster = isInFarcaster()
        console.log("🖼️ In Farcaster:", inFarcaster)

        if (inFarcaster) {
          console.log("🔐 Attempting Farcaster QuickAuth...")

          try {
            // Импортируем функцию QuickAuth
            const { performQuickAuth } = await import("@/app/frames/index")

            // Выполняем QuickAuth
            const authResult = await performQuickAuth()

            if (authResult.success && authResult.fid && authResult.token) {
              console.log("✅ QuickAuth successful, fetching user data...")

              // Получаем данные пользователя через Neynar
              const userData = await fetchUserDataFromNeynar(authResult.fid)

              // Устанавливаем данные
              setToken(authResult.token)
              setFid(userData.fid)
              setUsername(userData.username)
              setDisplayName(userData.displayName)
              setPfpUrl(userData.pfpUrl)
              setBio(userData.bio)
              setFollowerCount(userData.followerCount)
              setFollowingCount(userData.followingCount)
              setIsAuthenticated(true)

              // Сохраняем в localStorage
              saveUserData({
                ...userData,
                token: authResult.token,
              })

              console.log("✅ Authentication successful with real user data:", userData)
            } else {
              throw new Error(authResult.error || "QuickAuth failed")
            }
          } catch (quickAuthError: any) {
            console.error("❌ QuickAuth failed:", quickAuthError)
            throw quickAuthError
          }
        } else {
          // Не в Farcaster - создаем демо пользователя
          console.log("🧪 Not in Farcaster, creating demo user")
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

        // В случае ошибки создаем демо пользователя
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
