"use client"

import { useAppContext } from "@/contexts/app-context"
import { ImageIcon, ExternalLink, Newspaper, TrendingUp } from "lucide-react"
import { SmartLink } from "@/components/smart-link"

export function NFTHall() {
  const { balance } = useAppContext()

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Newspaper className="h-6 w-6 text-[#fd0c96]" />
        <h2 className="text-lg font-bold text-[#fd0c96]">Piggy News Network</h2>
      </div>

      {/* News Description */}
      <div className="text-center mb-6">
        <p className="text-sm text-gray-200">
          Stay updated with the latest news, trends, and developments in the Piggy ecosystem and broader crypto space.
        </p>
      </div>

      {/* Featured News */}
      <div className="bg-black/30 p-4 rounded-lg space-y-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-[#fd0c96]" />
          <span className="font-semibold text-[#fd0c96]">Latest Headlines</span>
        </div>

        <div className="space-y-2 text-sm text-gray-300">
          <div className="p-2 bg-black/20 rounded">
            <div className="font-medium text-[#fd0c96]">Piggy DAO Governance Update</div>
            <div className="text-xs text-gray-400">New proposals for ecosystem development</div>
          </div>

          <div className="p-2 bg-black/20 rounded">
            <div className="font-medium text-[#fd0c96]">Superform Integration Live</div>
            <div className="text-xs text-gray-400">Earn yields on your PIGGY tokens</div>
          </div>

          <div className="p-2 bg-black/20 rounded">
            <div className="font-medium text-[#fd0c96]">Game Zone Expansion</div>
            <div className="text-xs text-gray-400">New games and rewards coming soon</div>
          </div>
        </div>
      </div>

      {/* NFT Collection Preview */}
      <div className="bg-black/30 p-4 rounded-lg space-y-3">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-[#fd0c96]" />
          <span className="font-semibold text-[#fd0c96]">Piggy NFT Collection</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="aspect-square bg-black/20 rounded-lg flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-gray-400" />
          </div>
          <div className="aspect-square bg-black/20 rounded-lg flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-gray-400" />
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center">
          Exclusive Piggy NFTs coming soon. Holders get special privileges and rewards.
        </p>
      </div>

      {/* External Links */}
      <div className="flex flex-col gap-3">
        <SmartLink
          href="https://opensea.io/collection/piggyworld"
          className="w-full neon-button flex items-center justify-center relative"
        >
          <span className="mx-auto">OPENSEA</span>
          <ExternalLink className="h-4 w-4 absolute right-3" />
        </SmartLink>

        <SmartLink
          href="https://news.piggyworld.com"
          className="w-full neon-button flex items-center justify-center relative"
        >
          <span className="mx-auto">NEWS PORTAL</span>
          <ExternalLink className="h-4 w-4 absolute right-3" />
        </SmartLink>

        <SmartLink
          href="https://medium.com/@piggyworld"
          className="w-full neon-button flex items-center justify-center relative"
        >
          <span className="mx-auto">MEDIUM</span>
          <ExternalLink className="h-4 w-4 absolute right-3" />
        </SmartLink>

        <SmartLink
          href="https://twitter.com/piggyworldnft"
          className="w-full neon-button flex items-center justify-center relative"
        >
          <span className="mx-auto">TWITTER</span>
          <ExternalLink className="h-4 w-4 absolute right-3" />
        </SmartLink>
      </div>

      {/* Balance Display */}
      <div className="mt-4 text-center text-sm text-gray-300 space-y-2 bg-black/30 p-4 rounded-lg">
        <div className="flex items-center justify-center gap-2">
          <span className="font-bold">Your Balance:</span>
          <span className="text-[#fd0c96]">{balance.toLocaleString()} PIGGY</span>
        </div>
        <p className="text-xs text-gray-400">
          Stay engaged with the community to earn more PIGGY tokens and exclusive rewards.
        </p>
      </div>
    </div>
  )
}
