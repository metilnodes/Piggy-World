"use client"

import { useState } from "react"
import { useAppContext } from "@/contexts/app-context"
import { PiggyBankIcon, Check, Copy } from "lucide-react"
import { SmartLink } from "@/lib/external-links"

export function PiggyBank() {
  const { balance } = useAppContext()
  const [copied, setCopied] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* PIGGY DAO Button - moved above everything */}
      <div className="mt-2">
        <SmartLink
          href="https://piggydao.xyz/"
          className="w-full neon-button flex items-center justify-center relative"
        >
          <span className="mx-auto">PIGGY DAO</span>
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

      {/* HOW TO BUY $PIGGY Section */}
      <div className="mt-2">
        <h3 className="text-center font-bold text-white mb-4 flex items-center justify-center gap-2">
          <PiggyBankIcon className="h-5 w-5 text-[#fd0c96]" />
          HOW TO BUY $PIGGY
        </h3>

        <div className="flex flex-col gap-3">
          <SmartLink
            href="https://jumper.exchange/?fromChain=1&fromToken=0x0000000000000000000000000000000000000000&toChain=8453&toToken=0x0000000000000000000000000000000000000000"
            className="w-full neon-button flex items-center justify-center relative"
          >
            <span className="mx-auto">GET BASE ETH</span>
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
            href="https://app.uniswap.org/explore/tokens/base/0xe3cf8dbcbdc9b220ddead0bd6342e245daff934d"
            className="w-full neon-button flex items-center justify-center relative"
          >
            <span className="mx-auto">BUY PIGGY ON BASE</span>
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

      {/* ADVANCED ONCHAIN FINANCE Section */}
      <div className="mt-6">
        <h3 className="text-center font-bold text-white mb-4">ADVANCED ONCHAIN FINANCE</h3>

        <div className="flex flex-col gap-3">
          <SmartLink
            href="https://app.uniswap.org/explore/pools/base/0xF16EAF2801D9dEd435b7fc5F0ec78048C4142C3e"
            className="w-full neon-button flex items-center justify-center relative"
          >
            <span className="mx-auto">PROVIDE ETH/PIGGY LIQUIDITY</span>
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
            href="https://www.superform.xyz/piggy/"
            className="w-full neon-button flex items-center justify-center relative"
          >
            <span className="mx-auto">GO TO THE SLOP BUCKET</span>
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
            href="https://www.superform.xyz/vault/Ni18DxfV9gHyUIEWtjkkC/"
            className="w-full neon-button flex items-center justify-center relative"
          >
            <span className="mx-auto">DEPOSIT IN SPICY PIGGY VAULT</span>
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

      {/* Contract Address Section */}
      <div className="mt-6">
        <div
          className="bg-[#fd0c96]/10 border border-[#fd0c96]/30 rounded-lg p-3 cursor-pointer hover:bg-[#fd0c96]/20 transition-colors"
          onClick={() => copyToClipboard("0xe3CF8dBcBDC9B220ddeaD0bD6342E245DAFF934d")}
        >
          <div className="w-full mb-2">
            <code className="font-mono text-[10px] text-center block w-full break-all">
              0xe3CF8dBcBDC9B220ddeaD0bD6342E245DAFF934d
            </code>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">CA on BASE</span>
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
