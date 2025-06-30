"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function TipsDebugger() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [userBalance, setUserBalance] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState("misclick")
  const [isCollapsed, setIsCollapsed] = useState(true) // Свернут по умолчанию

  const checkTipsSystem = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/debug-tips")
      const data = await response.json()
      setDebugInfo(data)
    } catch (error) {
      console.error("Error checking tips system:", error)
    } finally {
      setLoading(false)
    }
  }

  const checkUserBalance = async () => {
    if (!username.trim()) {
      alert("Введите username!")
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/check-user-balance?username=${username}`)
      const data = await response.json()
      setUserBalance(data)
    } catch (error) {
      console.error("Error checking user balance:", error)
    } finally {
      setLoading(false)
    }
  }

  const checkAllUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/debug-all-users")
      const data = await response.json()
      setDebugInfo({ ...debugInfo, allUsers: data })
    } catch (error) {
      console.error("Error checking all users:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black border border-red-500 rounded-lg z-50">
      {/* Заголовок с кнопкой сворачивания */}
      <div
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-900 rounded-t-lg"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <h3 className="text-red-500 font-bold text-sm">🔍 Tips Debug</h3>
        <span className="text-red-400 text-xs">{isCollapsed ? "▼" : "▲"}</span>
      </div>

      {/* Содержимое */}
      {!isCollapsed && (
        <div className="p-4 pt-0 max-w-md max-h-96 overflow-y-auto">
          {/* Быстрая проверка misclick */}
          <div className="mb-4 p-2 border border-yellow-600 rounded">
            <h4 className="text-yellow-400 text-sm mb-2">Quick Check - misclick:</h4>
            <Button
              onClick={() => {
                setUsername("misclick")
                checkUserBalance()
              }}
              disabled={loading}
              size="sm"
              className="w-full mb-2"
            >
              Check misclick Balance
            </Button>
          </div>

          {/* Проверка любого пользователя */}
          <div className="mb-4 p-2 border border-gray-600 rounded">
            <h4 className="text-yellow-400 text-sm mb-2">Check Any User:</h4>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="w-full p-1 text-black rounded text-sm mb-2"
            />
            <Button onClick={checkUserBalance} disabled={loading} size="sm" className="w-full">
              Check Balance
            </Button>

            {userBalance && (
              <div className="mt-2 text-xs">
                <strong className="text-green-400">Result:</strong>
                <pre className="bg-gray-800 p-2 rounded mt-1 text-xs">{JSON.stringify(userBalance, null, 2)}</pre>
              </div>
            )}
          </div>

          {/* Все пользователи */}
          <Button onClick={checkAllUsers} disabled={loading} size="sm" className="w-full mb-2">
            Show All Users
          </Button>

          {/* Последние транзакции */}
          <Button onClick={checkTipsSystem} disabled={loading} size="sm" className="w-full mb-2">
            {loading ? "Loading..." : "Show Recent Tips"}
          </Button>

          {debugInfo && (
            <div className="text-xs text-white space-y-2">
              {debugInfo.allUsers && (
                <div>
                  <strong className="text-purple-400">All Users:</strong>
                  <pre className="bg-gray-800 p-2 rounded text-xs overflow-auto max-h-32">
                    {JSON.stringify(debugInfo.allUsers, null, 2)}
                  </pre>
                </div>
              )}

              {debugInfo.transactions && (
                <div>
                  <strong className="text-blue-400">Recent Tips:</strong>
                  <pre className="bg-gray-800 p-2 rounded text-xs overflow-auto max-h-32">
                    {JSON.stringify(debugInfo.transactions, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
