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

function getFidFromUrl(): string | null {
  if (typeof window === "undefined") return null

  const urlParams = new URLSearchParams(window.location.search)
  const fid = urlParams.get("fid")

  console.log("🔗 URL FID:", fid)
  return fid
}

function getFrameFid(): string | null {
  if (typeof window === "undefined") return null

  try {
    // Проверяем различные способы получения FID из Frame
    const frameContext = (window as any).frameContext
    if (frameContext?.user?.fid) {
      console.log("🖼️ Frame FID:", frameContext.user.fid)
      return frameContext.user.fid.toString()
    }

    // Проверяем Warpcast SDK
    const warpcast = (window as any).warpcast
    if (warpcast?.user?.fid) {
      console.log("📱 Warpcast FID:", warpcast.user.fid)
      return warpcast.user.fid.toString()
    }

    // Проверяем localStorage для сохраненного FID
    const savedFid = localStorage.getItem("userFid")
    if (savedFid && savedFid !== "null") {
      console.log("💾 Saved FID:", savedFid)
      return savedFid
    }
  } catch (error) {
    console.log("❌ Error getting Frame FID:", error)
  }

  return null
}

function saveUserData(userData: UserData) {
  if (typeof window === "undefined") return

  localStorage.setItem("userFid", userData.fid)
  localStorage.setItem("fid", userData.fid)
  localStorage.setItem("username", userData.username)
  localStorage.setItem("displayName", userData.displayName)
  localStorage.setItem("pfpUrl", userData.pfpUrl || "")
  localStorage.setItem("bio", userData.bio || "")
  localStorage.setItem("followerCount", userData.followerCount.toString())
  localStorage.setItem("followingCount", userData.followingCount.toString())
}

function loadUserData(): UserData | null {
  if (typeof window === "undefined") return null

  const fid = localStorage.getItem("fid")
  if (!fid || fid.startsWith("guest_")) return null

  return {
    fid: fid,
    username: localStorage.getItem("username") || "",
    displayName: localStorage.getItem("displayName") || "",
    pfpUrl: localStorage.getItem("pfpUrl"),
    bio: localStorage.getItem("bio"),
    followerCount: Number.parseInt(localStorage.getItem("followerCount") || "0"),
    followingCount: Number.parseInt(localStorage.getItem("followingCount") || "0"),
  }
}

export function useSimpleAuth() {
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

  async function fetchUserData(targetFid: string): Promise<UserData | null> {
    try {
      console.log(`🔄 Fetching user data for FID: ${targetFid}`)

      const response = await fetch(`/api/neynar/user?fid=${targetFid}`)
      const data = await response.json()
      const user = data?.users?.[0]

      if (user && user.fid) {
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
        console.log("❌ No valid user data received:", data)
        return null
      }
    } catch (error) {
      console.error("❌ Failed to fetch user data:", error)
      setError(`Failed to fetch user data: ${error}`)
      return null
    }
  }

  // Функция для выполнения signIn
  async function trySignIn(): Promise<UserData | null> {
    try {
      console.log("🚀 Starting signIn...")

      // Динамический импорт SDK
      const { sdk } = await import("@farcaster/miniapp-sdk")

      // Инициализируем SDK
      await sdk.actions.ready()
      console.log("✅ SDK ready")

      // Выполняем signIn
      const result = await sdk.actions.signIn()

      if (result) {
        console.log("✅ signIn result:", result)

        // Используем данные из signIn результата или получаем через API
        const userData = {
          fid: result.fid?.toString() || "",
          username: result.username || `user_${result.fid}`,
          displayName: result.displayName || result.username || `User ${result.fid}`,
          pfpUrl: result.pfpUrl || null,
          bio: result.bio || null,
          followerCount: 0,
          followingCount: 0,
        }

        // Если нужно, дополнительно получаем данные через Neynar
        if (result.fid) {
          const neynarData = await fetchUserData(result.fid.toString())
          if (neynarData) {
            return neynarData
          }
        }

        return userData
      } else {
        console.log("⚠️ signIn returned null")
        return null
      }
    } catch (error) {
      console.error("❌ signIn error:", error)
      return null
    }
  }

  async function initAuth() {
    console.log("🚀 Starting authentication...")
    setIsLoading(true)
    setError(null)

    // 1. Проверяем сохраненные данные
    const storedData = loadUserData()
    if (storedData) {
      console.log("💾 Using stored user data:", storedData)
      setFid(storedData.fid)
      setUsername(storedData.username)
      setDisplayName(storedData.displayName)
      setPfpUrl(storedData.pfpUrl)
      setBio(storedData.bio)
      setFollowerCount(storedData.followerCount)
      setFollowingCount(storedData.followingCount)
      setIsAuthenticated(true)
      setIsLoading(false)
      return
    }

    // 2. Пытаемся выполнить signIn (только в Warpcast)
    try {
      const signInData = await trySignIn()
      if (signInData) {
        console.log("✅ signIn successful:", signInData)

        setFid(signInData.fid)
        setUsername(signInData.username)
        setDisplayName(signInData.displayName)
        setPfpUrl(signInData.pfpUrl)
        setBio(signInData.bio)
        setFollowerCount(signInData.followerCount)
        setFollowingCount(signInData.followingCount)
        setIsAuthenticated(true)

        // Сохраняем в localStorage
        saveUserData(signInData)

        setIsLoading(false)
        return
      }
    } catch (error) {
      console.log("⚠️ signIn not available or failed:", error)
    }

    // 3. Пытаемся получить FID из различных источников
    const urlFid = getFidFromUrl()
    const frameFid = getFrameFid()
    const targetFid = urlFid || frameFid

    if (targetFid) {
      console.log(`🎯 Found FID: ${targetFid}`)

      const userData = await fetchUserData(targetFid)
      if (userData) {
        // Устанавливаем реальные данные
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

        console.log("✅ Auth successful with real Neynar data")
        setIsLoading(false)
        return
      }
    }

    // 4. Fallback - создаем гостевого пользователя (только если все остальное не сработало)
    console.log("🏠 No authentication method worked, creating guest user")
    const guestUser = {
      fid: "guest_" + Date.now(),
      username: "guest_user",
      displayName: "Guest User",
      pfpUrl: null,
      bio: "Guest access - add ?fid=YOUR_FID to URL for real data",
      followerCount: 0,
      followingCount: 0,
    }

    setFid(guestUser.fid)
    setUsername(guestUser.username)
    setDisplayName(guestUser.displayName)
    setPfpUrl(guestUser.pfpUrl)
    setBio(guestUser.bio)
    setFollowerCount(guestUser.followerCount)
    setFollowingCount(guestUser.followingCount)
    setIsAuthenticated(true)
    setIsLoading(false)
  }

  // Функция для ручной установки FID
  const setManualFid = async (newFid: string) => {
    console.log(`🔧 Manually setting FID: ${newFid}`)
    setIsLoading(true)

    const userData = await fetchUserData(newFid)
    if (userData) {
      setFid(userData.fid)
      setUsername(userData.username)
      setDisplayName(userData.displayName)
      setPfpUrl(userData.pfpUrl)
      setBio(userData.bio)
      setFollowerCount(userData.followerCount)
      setFollowingCount(userData.followingCount)
      setIsAuthenticated(true)
      saveUserData(userData)
      console.log("✅ Manual FID set successfully")
    } else {
      setError("Failed to fetch data for provided FID")
    }
    setIsLoading(false)
  }

  useEffect(() => {
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
    setManualFid,
  }
}
