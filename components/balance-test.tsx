"use client"

import { useBalance } from "@/contexts/balance-context"
import { useEffect, useState } from "react"

export function BalanceTest() {
  const { balance, isLoading, error, fetchBalance, updateBalance, addToBalance, subtractFromBalance } = useBalance()
  const [testAmount, setTestAmount] = useState(10)

  useEffect(() => {
    console.log("🧪 BalanceTest: Component mounted")
  }, [])

  return (
    <div className="p-4 bg-gray-900 text-white rounded-lg space-y-4">
      <h2 className="text-xl font-bold text-[#fd0c96]">🧪 Balance Test Panel</h2>

      <div className="space-y-2">
        <p>
          <strong>Balance:</strong> {isLoading ? "Loading..." : balance}
        </p>
        <p>
          <strong>Loading:</strong> {isLoading ? "Yes" : "No"}
        </p>
        <p>
          <strong>Error:</strong> {error || "None"}
        </p>
      </div>

      <div className="space-y-2">
        <input
          type="number"
          value={testAmount}
          onChange={(e) => setTestAmount(Number(e.target.value))}
          className="px-3 py-1 bg-gray-800 border border-gray-600 rounded text-white"
          placeholder="Test amount"
        />

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={fetchBalance}
            disabled={isLoading}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded text-sm"
          >
            Fetch Balance
          </button>

          <button
            onClick={() => updateBalance(testAmount)}
            disabled={isLoading}
            className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded text-sm"
          >
            Set Balance to {testAmount}
          </button>

          <button
            onClick={() => addToBalance(testAmount)}
            disabled={isLoading}
            className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 rounded text-sm"
          >
            Add {testAmount}
          </button>

          <button
            onClick={() => subtractFromBalance(testAmount)}
            disabled={isLoading}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded text-sm"
          >
            Subtract {testAmount}
          </button>
        </div>
      </div>

      <div className="text-xs text-gray-400">
        <p>Use this panel to test balance operations.</p>
        <p>Check browser console for detailed logs.</p>
      </div>
    </div>
  )
}
