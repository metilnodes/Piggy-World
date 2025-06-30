"use client"

import { useState, useEffect } from "react"
import { NeynarService } from "@/lib/neynar-service"

interface User {
  fid: string
  username: string
  displayName: string
  pfpUrl: string
  bio?: string
  isGuest: boolean
}

export function useCleanAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    console.log("🔐 CLEAN AUTH: Starting authentication...")
    setIsLoading(true)
    setError(null)

    try {
      // 1. Check for saved user data
      const savedUser = localStorage.getItem("farcaster_user")
      if (savedUser) {
        const userData = JSON.parse(savedUser)
        console.log("🔐 CLEAN AUTH: Found saved user:", userData)

        // Verify with Neynar if it's a real user
        if (!userData.isGuest && userData.fid && !isNaN(Number.parseInt(userData.fid))) {
          const neynarUser = await NeynarService.getUserByFid(Number.parseInt(userData.fid))
          if (neynarUser) {
            const verifiedUser: User = {
              fid: neynarUser.fid.toString(),
              username: neynarUser.username,
              displayName: neynarUser.display_name,
              pfpUrl: neynarUser.pfp_url,
              bio: neynarUser.bio,
              isGuest: false,
            }
            setUser(verifiedUser)
            localStorage.setItem("farcaster_user", JSON.stringify(verifiedUser))
            console.log("🔐 CLEAN AUTH: User verified with Neynar:", verifiedUser)
            return
          }
        }

        // If guest user, use as is
        if (userData.isGuest) {
          setUser(userData)
          console.log("🔐 CLEAN AUTH: Using guest user:", userData)
          return
        }
      }

      // 2. Check URL parameters
      const urlParams = new URLSearchParams(window.location.search)
      const urlFid = urlParams.get("fid")
      const urlUsername = urlParams.get("username")

      if (urlFid && !isNaN(Number.parseInt(urlFid))) {
        console.log("🔐 CLEAN AUTH: Found FID in URL:", urlFid)
        const neynarUser = await NeynarService.getUserByFid(Number.parseInt(urlFid))
        if (neynarUser) {
          const urlUser: User = {
            fid: neynarUser.fid.toString(),
            username: neynarUser.username,
            displayName: neynarUser.display_name,
            pfpUrl: neynarUser.pfp_url,
            bio: neynarUser.bio,
            isGuest: false,
          }
          setUser(urlUser)
          localStorage.setItem("farcaster_user", JSON.stringify(urlUser))
          console.log("🔐 CLEAN AUTH: User loaded from URL FID:", urlUser)
          return
        }
      }

      if (urlUsername) {
        console.log("🔐 CLEAN AUTH: Found username in URL:", urlUsername)
        const neynarUser = await NeynarService.getUserByUsername(urlUsername)
        if (neynarUser) {
          const urlUser: User = {
            fid: neynarUser.fid.toString(),
            username: neynarUser.username,
            displayName: neynarUser.display_name,
            pfpUrl: neynarUser.pfp_url,
            bio: neynarUser.bio,
            isGuest: false,
          }
          setUser(urlUser)
          localStorage.setItem("farcaster_user", JSON.stringify(urlUser))
          console.log("🔐 CLEAN AUTH: User loaded from URL username:", urlUser)
          return
        }
      }

      // 3. Check Frame context (if available)
      if (typeof window !== "undefined" && (window as any).parent !== window) {
        console.log("🔐 CLEAN AUTH: Checking Frame context...")
        // Frame context detection logic would go here
        // For now, we'll skip this step
      }

      // 4. Default to test user (metil) for development
      console.log("🔐 CLEAN AUTH: No user found, loading test user (metil)...")
      const testUser = await NeynarService.getUserByUsername("metil")
      if (testUser) {
        const defaultUser: User = {
          fid: testUser.fid.toString(),
          username: testUser.username,
          displayName: testUser.display_name,
          pfpUrl: testUser.pfp_url,
          bio: testUser.bio,
          isGuest: false,
        }
        setUser(defaultUser)
        localStorage.setItem("farcaster_user", JSON.stringify(defaultUser))
        console.log("🔐 CLEAN AUTH: Using test user:", defaultUser)
      } else {
        throw new Error("Failed to load test user")
      }
    } catch (err) {
      console.error("🔐 CLEAN AUTH: Error during authentication:", err)
      setError(err instanceof Error ? err.message : "Authentication failed")
    } finally {
      setIsLoading(false)
    }
  }

  const setGuestMode = () => {
    const guestUser: User = {
      fid: `guest_${Date.now()}`,
      username: `guest${Math.floor(Math.random() * 1000)}`,
      displayName: "Guest User",
      pfpUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=guest${Date.now()}`,
      isGuest: true,
    }
    setUser(guestUser)
    localStorage.setItem("farcaster_user", JSON.stringify(guestUser))
    console.log("🔐 CLEAN AUTH: Switched to guest mode:", guestUser)
  }

  const setRealUser = async (fidOrUsername: string) => {
    setIsLoading(true)
    try {
      let neynarUser = null

      if (!isNaN(Number.parseInt(fidOrUsername))) {
        neynarUser = await NeynarService.getUserByFid(Number.parseInt(fidOrUsername))
      } else {
        neynarUser = await NeynarService.getUserByUsername(fidOrUsername)
      }

      if (neynarUser) {
        const realUser: User = {
          fid: neynarUser.fid.toString(),
          username: neynarUser.username,
          displayName: neynarUser.display_name,
          pfpUrl: neynarUser.pfp_url,
          bio: neynarUser.bio,
          isGuest: false,
        }
        setUser(realUser)
        localStorage.setItem("farcaster_user", JSON.stringify(realUser))
        console.log("🔐 CLEAN AUTH: Set real user:", realUser)
      } else {
        throw new Error("User not found")
      }
    } catch (err) {
      console.error("🔐 CLEAN AUTH: Error setting real user:", err)
      setError(err instanceof Error ? err.message : "Failed to set user")
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("farcaster_user")
    console.log("🔐 CLEAN AUTH: User logged out")
  }

  return {
    user,
    isLoading,
    error,
    setGuestMode,
    setRealUser,
    logout,
    refresh: initializeAuth,
  }
}
