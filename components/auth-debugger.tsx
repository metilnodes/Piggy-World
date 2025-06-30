"use client"

import { useState, useEffect } from "react"
import { useHybridAuth } from "@/hooks/useHybridAuth"

export function AuthDebugger() {
  const [localStorageData, setLocalStorageData] = useState<Record<string, any>>({})
  const [isVisible, setIsVisible] = useState(true)
  const auth = useHybridAuth()

  useEffect(() => {
    if (typeof window !== "undefined") {
      const data: Record<string, any> = {}

      try {
        data.farcasterUser = JSON.parse(localStorage.getItem("farcasterUser") || "null")
        data.hybridUser = JSON.parse(localStorage.getItem("hybridUser") || "null")
      } catch (e) {
        data.farcasterUser = "Error parsing"
        data.hybridUser = "Error parsing"
      }

      data.fc_token = localStorage.getItem("fc_token")
      data.fc_fid = localStorage.getItem("fc_fid")
      data.fc_username = localStorage.getItem("fc_username")
      data.fc_display_name = localStorage.getItem("fc_display_name")
      data.fc_pfp_url = localStorage.getItem("fc_pfp_url")

      setLocalStorageData(data)
    }
  }, [auth.isLoading, auth.isRefreshing])

  const handleRefreshUserData = async () => {
    console.log("🔄 Manual refresh triggered from debugger")
    await auth.refreshUserData()

    // Обновляем данные localStorage в UI
    if (typeof window !== "undefined") {
      const data: Record<string, any> = {}

      try {
        data.farcasterUser = JSON.parse(localStorage.getItem("farcasterUser") || "null")
        data.hybridUser = JSON.parse(localStorage.getItem("hybridUser") || "null")
      } catch (e) {
        data.farcasterUser = "Error parsing"
        data.hybridUser = "Error parsing"
      }

      data.fc_token = localStorage.getItem("fc_token")
      data.fc_fid = localStorage.getItem("fc_fid")
      data.fc_username = localStorage.getItem("fc_username")
      data.fc_display_name = localStorage.getItem("fc_display_name")
      data.fc_pfp_url = localStorage.getItem("fc_pfp_url")

      setLocalStorageData(data)
    }
  }

  const handleClearCorruptedData = () => {
    if (typeof window !== "undefined") {
      console.log("🧹 Manually clearing all auth data...")
      localStorage.removeItem("farcasterUser")
      localStorage.removeItem("hybridUser")
      localStorage.removeItem("fc_token")
      localStorage.removeItem("fc_fid")
      localStorage.removeItem("fc_username")
      localStorage.removeItem("fc_display_name")
      localStorage.removeItem("fc_pfp_url")
      window.location.reload()
    }
  }

  const handleForceClearEntry = () => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href)
      url.searchParams.set("forceClear", "true")
      window.location.href = url.toString()
    }
  }

  const handleTestNeynarFetch = async () => {
    if (auth.fid) {
      try {
        console.log("🧪 Testing Neynar fetch for FID:", auth.fid)
        const response = await fetch(`/api/neynar/user?fid=${auth.fid}`)
        const data = await response.json()
        console.log("📊 Neynar response:", data)

        if (data.users && data.users[0]) {
          console.log("✅ Real user data found:", {
            username: data.users[0].username,
            displayName: data.users[0].display_name,
            fid: data.users[0].fid,
          })
        }
      } catch (error) {
        console.error("❌ Error testing Neynar fetch:", error)
      }
    }
  }

  if (!isVisible)
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-xs z-50"
      >
        Show Debug
      </button>
    )

  return (
    <div className="fixed bottom-0 right-0 bg-black/90 border border-gray-700 p-4 rounded-tl-lg max-w-[350px] max-h-[500px] overflow-auto z-50 text-xs">
      <div className="flex justify-between mb-2">
        <h3 className="font-bold text-white">Hybrid Auth Debugger</h3>
        <button onClick={() => setIsVisible(false)} className="text-gray-400 hover:text-white">
          Hide
        </button>
      </div>

      <div className="mb-4">
        <h4 className="text-blue-400 font-bold">useHybridAuth State:</h4>
        <div className="pl-2 border-l border-blue-500 mt-1">
          <p>isLoading: {auth.isLoading ? "true" : "false"}</p>
          <p>isRefreshing: {auth.isRefreshing ? "true" : "false"}</p>
          <p>isAuthenticated: {auth.isAuthenticated ? "true" : "false"}</p>
          <p>fid: {auth.fid || "null"}</p>
          <p>username: {auth.username || "null"}</p>
          <p>displayName: {auth.displayName || "null"}</p>
          <p>followerCount: {auth.followerCount || 0}</p>
          <p>followingCount: {auth.followingCount || 0}</p>
          <p>error: {auth.error || "null"}</p>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-yellow-400 font-bold">Data Quality Check:</h4>
        <div className="pl-2 border-l border-yellow-500 mt-1">
          <p>
            Username temporary:{" "}
            {auth.username?.startsWith("user_") || auth.username?.startsWith("demo_") ? "YES" : "NO"}
          </p>
          <p>
            Has real display name:{" "}
            {auth.displayName && !auth.displayName.startsWith("User ") && !auth.displayName.startsWith("Demo ")
              ? "YES"
              : "NO"}
          </p>
          <p>Has profile picture: {auth.pfpUrl ? "YES" : "NO"}</p>
          <p>Has bio: {auth.bio ? "YES" : "NO"}</p>
          <p>Has followers: {auth.followerCount > 0 ? "YES" : "NO"}</p>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-green-400 font-bold">localStorage Data:</h4>
        <div className="pl-2 border-l border-green-500 mt-1">
          <div className="mb-2">
            <p className="text-yellow-400">hybridUser:</p>
            <pre className="text-gray-300 whitespace-pre-wrap break-all text-xs">
              {JSON.stringify(localStorageData.hybridUser, null, 2)}
            </pre>
          </div>

          <p>fc_token: {localStorageData.fc_token ? "exists" : "null"}</p>
          <p>fc_fid: {localStorageData.fc_fid || "null"}</p>
          <p>fc_username: {localStorageData.fc_username || "null"}</p>
          <p>fc_display_name: {localStorageData.fc_display_name || "null"}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <button
          onClick={handleRefreshUserData}
          disabled={auth.isRefreshing || !auth.fid}
          className="bg-blue-500 text-white px-2 py-1 rounded text-xs disabled:opacity-50"
        >
          {auth.isRefreshing ? "Refreshing..." : "Refresh from Neynar"}
        </button>

        <button
          onClick={handleTestNeynarFetch}
          disabled={!auth.fid}
          className="bg-green-500 text-white px-2 py-1 rounded text-xs disabled:opacity-50"
        >
          Test Neynar Fetch
        </button>

        <button onClick={handleClearCorruptedData} className="bg-red-500 text-white px-2 py-1 rounded text-xs">
          Clear All Data & Reload
        </button>

        <button onClick={handleForceClearEntry} className="bg-purple-500 text-white px-2 py-1 rounded text-xs">
          Force Clear Entry (?forceClear=true)
        </button>
      </div>
    </div>
  )
}
