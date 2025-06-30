"use client"

import { useState, useEffect } from "react"

interface NeynarAuthResult {
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
  }
}

// Функция для получения FID из URL параметров (если передан из Farcaster)
function getFidFromUrl(): string | null {
  if (typeof window === "undefined") return null

  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get("fid")
}

export function useNeynarAuth(): NeynarAuthResult {
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
  }) => {
    try {
      localStorage.setItem("neynarUser", JSON.stringify(userData))
      localStorage.setItem("fc_fid", userData.fid)
      localStorage.setItem("fc_username", userData.username)
      localStorage.setItem("fc_display_name", userData.displayName)
      localStorage.setItem("fc_pfp_url", userData.pfpUrl || "")
      console.log("💾 User data saved to localStorage:", userData)
    } catch (error) {
      console.error("❌ Error saving user data:", error)
    }
  }

  // Функция для загрузки данных из localStorage
  const loadUserDataFromStorage = () => {
    try {
      const savedUser = localStorage.getItem("neynarUser")
      if (!savedUser) return null

      const userData = JSON.parse(savedUser)
      if (userData.fid && userData.username) {
        return userData
      }

      return null
    } catch (error) {
      console.error("❌ Error loading user data from storage:", error)
      return null
    }
  }

  // Функция для получения данных пользователя через Neynar
  const fetchUserData = async (userFid: string) => {
    try {
      console.log(`🔍 Fetching user data for FID: ${userFid}`)

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

        console.log("✅ Successfully fetched user data:", userData)
        return userData
      } else {
        throw new Error("No user data found")
      }
    } catch (error: any) {
      console.error("❌ Error fetching user data:", error)
      throw error
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
      const userData = await fetchUserData(fid)

      // Обновляем состояние
      setUsername(userData.username)
      setDisplayName(userData.displayName)
      setPfpUrl(userData.pfpUrl)
      setBio(userData.bio)
      setFollowerCount(userData.followerCount)
      setFollowingCount(userData.followingCount)

      // Сохраняем в localStorage
      saveUserData(userData)

      console.log("💾 User data refreshed:", userData)
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

        console.log("🚀 Starting Neynar auth process...")

        if (typeof window === "undefined") {
          throw new Error("Not in browser environment")
        }

        // Force clear если есть параметр
        if (window.location.search.includes("forceClear=true")) {
          console.log("🧹 Force clear triggered")
          localStorage.removeItem("neynarUser")
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

        // Пытаемся получить FID из URL параметров
        const urlFid = getFidFromUrl()

        if (urlFid) {
          console.log(`🔗 Found FID in URL: ${urlFid}`)

          try {
            const userData = await fetchUserData(urlFid)

            // Устанавливаем данные
            setFid(userData.fid)
            setUsername(userData.username)
            setDisplayName(userData.displayName)
            setPfpUrl(userData.pfpUrl)
            setBio(userData.bio)
            setFollowerCount(userData.followerCount)
            setFollowingCount(userData.followingCount)
            setIsAuthenticated(true)

            // Сохраняем в localStorage
            saveUserData(userData)

            console.log("✅ Auth successful with URL FID:", userData)
            setIsLoading(false)
            return
          } catch (fetchError: any) {
            console.error("❌ Failed to fetch user data for URL FID:", fetchError)
            // Продолжаем к демо режиму
          }
        }

        // Проверяем, включен ли режим разработки или демо
        const isDevelopment = process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_DEV_MODE === "true"

        if (isDevelopment) {
          console.log("🧪 Development mode detected, creating demo user")
          const demoUser = createDemoUser()

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

        // Если ничего не сработало, показываем ошибку
        setError("No FID provided. Please open this app from Farcaster with a valid user ID.")
        setIsAuthenticated(false)
      } catch (e: any) {
        console.error("❌ Auth error:", e)
        setError(e.message || String(e))
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  return {
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
