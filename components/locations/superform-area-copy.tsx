"use client"

import { useAppContext } from "@/contexts/app-context"
import { Sparkles, ExternalLink } from "lucide-react"

export function SuperformArea() {
  const { balance } = useAppContext()

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-6 w-6 text-[#fd0c96]" />
        <h2 className="text-lg font-bold text-[#fd0c96]">What is Superform?</h2>
      </div>

      {/* Superform Protocol Description */}
      <div className="text-center mb-6">
        <p className="text-sm text-gray-200">
          Superform is the onchain wealth app. Superform earns you the best returns on your crypto to grow your onchain
          wealth. Use SuperVaults to automatically optimize your earnings, or build your customized portfolio by
          directly depositing into over 800 earning opportunities.
        </p>
      </div>

      {/* Superform Links */}
      <div className="flex flex-col gap-3">
        <a href="https://www.superform.xyz/explore/" target="_blank" rel="noopener noreferrer">
          <button className="w-full neon-button flex items-center justify-center relative">
            <span className="mx-auto">START EARN</span>
            <ExternalLink className="h-4 w-4 absolute right-3" />
          </button>
        </a>

        <a href="https://www.superform.xyz/protocols/" target="_blank" rel="noopener noreferrer">
          <button className="w-full neon-button flex items-center justify-center relative">
            <span className="mx-auto">PROTOCOLS</span>
            <ExternalLink className="h-4 w-4 absolute right-3" />
          </button>
        </a>

        <a href="https://www.superform.xyz/vaults/" target="_blank" rel="noopener noreferrer">
          <button className="w-full neon-button flex items-center justify-center relative">
            <span className="mx-auto">VAULTS</span>
            <ExternalLink className="h-4 w-4 absolute right-3" />
          </button>
        </a>

        <a href="https://rewards.superform.xyz/" target="_blank" rel="noopener noreferrer">
          <button className="w-full neon-button flex items-center justify-center relative">
            <span className="mx-auto">REWARDS</span>
            <ExternalLink className="h-4 w-4 absolute right-3" />
          </button>
        </a>
      </div>

      {/* Token Information */}
      <div className="mt-4 text-center text-sm text-gray-300 space-y-3 bg-black/30 p-4 rounded-lg">
        <p>
          <span className="font-bold">$UP</span> has been announced by the Superform Foundation but is not live yet.
        </p>
        <p className="font-bold">Wen $UP token?</p>
        <p>The Superform Foundation will determine the launch date. Superform Labs has no control over this.</p>
      </div>
    </div>
  )
}
