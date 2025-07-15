"use client"

import { useState } from "react"
import { useAppContext } from "@/contexts/app-context"
import { Gamepad2, Trophy, ExternalLink } from "lucide-react"
import { openExternalLink } from "@/lib/external-links"

const games = [
  {
    id: "superform-safari",
    name: "Superform Safari",
    description: "Collect piggies and earn XP",
    externalUrl: "https://superformsafari.v0.build",
  },
  {
    id: "piggy-catch",
    name: "Piggy Catch",
    description: "Dodge bombs, catch fruits",
    externalUrl: "https://guileless-rabanadas-18f47d.netlify.app/",
  },
  {
    id: "piggy-jump",
    name: "Piggy Jump",
    description: "Jump across platforms",
    externalUrl: "https://extraordinary-rugelach-42fd3b.netlify.app/",
  },
  {
    id: "flappy-piggy",
    name: "Flappy Piggy",
    description: "Navigate through obstacles",
    externalUrl: "https://noctis-requiem.itch.io/flappy-piggy",
    isNew: true,
  },
  {
    id: "piggy-stars",
    name: "Piggy to the Stars",
    description: "Help piggy reach the stars",
    externalUrl: "https://noctis-requiem.itch.io/piggy-to-the-stars",
    isNew: true,
  },
  {
    id: "2048",
    name: "Super2048",
    description: "Help piggy collect 2048",
    externalUrl: "https://superform2048.vercel.app/",
    isNew: true,
  },
  {
    id: "piggy-typing",
    name: "Piggy Typing...",
    description: "Test your typing skills",
    externalUrl: "https://superform-typing-game.vercel.app/",
    isNew: true,
  },
  {
    id: "piggy-dao",
    name: "PIGGY DAO",
    description: "Community Treasury & Governance",
    externalUrl: "https://piggydao.xyz",
    isNew: true,
  },
]

export function GameZone() {
  const { balance } = useAppContext()
  const [selectedGame, setSelectedGame] = useState<string | null>(null)

  const selectedGameData = games.find((g) => g.id === selectedGame)

  // Handler for Play button
  const handlePlayGame = (gameId: string) => {
    setSelectedGame(gameId)
  }

  // Handler for Back button
  const handleBackToList = () => {
    setSelectedGame(null)
  }

  return (
    <div
      className="space-y-3 relative"
      style={{
        backgroundImage: "url('/background-grid.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Content */}
      <div className="relative z-10 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Gamepad2 className="h-6 w-6 text-[#fd0c96]" />
          <h2 className="text-base font-bold text-[#fd0c96]">Porkade (Community games)</h2>
        </div>

        {!selectedGame ? (
          <div className="grid gap-2 max-h-[700px] overflow-y-auto pr-2">
            {games.map((game) => (
              <div
                key={game.id}
                className="bg-black/70 border border-[#fd0c96]/30 hover:border-[#fd0c96] rounded-lg cursor-pointer transition-colors"
                onClick={() => handlePlayGame(game.id)}
              >
                <div className="p-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-sm text-white">{game.name}</h3>
                      {game.isNew && (
                        <span className="bg-[#fd0c96] text-white text-xs px-1.5 py-0.5 rounded-full">NEW</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">{game.description}</p>
                  </div>
                  <button
                    className="neon-button py-1 px-3 text-xs"
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePlayGame(game.id)
                    }}
                  >
                    Play
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-black/70 border border-[#fd0c96]/30 rounded-lg">
            <div className="p-3">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-white">{selectedGameData?.name}</h3>
                <button
                  className="border-[#fd0c96]/50 text-[#fd0c96] hover:bg-[#fd0c96]/10 border rounded-md px-2 py-1 text-xs"
                  onClick={handleBackToList}
                >
                  Back
                </button>
              </div>

              {selectedGameData?.externalUrl ? (
                <>
                  <div className="aspect-[16/9] bg-[#fd0c96]/10 rounded-lg flex flex-col items-center justify-center mb-3 p-4">
                    <div className="text-center mb-4">
                      <Trophy className="h-12 w-12 text-[#fd0c96]/50 mx-auto mb-2" />
                      <h4 className="text-white font-bold mb-1">{selectedGameData.name}</h4>
                      <p className="text-sm text-gray-300 mb-2">Click to open game in your browser</p>
                    </div>

                    <div className="flex gap-2">
                      <a
                        href={selectedGameData.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="neon-button py-1 px-3 text-sm"
                      >
                        Launch Game
                      </a>
                      <button
                        onClick={() => openExternalLink(selectedGameData.externalUrl)}
                        className="border-[#fd0c96]/50 text-[#fd0c96] hover:bg-[#fd0c96]/10 border rounded-md px-3 py-1 text-sm flex items-center"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Open in Browser
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#fd0c96]/5 border border-[#fd0c96]/20 rounded-lg p-3 text-xs text-gray-400">
                    <p className="mb-2">
                      <strong className="text-white">Note:</strong> Games open in your device's browser:
                    </p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Opens in Safari, Chrome, or your default browser</li>
                      <li>On mobile, may use deeplinks for better integration</li>
                      <li>Return to Farcaster when done playing</li>
                      <li>Game progress is automatically saved</li>
                    </ul>
                  </div>
                </>
              ) : (
                <>
                  <div className="aspect-video bg-[#fd0c96]/10 rounded-lg flex items-center justify-center mb-3">
                    <div className="text-center">
                      <Trophy className="h-8 w-8 text-[#fd0c96]/50 mx-auto mb-1" />
                      <p className="text-xs text-gray-400">Here will be the game {selectedGameData?.name}</p>
                    </div>
                  </div>

                  <button className="w-full neon-button py-1 px-3 text-sm">Start game</button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
