"use client"

import { useState } from "react"

export function NeynarDebug() {
  const [testResult, setTestResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [fidInput, setFidInput] = useState("")
  const [isCollapsed, setIsCollapsed] = useState(true) // Свернут по умолчанию

  const testNeynar = async (fid?: string) => {
    setLoading(true)
    try {
      const testFid = fid || "3" // Default to dwr.eth
      const response = await fetch(`/api/neynar/user?fid=${testFid}`)
      const data = await response.json()
      setTestResult({ fid: testFid, data })
    } catch (error) {
      console.error("Neynar test error:", error)
      setTestResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const testMyFid = async () => {
    if (!fidInput.trim()) {
      alert("Enter FID first!")
      return
    }
    await testNeynar(fidInput)
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black border border-blue-500 rounded-lg z-50">
      {/* Заголовок с кнопкой сворачивания */}
      <div
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-900 rounded-t-lg"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <h3 className="text-blue-500 font-bold text-sm">🔗 Neynar Debug</h3>
        <span className="text-blue-400 text-xs">{isCollapsed ? "▼" : "▲"}</span>
      </div>

      {/* Содержимое */}
      {!isCollapsed && (
        <div className="p-4 pt-0 max-w-sm">
          <div className="space-y-2 mb-4">
            <button
              onClick={() => testNeynar("3")}
              disabled={loading}
              className="w-full px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded disabled:opacity-50"
            >
              Test FID 3 (dwr.eth)
            </button>

            <div className="flex gap-2">
              <input
                type="text"
                value={fidInput}
                onChange={(e) => setFidInput(e.target.value)}
                placeholder="Enter FID"
                className="flex-1 px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded text-white"
              />
              <button
                onClick={testMyFid}
                disabled={loading}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded disabled:opacity-50"
              >
                Test
              </button>
            </div>
          </div>

          {loading && <div className="text-center text-blue-400 text-xs">Loading...</div>}

          {testResult && (
            <div className="text-xs">
              <div className="text-green-400 font-semibold mb-1">Result:</div>
              <pre className="bg-gray-800 p-2 rounded text-xs overflow-auto max-h-40 text-white">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
