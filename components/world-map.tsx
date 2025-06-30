"use client"

import type React from "react"

import { useState } from "react"
import { useAppContext } from "@/contexts/app-context"
import { Modal } from "./modal"
import { PiggyAI } from "./locations/piggy-ai"
import { PiggyBank } from "./locations/piggy-bank"
import { Casino } from "./locations/casino"
import { NFTHall } from "./locations/nft-hall"
import { SuperformArea } from "./locations/superform-area"
import { OinkOink } from "./locations/oink-oink"
import { GameZone } from "./locations/game-zone"
import { useHybridAuth } from "@/hooks/useHybridAuth"
import { useBalanceSync } from "@/hooks/useBalanceSync"
import { PiggyDao } from "./locations/piggy-dao"

export function WorldMap() {
  const { balance, activeLocation, openLocation, closeLocation } = useAppContext()
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null)
  const auth = useHybridAuth()

  // Добавляем синхронизацию баланса
  useBalanceSync()

  // Map location names to their components
  const locationComponents: Record<string, React.ReactNode> = {
    "piggy-ai": <PiggyAI />,
    "piggy-bank": <PiggyBank />,
    "piggy-dao": <PiggyDao />,
    casino: <Casino />,
    "nft-hall": <NFTHall />,
    "superform-area": <SuperformArea />,
    "oink-oink": <OinkOink />,
    "game-zone": <GameZone />,
  }

  // Map location names to their titles
  const locationTitles: Record<string, string> = {
    "piggy-ai": "Piggy AI",
    "piggy-bank": "Piggy Bank",
    "piggy-dao": "Piggy Dao",
    casino: "Casino",
    "nft-hall": "Piggy News Network",
    "superform-area": "Superform Area",
    "oink-oink": "Oink-Oink",
    "game-zone": "Game Zone",
  }

  // Get modal dimensions based on location
  const getModalDimensions = (location: string) => {
    switch (location) {
      case "piggy-ai":
        return { width: "350px", height: "620px" }
      case "piggy-bank":
        return { width: "380px", height: "580px" }
      case "oink-oink":
        return { width: "350px", height: "700px" }
      case "superform-area":
        return { width: "350px", height: "620px" }
      default:
        return { width: "350px", height: "580px" }
    }
  }

  // Функция для получения имени пользователя для Oink-Oink
  const getUsernameForOinkOink = () => {
    if (auth.username) {
      console.log("Using username from hybrid auth:", auth.username)
      return auth.username
    }

    console.log("No username available")
    return null
  }

  return (
    <div className="relative w-full h-full">
      {/* Locations */}
      <div className="w-full h-full relative">
        {/* Piggy AI */}
        <div
          className="absolute cursor-pointer transition-transform duration-300 hover:scale-110"
          style={{ left: "19px", top: "90px" }}
          onClick={() => openLocation("piggy-ai")}
          onMouseEnter={() => setHoveredLocation("piggy-ai")}
          onMouseLeave={() => setHoveredLocation(null)}
        >
          <img
            src="/images/piggy-ai.png"
            alt="Piggy AI"
            style={{ width: "120px", height: "120px" }}
            className={`object-contain ${hoveredLocation === "piggy-ai" ? "filter drop-shadow-[0_0_8px_#fd0c96]" : ""}`}
          />
        </div>

        {/* Piggy Bank */}
        <div
          className="absolute cursor-pointer transition-transform duration-300 hover:scale-110"
          style={{ left: "133px", top: "224px" }}
          onClick={() => openLocation("piggy-bank")}
          onMouseEnter={() => setHoveredLocation("piggy-bank")}
          onMouseLeave={() => setHoveredLocation(null)}
        >
          <img
            src="/images/piggy-bank.png"
            alt="Piggy Bank"
            style={{ width: "138px", height: "138px" }}
            className={`object-contain ${hoveredLocation === "piggy-bank" ? "filter drop-shadow-[0_0_8px_#fd0c96]" : ""}`}
          />
        </div>

        {/* Piggy Dao - новая локация ниже Piggy Bank */}
        <div
          className="absolute cursor-pointer transition-transform duration-300 hover:scale-110"
          style={{ left: "148.5px", top: "445px" }}
          onClick={() => openLocation("piggy-dao")}
          onMouseEnter={() => setHoveredLocation("piggy-dao")}
          onMouseLeave={() => setHoveredLocation(null)}
        >
          <img
            src="/images/piggy-dao-icon.png"
            alt="Piggy Dao"
            style={{ width: "105px", height: "105px" }}
            className={`object-contain ${hoveredLocation === "piggy-dao" ? "filter drop-shadow-[0_0_8px_#fd0c96]" : ""}`}
          />
        </div>

        {/* Casino */}
        <div
          className="absolute cursor-pointer transition-transform duration-300 hover:scale-110"
          style={{ left: "266px", top: "72px" }}
          onClick={() => openLocation("casino")}
          onMouseEnter={() => setHoveredLocation("casino")}
          onMouseLeave={() => setHoveredLocation(null)}
        >
          <img
            src="/images/casino.png"
            alt="Casino"
            style={{ width: "120px", height: "120px" }}
            className={`object-contain ${hoveredLocation === "casino" ? "filter drop-shadow-[0_0_8px_#fd0c96]" : ""}`}
          />
        </div>

        {/* NFT Hall */}
        <div
          className="absolute cursor-pointer transition-transform duration-300 hover:scale-110"
          style={{ left: "33px", top: "563px" }}
          onClick={() => openLocation("nft-hall")}
          onMouseEnter={() => setHoveredLocation("nft-hall")}
          onMouseLeave={() => setHoveredLocation(null)}
        >
          <img
            src="/images/pnn.png"
            alt="NFT Hall"
            style={{ width: "114px", height: "114px" }}
            className={`object-contain ${hoveredLocation === "nft-hall" ? "filter drop-shadow-[0_0_8px_#fd0c96]" : ""}`}
          />
        </div>

        {/* Superform Area */}
        <div
          className="absolute cursor-pointer transition-transform duration-300 hover:scale-110"
          style={{ left: "267px", top: "304px" }}
          onClick={() => openLocation("superform-area")}
          onMouseEnter={() => setHoveredLocation("superform-area")}
          onMouseLeave={() => setHoveredLocation(null)}
        >
          <img
            src="/images/superformarea.png"
            alt="Superform Area"
            style={{ width: "120px", height: "120px" }}
            className={`object-contain ${hoveredLocation === "superform-area" ? "filter drop-shadow-[0_0_8px_#fd0c96]" : ""}`}
          />
        </div>

        {/* Oink-Oink */}
        <div
          className="absolute cursor-pointer transition-transform duration-300 hover:scale-110"
          style={{ left: "8px", top: "364px" }}
          onClick={() => openLocation("oink-oink")}
          onMouseEnter={() => setHoveredLocation("oink-oink")}
          onMouseLeave={() => setHoveredLocation(null)}
        >
          <img
            src="/images/oink-oink.png"
            alt="Oink-Oink"
            style={{ width: "108px", height: "108px" }}
            className={`object-contain ${hoveredLocation === "oink-oink" ? "filter drop-shadow-[0_0_8px_#fd0c96]" : ""}`}
          />
        </div>

        {/* Game Zone */}
        <div
          className="absolute cursor-pointer transition-transform duration-300 hover:scale-110"
          style={{ left: "273px", top: "501px" }}
          onClick={() => openLocation("game-zone")}
          onMouseEnter={() => setHoveredLocation("game-zone")}
          onMouseLeave={() => setHoveredLocation(null)}
        >
          <img
            src="/images/game-zone.png"
            alt="Game Zone"
            style={{ width: "166px", height: "166px" }}
            className={`object-contain ${hoveredLocation === "game-zone" ? "filter drop-shadow-[0_0_8px_#fd0c96]" : ""}`}
          />
        </div>
      </div>

      {/* Modal for active location */}
      {activeLocation && (
        <Modal
          isOpen={!!activeLocation}
          onClose={closeLocation}
          title={locationTitles[activeLocation]}
          username={activeLocation === "oink-oink" ? getUsernameForOinkOink() : undefined}
          width={getModalDimensions(activeLocation).width}
          height={getModalDimensions(activeLocation).height}
        >
          {locationComponents[activeLocation]}
        </Modal>
      )}
    </div>
  )
}
