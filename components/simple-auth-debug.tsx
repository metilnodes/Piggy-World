"use client"

import { useSimpleAuth } from "@/hooks/useSimpleAuth"
import { useState } from "react"

export function SimpleAuthDebug() {
  const auth = useSimpleAuth()
  const [isCollapsed, setIsCollapsed] = useState(true) // Свернут по умолчанию

  return (
    <div className="fixed top-4 right-4 bg-black border border-green-500 rounded-lg z-50">
      {/* Заголовок с кнопкой сворачивания */}
      <div
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-900 rounded-t-lg"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <h3 className="text-green-500 font-bold text-sm">🔐 Auth Debug</h3>
        <span className="text-green-400 text-xs">{isCollapsed ? "▼" : "▲"}</span>
      </div>

      {/* Содержимое */}
      {!isCollapsed && (
        <div className="p-4 pt-0 max-w-xs">
          <div className="text-xs text-white space-y-1">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${auth.isAuthenticated ? "bg-green-500" : "bg-red-500"}`} />
              <span>Status: {auth.isAuthenticated ? "Authenticated" : "Not authenticated"}</span>
            </div>

            <div>Loading: {auth.isLoading ? "Yes" : "No"}</div>
            <div>FID: {auth.fid || "None"}</div>
            <div>Username: {auth.username || "None"}</div>
            <div>Display Name: {auth.displayName || "None"}</div>

            {auth.error && (
              <div className="text-red-400 mt-2">
                <div className="font-semibold">Error:</div>
                <div className="text-xs">{auth.error}</div>
              </div>
            )}
          </div>

          {auth.setManualFid && (
            <div className="mt-3 pt-2 border-t border-gray-600">
              <button
                onClick={() => {
                  const fid = prompt("Enter FID:")
                  if (fid) auth.setManualFid(fid)
                }}
                className="w-full px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded"
              >
                Set Manual FID
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
