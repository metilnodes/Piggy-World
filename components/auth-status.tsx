"use client"

import { useSimpleAuth } from "@/hooks/useSimpleAuth"
import { useState } from "react"

export function AuthStatus() {
  const auth = useSimpleAuth()
  const [fidInput, setFidInput] = useState("")
  const [showInput, setShowInput] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false) // Развернут по умолчанию

  if (!auth.isAuthenticated) return null

  const isRealUser = auth.fid && !auth.fid.startsWith("demo_") && !auth.fid.startsWith("guest_")

  const handleSetFid = () => {
    if (fidInput.trim()) {
      auth.setManualFid(fidInput.trim())
      setShowInput(false)
      setFidInput("")
    }
  }

  return (
    <div className="fixed top-4 left-4 bg-black bg-opacity-90 text-white rounded-lg text-xs z-50">
      {/* Заголовок с кнопкой сворачивания */}
      <div
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-900 rounded-t-lg"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isRealUser ? "bg-green-500" : "bg-yellow-500"}`} />
          <span className="font-semibold">{isRealUser ? "Real User" : "Demo/Guest"}</span>
        </div>
        <span className="text-gray-400 text-xs">{isCollapsed ? "▼" : "▲"}</span>
      </div>

      {/* Содержимое */}
      {!isCollapsed && (
        <div className="px-3 pb-3">
          <div className="space-y-1 text-xs mb-2">
            <div>FID: {auth.fid}</div>
            <div>User: {auth.username}</div>
            {auth.displayName && <div>Name: {auth.displayName}</div>}
          </div>

          {!isRealUser && (
            <div className="pt-2 border-t border-gray-600">
              {!showInput ? (
                <button
                  onClick={() => setShowInput(true)}
                  className="text-blue-400 hover:text-blue-300 text-xs underline"
                >
                  Set Real FID
                </button>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Enter your FID"
                    value={fidInput}
                    onChange={(e) => setFidInput(e.target.value)}
                    className="w-full px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded"
                  />
                  <div className="flex gap-1">
                    <button onClick={handleSetFid} className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded">
                      Set
                    </button>
                    <button
                      onClick={() => setShowInput(false)}
                      className="px-2 py-1 text-xs bg-gray-600 hover:bg-gray-700 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
