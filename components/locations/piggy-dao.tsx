"use client"

import type React from "react"

import { useState } from "react"
import { useAppContext } from "@/contexts/app-context"
import { Check, Copy, ArrowLeft, ChevronRight, Upload, Download } from "lucide-react"
import { useTreasuryStats } from "@/hooks/useTreasuryStats"
import { SmartLink } from "@/components/smart-link"

export function PiggyDao() {
  const { balance } = useAppContext()
  const [copied, setCopied] = useState(false)
  const stats = useTreasuryStats()
  const [selectedSection, setSelectedSection] = useState<string | null>(null)

  const [firstName, setFirstName] = useState("")
  const [serName, setSerName] = useState("")
  const [passportNumber, setPassportNumber] = useState("")
  const [agentPhoto, setAgentPhoto] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSelectSection = (sectionId: string) => {
    setSelectedSection(sectionId)
  }

  const handleBackToMain = () => {
    setSelectedSection(null)
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setAgentPhoto(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleMintNFT = () => {
    // TODO: Implement NFT minting logic
    console.log("Minting NFT with:", { firstName, serName, passportNumber, agentPhoto })
  }

  // Format current time
  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })

  if (selectedSection === "mint-piggy-id") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handleBackToMain}
            className="flex items-center text-[#fd0c96] hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Back to Piggy Dao</span>
          </button>
        </div>

        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#fd0c96] mb-2">PIGGY ID</h1>
            <p className="text-gray-400 text-sm">OINKGENERATOR</p>
            <p className="text-white font-bold mt-4">AGENT REGISTRATION</p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div className="text-[#fd0c96] text-sm font-bold mb-4">&gt; INITIALIZE YOUR PIGGY ID</div>

            {/* First Name */}
            <div>
              <label className="block text-[#fd0c96] text-sm font-bold mb-2">&gt; FIRST NAME</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value.slice(0, 12))}
                maxLength={12}
                className="w-full bg-black/50 border border-[#fd0c96]/30 rounded-lg p-3 text-white focus:border-[#fd0c96] focus:outline-none"
                placeholder="Enter first name"
              />
              <div className="text-gray-400 text-xs mt-1">{firstName.length}/12 CHARACTERS</div>
            </div>

            {/* Ser Name */}
            <div>
              <label className="block text-[#fd0c96] text-sm font-bold mb-2">&gt; SER-NAME</label>
              <input
                type="text"
                value={serName}
                onChange={(e) => setSerName(e.target.value.slice(0, 12))}
                maxLength={12}
                className="w-full bg-black/50 border border-[#fd0c96]/30 rounded-lg p-3 text-white focus:border-[#fd0c96] focus:outline-none"
                placeholder="Enter ser-name"
              />
              <div className="text-gray-400 text-xs mt-1">{serName.length}/12 CHARACTERS</div>
            </div>

            {/* Passport Number */}
            <div>
              <label className="block text-[#fd0c96] text-sm font-bold mb-2">&gt; PASSPORT NUMBER</label>
              <input
                type="text"
                value={passportNumber}
                onChange={(e) => setPassportNumber(e.target.value.slice(0, 7))}
                maxLength={7}
                className="w-full bg-black/50 border border-[#fd0c96]/30 rounded-lg p-3 text-white focus:border-[#fd0c96] focus:outline-none"
                placeholder="Enter passport number"
              />
              <div className="text-gray-400 text-xs mt-1">{passportNumber.length}/7 CHARACTERS</div>
            </div>

            {/* Agent Photo */}
            <div>
              <label className="block text-[#fd0c96] text-sm font-bold mb-2">&gt; AGENT PHOTO</label>
              <div className="relative">
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" id="photo-upload" />
                <label
                  htmlFor="photo-upload"
                  className="w-full bg-black/50 border border-[#fd0c96]/30 rounded-lg p-3 text-white hover:border-[#fd0c96] cursor-pointer flex items-center justify-center gap-2 transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  {agentPhoto ? agentPhoto.name : "UPLOAD PHOTO"}
                </label>
              </div>
            </div>

            {/* Mint Button */}
            <button
              onClick={handleMintNFT}
              disabled={!firstName || !serName || !passportNumber || !agentPhoto}
              className="w-full bg-[#fd0c96] hover:bg-[#fd0c96]/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Download className="h-4 w-4" />
              MINT AS NFT
            </button>

            {/* Live Preview */}
            <div className="mt-6">
              <h3 className="text-[#fd0c96] text-sm font-bold mb-4">LIVE PREVIEW</h3>
              <div className="bg-black/50 border border-[#fd0c96]/30 rounded-lg p-4">
                {firstName || serName || passportNumber || previewUrl ? (
                  <div className="space-y-2">
                    {previewUrl && (
                      <div className="flex justify-center mb-4">
                        <img
                          src={previewUrl || "/placeholder.svg"}
                          alt="Agent Photo"
                          className="w-24 h-24 rounded-lg object-cover border border-[#fd0c96]/30"
                        />
                      </div>
                    )}
                    <div className="text-center space-y-1">
                      <div className="text-white font-bold">
                        {firstName} {serName}
                      </div>
                      <div className="text-gray-400 text-sm">ID: {passportNumber}</div>
                      <div className="text-[#fd0c96] text-xs">PIGGY AGENT</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-[#fd0c96] text-sm font-bold mb-2">&gt; PIGGY ID LOADING... STANDBY</div>
                    <div className="text-gray-400 text-xs">&gt; ENTER YOUR NAME TO SPAWN OINKDENTITY</div>
                  </div>
                )}
              </div>
            </div>

            {/* Check ID Collection */}
            <SmartLink
              href="https://opensea.io/collection/piggy-id"
              className="w-full neon-button flex items-center justify-center relative mt-4"
            >
              <span className="mx-auto">CHECK ID COLLECTION</span>
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
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3">
        <button
          onClick={() => handleSelectSection("mint-piggy-id")}
          className="bg-black/50 border border-[#fd0c96] rounded-lg p-3 cursor-pointer transition-all duration-300 hover:bg-[#fd0c96]/10 hover:border-[#fd0c96]/80"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-lg bg-black/30 flex items-center justify-center mr-3 flex-shrink-0 border border-[#fd0c96]/30">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/favicon-GwI8vCLZp7Q8oZIm5bMTtBgA6v1fv0.png"
                alt="Mint Piggy ID"
                className="w-8 h-8 object-contain"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white">Mint Piggy ID</h3>
              <p className="text-xs text-gray-300">OINKGENERATOR</p>
            </div>
            <ChevronRight className="h-5 w-5 text-[#fd0c96]" />
          </div>
        </button>
      </div>

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
