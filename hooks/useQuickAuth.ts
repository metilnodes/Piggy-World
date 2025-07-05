"use client"

import { useState, useEffect } from "react"

interface UserData {
  fid: string
  username: string
  displayName: string
  pfpUrl: string | null
  bio: string | null
  followerCount: number
  followingCount: number
}

interface QuickAuthResult extends UserData {
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
  refreshUserData: () => Promise<void>
  isRefreshing: boolean
}

// Функция для создания гостевого пользователя
function createGuestUser(): UserData {
  const guestId = Math.floor(Math.random() * 10000).toString()
  return {
    fid: `guest_${guestId}`,
    username: `guest${guestId}`,
    displayName: `Guest User ${guestId}`,
    pfpUrl: null,
    bio: null,
    followerCount: 0,
    followingCount: 0,
  }
}

// Функция для сохранения данных в localStorage
const saveUserData = (userData: UserData) => {
  try {
    localStorage.setItem("farcasterUser", JSON.stringify(userData))
    localStorage.setItem("fc_fid", userData.fid)
    localStorage.setItem("fc_username", userData.username)
    localStorage.setItem("fc_display_name", userData.displayName)
    localStorage.setItem("fc_pfp_url", userData.pfpUrl || "")
    localStorage.setItem("fc_bio", userData.bio || "")
    localStorage.setItem("fc_follower_count", userData.followerCount.toString())
    localStorage.setItem("fc_following_count", userData.followingCount.toString())
    console.log("💾 User data saved to localStorage:", userData)
  } catch (error) {
    console.error("❌ Error saving user data:", error)
  }
}

// Функция для загрузки данных из localStorage
const loadUserDataFromStorage = (): UserData | null => {
  try {
    const savedUser = localStorage.getItem("farcasterUser")
    if (!savedUser) return null

    const userData = JSON.parse(savedUser)

    if (userData.fid && userData.username) {
      return {
        fid: userData.fid,
        username: userData.username,
        displayName: userData.displayName || userData.username,
        pfpUrl: userData.pfpUrl,
        bio: userData.bio,
        followerCount: userData.followerCount || 0,
        followingCount: userData.followingCount || 0,
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
  const [username, setUsername] = useState<string>("")
  const [displayName, setDisplayName] = useState<string>("")
  const [pfpUrl, setPfpUrl] = useState<string | null>(null)
  const [bio, setBio] = useState<string | null>(null)
  const [followerCount, setFollowerCount] = useState<number>(0)
  const [followingCount, setFollowingCount] = useState<number>(0)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)

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
        pfpUrl,
        bio,
        followerCount,
        followingCount,
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
          localStorage.removeItem("fc_bio")
          localStorage.removeItem("fc_follower_count")
          localStorage.removeItem("fc_following_count")
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
          setFollowerCount(savedUserData.followerCount)
          setFollowingCount(savedUserData.followingCount)
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
          setPfpUrl(demoUser.pfpUrl)
          setBio(demoUser.bio)
          setFollowerCount(demoUser.followerCount)
          setFollowingCount(demoUser.followingCount)
          setIsAuthenticated(true)

          saveUserData(demoUser)

          setIsLoading(false)
          return
        }

        // Пытаемся использовать Frame SDK если доступен
        try {
          console.log("🔍 Trying to use Frame SDK...")

          // Динамический импорт SDK
          const { sdk } = await import("@farcaster/miniapp-sdk")

          // Инициализируем SDK
          await sdk.actions.ready()

          // Вызываем signIn
          const signInResult = await sdk.actions.signIn()
          console.log("✅ signIn action completed")

          if (!signInResult || !signInResult.fid) {
            throw new Error("No token returned from signIn")
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
            pfpUrl: null,
            bio: null,
            followerCount: 0,
            followingCount: 0,
            token: loginToken,
          }

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

          console.log("✅ Auth successful:", userData)
        } catch (sdkError: any) {
          console.error("❌ SDK or signIn error:", sdkError)

          // Создаем гостевого пользователя в случае ошибки
          console.log("🧪 Creating guest user due to SDK error")
          const guestUser = createGuestUser()

          setFid(guestUser.fid)
          setUsername(guestUser.username)
          setDisplayName(guestUser.displayName)
          setPfpUrl(guestUser.pfpUrl)
          setBio(guestUser.bio)
          setFollowerCount(guestUser.followerCount)
          setFollowingCount(guestUser.followingCount)
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
        setPfpUrl(guestUser.pfpUrl)
        setBio(guestUser.bio)
        setFollowerCount(guestUser.followerCount)
        setFollowingCount(guestUser.followingCount)
        setIsAuthenticated(true)

        saveUserData(guestUser)
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
    isAuthenticated,
    isLoading,
    error,
    refreshUserData,
    isRefreshing,
  }
}
