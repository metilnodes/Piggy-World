"use client"

import { useState } from "react"
import { useHybridAuth } from "@/hooks/useHybridAuth"

export function AuthTestPanel() {
  const [isVisible, setIsVisible] = useState(false)
  const auth = useHybridAuth()

  // Функция для симуляции guest данных
  const simulateGuestData = () => {
    if (typeof window !== "undefined") {
      const guestData = {
        fid: "12345",
        username: "guest123",
        displayName: "guest123",
        pfp: null,
      }

      localStorage.setItem("hybridUser", JSON.stringify(guestData))
      localStorage.setItem("fc_fid", "12345")
      localStorage.setItem("fc_username", "guest123")
      localStorage.setItem("fc_display_name", "guest123")

      console.log("🧪 Simulated guest data:", guestData)
      window.location.reload()
    }
  }

  // Функция для симуляции user_ данных
  const simulateUserData = () => {
    if (typeof window !== "undefined") {
      const userData = {
        fid: "67890",
        username: "user_67890",
        displayName: "user_67890",
        pfp: null,
      }

      localStorage.setItem("hybridUser", JSON.stringify(userData))
      localStorage.setItem("fc_fid", "67890")
      localStorage.setItem("fc_username", "user_67890")
      localStorage.setItem("fc_display_name", "user_67890")

      console.log("🧪 Simulated user_ data:", userData)
      window.location.reload()
    }
  }

  // Функция для симуляции хороших данных
  const simulateGoodData = () => {
    if (typeof window !== "undefined") {
      const goodData = {
        fid: "11111",
        username: "realuser",
        displayName: "Real User",
        pfp: "https://example.com/avatar.jpg",
      }

      localStorage.setItem("hybridUser", JSON.stringify(goodData))
      localStorage.setItem("fc_fid", "11111")
      localStorage.setItem("fc_username", "realuser")
      localStorage.setItem("fc_display_name", "Real User")
      localStorage.setItem("fc_pfp_url", "https://example.com/avatar.jpg")

      console.log("🧪 Simulated good data:", goodData)
      window.location.reload()
    }
  }

  // Функция для тестирования ?forceClear=true
  const testForceClear = () => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href)
      url.searchParams.set("forceClear", "true")
      window.location.href = url.toString()
    }
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs z-50"
      >
        Test Panel
      </button>
    )
  }

  return (
    <div className="fixed bottom-0 left-0 bg-black/90 border border-green-700 p-4 rounded-tr-lg max-w-[300px] z-50 text-xs">
      <div className="flex justify-between mb-2">
        <h3 className="font-bold text-green-400">Auth Test Panel</h3>
        <button onClick={() => setIsVisible(false)} className="text-gray-400 hover:text-white">
          Hide
        </button>
      </div>

      <div className="mb-4">
        <h4 className="text-green-400 font-bold mb-2">Current State:</h4>
        <div className="pl-2 border-l border-green-500 mt-1 space-y-1">
          <p>FID: {auth.hybridUser?.fid || "null"}</p>
          <p>Username: {auth.hybridUser?.username || "null"}</p>
          <p>Display: {auth.hybridUser?.displayName || "null"}</p>
          <p>PFP: {auth.hybridUser?.pfp ? "Yes" : "No"}</p>
          <p>Loading: {auth.isLoading ? "Yes" : "No"}</p>
          <p>SDK Ready: {auth.isSDKReady ? "Yes" : "No"}</p>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-yellow-400 font-bold mb-2">Quality Check:</h4>
        <div className="pl-2 border-l border-yellow-500 mt-1 space-y-1">
          <p className={auth.hybridUser?.username?.startsWith("guest") ? "text-red-400" : "text-green-400"}>
            Guest: {auth.hybridUser?.username?.startsWith("guest") ? "YES" : "NO"}
          </p>
          <p className={auth.hybridUser?.username?.startsWith("user_") ? "text-red-400" : "text-green-400"}>
            Temp: {auth.hybridUser?.username?.startsWith("user_") ? "YES" : "NO"}
          </p>
          <p className={auth.hybridUser?.username?.startsWith("demo_") ? "text-red-400" : "text-green-400"}>
            Demo: {auth.hybridUser?.username?.startsWith("demo_") ? "YES" : "NO"}
          </p>
          <p
            className={
              auth.hybridUser?.displayName && auth.hybridUser?.displayName !== auth.hybridUser?.username
                ? "text-green-400"
                : "text-red-400"
            }
          >
            Real Display:{" "}
            {auth.hybridUser?.displayName && auth.hybridUser?.displayName !== auth.hybridUser?.username ? "YES" : "NO"}
          </p>
          <p className={auth.hybridUser?.pfp ? "text-green-400" : "text-yellow-400"}>
            Has PFP: {auth.hybridUser?.pfp ? "YES" : "NO"}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-blue-400 font-bold">Test Scenarios:</h4>

        <button
          onClick={simulateGuestData}
          className="w-full bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
        >
          Simulate guest123 Data
        </button>

        <button
          onClick={simulateUserData}
          className="w-full bg-orange-600 text-white px-2 py-1 rounded text-xs hover:bg-orange-700"
        >
          Simulate user_67890 Data
        </button>

        <button
          onClick={simulateGoodData}
          className="w-full bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
        >
          Simulate Good Data
        </button>

        <button
          onClick={async () => {
            if (auth.hybridUser?.fid) {
              console.log("🧪 Testing Neynar fetch for FID:", auth.hybridUser.fid)
              await auth.refreshUserData()
            } else {
              console.log("🧪 No FID available for Neynar test")
            }
          }}
          disabled={!auth.hybridUser?.fid}
          className="w-full bg-cyan-600 text-white px-2 py-1 rounded text-xs hover:bg-cyan-700 disabled:opacity-50"
        >
          Test Neynar Fetch
        </button>

        <button
          onClick={testForceClear}
          className="w-full bg-purple-600 text-white px-2 py-1 rounded text-xs hover:bg-purple-700"
        >
          Test ?forceClear=true
        </button>

        <button
          onClick={() => auth.refreshUserData()}
          disabled={auth.isLoading || !auth.hybridUser?.fid}
          className="w-full bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 disabled:opacity-50"
        >
          Refresh from Neynar
        </button>
      </div>

      <div className="mt-4 text-xs text-gray-400">
        <p>💡 Tips:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>Red scenarios should auto-fix</li>
          <li>Watch console for logs</li>
          <li>Check localStorage changes</li>
        </ul>
      </div>
    </div>
  )
}
