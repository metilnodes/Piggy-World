"use client"

import { useState } from "react"
import { useAppContext } from "@/contexts/app-context"
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from "lucide-react"

export function Casino() {
  const { balance, addCoins, removeCoins } = useAppContext()
  const [betAmount, setBetAmount] = useState<number>(10)
  const [diceValue, setDiceValue] = useState<number | null>(null)
  const [isRolling, setIsRolling] = useState<boolean>(false)
  const [result, setResult] = useState<string | null>(null)
  const [prediction, setPrediction] = useState<"high" | "low">("high")

  const diceIcons = [
    <Dice1 key={1} size={48} />,
    <Dice2 key={2} size={48} />,
    <Dice3 key={3} size={48} />,
    <Dice4 key={4} size={48} />,
    <Dice5 key={5} size={48} />,
    <Dice6 key={6} size={48} />,
  ]

  const rollDice = () => {
    if (balance < betAmount) {
      setResult("Insufficient balance!")
      return
    }

    // Remove bet amount from balance
    removeCoins(betAmount)

    setIsRolling(true)
    setResult(null)

    // Animate dice rolling
    const rollInterval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1)
    }, 100)

    // Stop rolling after 2 seconds and determine result
    setTimeout(() => {
      clearInterval(rollInterval)
      const finalValue = Math.floor(Math.random() * 6) + 1
      setDiceValue(finalValue)
      setIsRolling(false)

      const isHigh = finalValue > 3
      const userWon = (prediction === "high" && isHigh) || (prediction === "low" && !isHigh)

      if (userWon) {
        const winnings = betAmount * 2
        addCoins(winnings)
        setResult(`You won ${winnings} OINK coins!`)
      } else {
        setResult(`You lost ${betAmount} OINK coins!`)
      }
    }, 2000)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-center mb-4">
        <img src="/images/casino.png" alt="Casino" className="w-24 h-24 object-contain" />
      </div>

      <div className="p-3 bg-black bg-opacity-50 rounded-lg border border-[#fd0c96] mb-4">
        <p className="text-center text-lg font-bold text-[#fd0c96]">Balance: {balance} OINK</p>
      </div>

      <div className="flex justify-center my-6">
        <div
          className="w-16 h-16 flex items-center justify-center text-[#fd0c96]"
          style={{
            border: "2px solid #fd0c96",
            borderRadius: "8px",
            boxShadow: "0 0 10px #fd0c96",
          }}
        >
          {diceValue ? diceIcons[diceValue - 1] : "?"}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-[#fd0c96] mb-2">Bet Amount:</label>
          <input
            type="number"
            min="1"
            value={betAmount}
            onChange={(e) => setBetAmount(Math.max(1, Number.parseInt(e.target.value) || 0))}
            className="w-full px-3 py-2 bg-black border border-[#fd0c96] rounded-md focus:outline-none focus:ring-2 focus:ring-[#fd0c96] text-white"
            disabled={isRolling}
          />
        </div>

        <div>
          <label className="block text-[#fd0c96] mb-2">Prediction:</label>
          <div className="flex space-x-4">
            <button
              onClick={() => setPrediction("high")}
              className={`flex-1 py-2 rounded-md transition-colors ${prediction === "high" ? "bg-[#fd0c96] text-black font-bold" : "bg-transparent border border-[#fd0c96] text-[#fd0c96]"}`}
              disabled={isRolling}
            >
              High (4-6)
            </button>
            <button
              onClick={() => setPrediction("low")}
              className={`flex-1 py-2 rounded-md transition-colors ${prediction === "low" ? "bg-[#fd0c96] text-black font-bold" : "bg-transparent border border-[#fd0c96] text-[#fd0c96]"}`}
              disabled={isRolling}
            >
              Low (1-3)
            </button>
          </div>
        </div>

        <button onClick={rollDice} className="w-full neon-button" disabled={isRolling || balance < betAmount}>
          {isRolling ? "Rolling..." : "Roll Dice"}
        </button>
      </div>

      {result && (
        <div className="mt-4 p-3 rounded-lg border border-[#fd0c96] text-center text-[#fd0c96] font-bold">{result}</div>
      )}

      <div className="mt-4 text-sm text-white opacity-70">
        <p>Bet on High (4-6) or Low (1-3) and roll the dice.</p>
        <p>Win double your bet if your prediction is correct!</p>
      </div>
    </div>
  )
}
