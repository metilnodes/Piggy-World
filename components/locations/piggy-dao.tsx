"use client"

import { useAppContext } from "@/contexts/app-context"
import { Coins, ExternalLink, Vote } from "lucide-react"
import { SmartLink } from "@/components/smart-link"

export function PiggyDao() {
  const { balance } = useAppContext()

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Vote className="h-6 w-6 text-[#fd0c96]" />
        <h2 className="text-lg font-bold text-[#fd0c96]">Piggy DAO</h2>
      </div>

      {/* DAO Description */}
      <div className="text-center mb-6">
        <p className="text-sm text-gray-200">
          Join the Piggy DAO and participate in governance decisions. Vote on proposals, earn rewards, and shape the
          future of the Piggy ecosystem.
        </p>
      </div>

      {/* DAO Links */}
      <div className="flex flex-col gap-3">
        <SmartLink
          href="https://snapshot.org/#/piggydao.eth"
          className="w-full neon-button flex items-center justify-center relative"
        >
          <span className="mx-auto">GOVERNANCE</span>
          <ExternalLink className="h-4 w-4 absolute right-3" />
        </SmartLink>

        <SmartLink
          href="https://discord.gg/piggydao"
          className="w-full neon-button flex items-center justify-center relative"
        >
          <span className="mx-auto">DISCORD</span>
          <ExternalLink className="h-4 w-4 absolute right-3" />
        </SmartLink>

        <SmartLink
          href="https://forum.piggydao.com"
          className="w-full neon-button flex items-center justify-center relative"
        >
          <span className="mx-auto">FORUM</span>
          <ExternalLink className="h-4 w-4 absolute right-3" />
        </SmartLink>

        <SmartLink
          href="https://docs.piggydao.com"
          className="w-full neon-button flex items-center justify-center relative"
        >
          <span className="mx-auto">DOCUMENTATION</span>
          <ExternalLink className="h-4 w-4 absolute right-3" />
        </SmartLink>
      </div>

      {/* DAO Stats */}
      <div className="mt-4 text-center text-sm text-gray-300 space-y-3 bg-black/30 p-4 rounded-lg">
        <div className="flex items-center justify-center gap-2">
          <Coins className="h-4 w-4 text-[#fd0c96]" />
          <span className="font-bold">Your Voting Power:</span>
          <span className="text-[#fd0c96]">{balance.toLocaleString()} PIGGY</span>
        </div>

        <p className="text-xs text-gray-400">
          Participate in governance to earn additional PIGGY rewards and help shape the future of our ecosystem.
        </p>
      </div>
    </div>
  )
}
