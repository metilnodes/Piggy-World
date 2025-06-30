"use client"

import { useAppContext } from "@/contexts/app-context"
import { Sparkles, ExternalLink } from "lucide-react"
import { openExternalLink } from "@/lib/external-links"

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
          Superform is the on-chain app earning top crypto returns. Auto-optimize with SuperVaults or build a portfolio
          from 800+ opportunities.
        </p>
      </div>

      {/* Superform Links */}
      <div className="flex flex-col gap-3">
        <button
          onClick={() => openExternalLink("https://www.superform.xyz/explore/")}
          className="w-full neon-button flex items-center justify-center relative"
        >
          <span className="mx-auto">START EARN</span>
          <ExternalLink className="h-4 w-4 absolute right-3" />
        </button>

        <button
          onClick={() => openExternalLink("https://www.superform.xyz/protocols/")}
          className="w-full neon-button flex items-center justify-center relative"
        >
          <span className="mx-auto">PROTOCOLS</span>
          <ExternalLink className="h-4 w-4 absolute right-3" />
        </button>

        <button
          onClick={() => openExternalLink("https://www.superform.xyz/vaults/")}
          className="w-full neon-button flex items-center justify-center relative"
        >
          <span className="mx-auto">VAULTS</span>
          <ExternalLink className="h-4 w-4 absolute right-3" />
        </button>

        <button
          onClick={() => openExternalLink("https://rewards.superform.xyz/")}
          className="w-full neon-button flex items-center justify-center relative"
        >
          <span className="mx-auto">REWARDS PROGRAM</span>
          <ExternalLink className="h-4 w-4 absolute right-3" />
        </button>
      </div>

      {/* Token Information */}
      <div className="mt-4 text-center text-sm text-gray-300 space-y-3 bg-black/30 p-4 rounded-lg">
        <p>
          <span className="font-bold">$UP</span> has been announced by the Superform Foundation but is not live yet.
        </p>

        <p>The Superform Foundation will determine the launch date. Superform Labs has no control over this.</p>
      </div>
    </div>
  )
}
