"use client"

import { useState } from "react"
import { useAppContext } from "@/contexts/app-context"
import { Check, Copy } from "lucide-react"
import { useTreasuryStats } from "@/hooks/useTreasuryStats"
import { SmartLink } from "@/lib/external-links"

export function PiggyDao() {
  const { balance } = useAppContext()
  const [copied, setCopied] = useState(false)
  const stats = useTreasuryStats()

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Format current time
  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })

  return (
    <div className="space-y-6">
      {/* HOW TO BUY $PIGGY Section */}
      <div className="mt-2">
        <h3 className="text-center font-bold text-white mb-4 flex items-center justify-center gap-2">
          PiggyDAO is the community treasury for PIGGY AI, the DeFAI yield agent
        </h3>

        <div className="flex flex-col gap-3">
          <SmartLink
            href="https://piggydao.xyz/"
            className="w-full neon-button flex items-center justify-center relative"
          >
            <span className="mx-auto">Donate to the treasury</span>
            <svg className="h-4 w-4 absolute right-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </SmartLink>

          <SmartLink
            href="https://snapshot.box/#/s:basedpiggy.eth"
            className="w-full neon-button flex items-center justify-center relative"
          >
            <span className="mx-auto">Vote on proposals</span>
            <svg className="h-4 w-4 absolute right-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </SmartLink>
        </div>
      </div>

      {/* TREASURY STATS Section */}
      <div className="mt-6">
        <div className="bg-black/50 border border-[#fd0c96]/30 rounded-lg p-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[#fd0c96] font-bold text-sm">TREASURY STATS</h3>
            <span className="text-gray-400 text-xs font-mono">{currentTime}</span>
          </div>

          {/* Loading State */}
          {stats.loading && (
            <div className="text-center py-4">
              <div className="text-gray-400 text-sm">Loading treasury data...</div>
            </div>
          )}

          {/* Error State */}
          {stats.error && (
            <div className="text-center py-4">
              <div className="text-red-400 text-sm">Error: {stats.error}</div>
            </div>
          )}

          {/* Stats Grid */}
          {!stats.loading && !stats.error && (
            <>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">⠀$</span>
                    <span className="text-gray-300 text-sm">Total Treasury Value</span>
                  </div>
                  <span className="text-green-500 font-mono">${stats.totalValue.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500">🪙</span>
                    <span className="text-gray-300 text-sm">Unique Tokens</span>
                  </div>
                  <span className="text-yellow-500 font-mono">{stats.uniqueTokens}</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-500">📋</span>
                    <span className="text-gray-300 text-sm">Total Proposals</span>
                  </div>
                  <span className="text-blue-500 font-mono">{stats.proposals}</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-[#fd0c96]">👥</span>
                    <span className="text-gray-300 text-sm">Snapshot Members</span>
                  </div>
                  <span className="text-[#fd0c96] font-mono">{stats.members}</span>
                </div>
              </div>

              {/* Asset Breakdown */}
              <div className="border-t border-gray-700 pt-3">
                <h4 className="text-gray-400 text-xs font-bold mb-3">ASSET BREAKDOWN</h4>

                <div className="space-y-2">
                  {stats.breakdown.map((asset, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <img
                          src={asset.iconUrl || "/placeholder.svg"}
                          alt={asset.name}
                          className="w-4 h-4 rounded-full"
                        />
                        <span className="text-gray-300 text-sm">{asset.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-mono text-sm">{asset.formattedBalance}</div>
                        <div className="text-gray-400 text-xs">(${asset.value.toFixed(2)})</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Contract Address Section */}
      <div className="mt-6">
        <div
          className="bg-[#fd0c96]/10 border border-[#fd0c96]/30 rounded-lg p-3 cursor-pointer hover:bg-[#fd0c96]/20 transition-colors"
          onClick={() => copyToClipboard("0x3076a0c4f44f1ec229c850380f3dd970094ca873")}
        >
          <div className="w-full mb-2">
            <code className="font-mono text-[10px] text-center block w-full break-all">
              0x3076a0c4f44f1ec229c850380f3dd970094ca873
            </code>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">CA DAO Treasury</span>
            <div className="flex items-center gap-1">
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-500">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3 text-[#fd0c96]" />
                  <span className="text-xs text-[#fd0c96]">Click to copy</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
