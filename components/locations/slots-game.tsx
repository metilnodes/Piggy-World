"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Coins } from "lucide-react"
import { useBalance } from "@/contexts/balance-context"

// Символы для слотов с их множителями
const slotItems = [
  { symbol: "🐖", multiplier: 50, name: "Pig" }, // Pig - самый ценный символ
  { symbol: "🐸", multiplier: 20, name: "Frog" }, // Frog
  { symbol: "🦍", multiplier: 10, name: "Ape" }, // Ape
  { symbol: "👽", multiplier: 8, name: "Alien" }, // Alien
  { symbol: "🐍", multiplier: 6, name: "Snake" }, // Snake
  { symbol: "🦖", multiplier: 4, name: "Dino" }, // Dino
  { symbol: "🐋", multiplier: 2, name: "Whale" }, // Whale
]

interface SlotsGameProps {
  updateBalance?: (amount: number) => Promise<void>
  balance?: number
}

export default function SlotsGame({ updateBalance: legacyUpdateBalance, balance: legacyBalance }: SlotsGameProps) {
  // Используем новый BalanceContext
  const { balance, subtractFromBalance, addToBalance, isLoading: balanceLoading } = useBalance()

  const [reels, setReels] = useState<string[]>(["❓", "❓", "❓"])
  const [spinning, setSpinning] = useState(false)
  const [bet, setBet] = useState(10)
  const [lastWin, setLastWin] = useState(0)
  const [spinResult, setSpinResult] = useState<"win" | "lose" | null>(null)
  const [spinHistory, setSpinHistory] = useState<Array<{ result: "win" | "lose"; amount: number }>>([])
  const [animationPhase, setAnimationPhase] = useState<"idle" | "spinning" | "stopping" | "result">("idle")

  // Функция для получения случайного символа с учетом вероятностей
  const getRandomSymbol = () => {
    // Веса для символов (чем больше число, тем чаще выпадает)
    const weights = [1, 3, 6, 10, 15, 25, 40] // Pig самый редкий, Whale самый частый
    const totalWeight = weights.reduce((a, b) => a + b, 0)

    const random = Math.random() * totalWeight
    let weightSum = 0

    for (let i = weights.length - 1; i >= 0; i--) {
      // Идем с конца (от самых частых к редким)
      weightSum += weights[i]
      if (random <= weightSum) {
        return slotItems[i].symbol
      }
    }

    return slotItems[slotItems.length - 1].symbol
  }

  // Функция для вращения барабанов
  const spin = async () => {
    if (spinning || balanceLoading) {
      console.warn("⚠️ Cannot spin: already spinning or balance loading")
      return
    }

    const currentBalance = balance || 0
    if (currentBalance < bet) {
      console.warn("⚠️ Cannot spin: insufficient balance")
      return
    }

    console.log(`🎰 Starting spin with bet: ${bet}, current balance: ${currentBalance}`)

    // Списываем ставку через BalanceContext
    const success = await subtractFromBalance(bet)
    if (!success) {
      console.warn("⚠️ Failed to place bet")
      return
    }

    setSpinning(true)
    setSpinResult(null)
    setLastWin(0)
    setAnimationPhase("spinning")

    // Анимация вращения
    let spinCount = 0
    const maxSpins = 30 // Увеличиваем количество спинов для лучшей анимации
    const baseInterval = 50 // Базовый интервал

    const spinInterval = setInterval(
      () => {
        // Генерируем случайные символы для анимации
        setReels([getRandomSymbol(), getRandomSymbol(), getRandomSymbol()])
        spinCount++

        // Постепенно замедляем анимацию
        if (spinCount > maxSpins * 0.7) {
          setAnimationPhase("stopping")
        }

        if (spinCount >= maxSpins) {
          clearInterval(spinInterval)

          // Определяем финальные символы
          const finalReels = generateFinalReels()
          setReels(finalReels)
          setAnimationPhase("result")

          // Проверяем выигрыш
          setTimeout(() => {
            checkWin(finalReels)
            setSpinning(false)
            setAnimationPhase("idle")
          }, 500)
        }
      },
      baseInterval + Math.floor(spinCount / 3),
    ) // Постепенно увеличиваем интервал
  }

  // Генерация финальных символов с контролируемой вероятностью
  const generateFinalReels = (): string[] => {
    const finalReels = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()]

    // Контролируем частоту выигрышей
    const winChance = Math.random()

    // 15% шанс на джекпот (3 одинаковых)
    if (winChance < 0.15) {
      const symbol = getRandomSymbol()
      return [symbol, symbol, symbol]
    }

    // 25% шанс на частичный выигрыш (2 одинаковых)
    if (winChance < 0.4) {
      const symbol = getRandomSymbol()
      const position = Math.floor(Math.random() * 3)
      finalReels[position] = symbol
      finalReels[(position + 1) % 3] = symbol
    }

    // 60% шанс на проигрыш - убеждаемся что символы разные
    if (winChance >= 0.4) {
      // Делаем символы разными
      while (finalReels[0] === finalReels[1] || finalReels[1] === finalReels[2] || finalReels[0] === finalReels[2]) {
        finalReels[Math.floor(Math.random() * 3)] = getRandomSymbol()
      }
    }

    return finalReels
  }

  // Проверка выигрыша
  const checkWin = async (currentReels: string[]) => {
    console.log("🎰 Checking win for reels:", currentReels)

    // Проверяем, все ли символы одинаковые (джекпот)
    if (currentReels[0] === currentReels[1] && currentReels[1] === currentReels[2]) {
      const symbol = currentReels[0]
      const item = slotItems.find((item) => item.symbol === symbol)

      if (item) {
        const winAmount = bet * item.multiplier
        console.log(`🎉 JACKPOT! ${item.name} x3 - Won ${winAmount} OINK`)

        await addToBalance(winAmount)
        setLastWin(winAmount)
        setSpinResult("win")
        setSpinHistory((prev) => [...prev, { result: "win", amount: winAmount }].slice(-10))

        // Эффект для большого выигрыша
        if (winAmount >= bet * 10) {
          console.log("🎊 BIG WIN!")
        }
      }
    }
    // Проверяем, есть ли два одинаковых символа
    else if (
      currentReels[0] === currentReels[1] ||
      currentReels[1] === currentReels[2] ||
      currentReels[0] === currentReels[2]
    ) {
      let symbol: string
      if (currentReels[0] === currentReels[1]) symbol = currentReels[0]
      else if (currentReels[1] === currentReels[2]) symbol = currentReels[1]
      else symbol = currentReels[0]

      const item = slotItems.find((item) => item.symbol === symbol)

      if (item) {
        // Частичный выигрыш - меньший множитель
        const winAmount = Math.max(1, Math.floor(bet * (item.multiplier / 4)))
        console.log(`🎉 Partial win! ${item.name} x2 - Won ${winAmount} OINK`)

        await addToBalance(winAmount)
        setLastWin(winAmount)
        setSpinResult("win")
        setSpinHistory((prev) => [...prev, { result: "win", amount: winAmount }].slice(-10))
      }
    } else {
      console.log("💸 No win this time")
      setLastWin(0)
      setSpinResult("lose")
      setSpinHistory((prev) => [...prev, { result: "lose", amount: 0 }].slice(-10))
    }
  }

  // Изменение ставки
  const changeBet = (amount: number) => {
    if (spinning) return

    const newBet = bet + amount
    if (newBet >= 10 && newBet <= 100) {
      setBet(newBet)
    }
  }

  // Инициализация при первой загрузке
  useEffect(() => {
    setReels([getRandomSymbol(), getRandomSymbol(), getRandomSymbol()])
  }, [])

  const currentBalance = balance || 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold text-[#fd0c96]">Oink & Spin</h3>
        <div className="flex items-center gap-2">
          <Coins className="h-4 w-4 text-[#fd0c96]" />
          <span className="text-sm text-white">
            Balance: <span className="font-bold text-[#fd0c96]">{currentBalance} OINK</span>
          </span>
        </div>
      </div>

      {/* Слот-машина */}
      <Card className="bg-black border-[#fd0c96]/30 w-full max-w-md mx-auto">
        <CardContent className="p-4 min-h-[380px] flex flex-col">
          <div className="flex justify-center gap-2 mb-4">
            {reels.map((symbol, index) => (
              <div
                key={index}
                className={`w-16 h-16 flex items-center justify-center text-3xl bg-gradient-to-b from-[#fd0c96]/20 to-[#fd0c96]/5 rounded-lg border border-[#fd0c96]/30 transition-all duration-100 ${
                  animationPhase === "spinning"
                    ? "animate-pulse scale-105"
                    : animationPhase === "stopping"
                      ? "animate-bounce"
                      : animationPhase === "result" && spinResult === "win"
                        ? "ring-2 ring-green-500 ring-opacity-75 animate-pulse"
                        : ""
                }`}
              >
                {symbol}
              </div>
            ))}
          </div>

          {/* Результат */}
          <div className="text-center mb-4 h-8 flex items-center justify-center">
            {spinResult && animationPhase === "idle" && (
              <div
                className={`transition-all duration-500 ${spinResult === "win" ? "text-green-500" : "text-red-500"}`}
              >
                {spinResult === "win" ? (
                  <div className="flex items-center justify-center gap-1">
                    <Sparkles className="h-4 w-4 animate-spin" />
                    <span className="font-bold">
                      {lastWin >= bet * 10 ? "BIG WIN: " : "Win: "}
                      {lastWin} OINK!
                    </span>
                    <Sparkles className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  <span>Try again!</span>
                )}
              </div>
            )}
          </div>

          {/* Информация о ставке */}
          <div className="text-center mb-4">
            <div className="text-sm text-white mb-2">
              Bet: <span className="font-bold text-[#fd0c96]">{bet} OINK</span>
            </div>
          </div>

          {/* Кнопки управления */}
          <div className="flex justify-center gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => changeBet(-10)}
              disabled={bet <= 10 || spinning}
              className="border-[#fd0c96]/30 text-[#fd0c96] hover:bg-[#fd0c96]/10"
            >
              -10
            </Button>
            <Button
              className={`min-w-[120px] transition-all duration-200 ${
                spinning
                  ? "bg-gray-600 cursor-not-allowed"
                  : currentBalance >= bet
                    ? "bg-[#fd0c96] hover:bg-[#fd0c96]/80 hover:scale-105"
                    : "bg-gray-600 cursor-not-allowed"
              }`}
              disabled={spinning || currentBalance < bet || balanceLoading}
              onClick={spin}
            >
              {spinning ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Spinning...
                </div>
              ) : currentBalance < bet ? (
                "Insufficient Balance"
              ) : (
                "SPIN!"
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => changeBet(10)}
              disabled={bet >= 100 || spinning}
              className="border-[#fd0c96]/30 text-[#fd0c96] hover:bg-[#fd0c96]/10"
            >
              +10
            </Button>
          </div>

          {/* Информация о выигрышах */}
          <div className="grid grid-cols-2 gap-2 text-xs min-h-[100px]">
            <div className="bg-[#fd0c96]/10 p-3 rounded min-h-[90px] flex flex-col">
              <div className="font-bold mb-2 text-white whitespace-nowrap">Winning</div>
              <div className="font-bold mb-2 text-white whitespace-nowrap"> combinations:</div>
              <div className="space-y-1 text-gray-300 flex-1">
                <div className="whitespace-nowrap">3 identical: x2-x50</div>
                <div className="whitespace-nowrap">2 identical: x0.5-x12.5</div>
              </div>
            </div>
            <div className="bg-[#fd0c96]/10 p-3 rounded min-h-[90px] flex flex-col">
              <div className="font-bold mb-2 text-white whitespace-nowrap">Best symbols:</div>
              <div className="space-y-1 text-gray-300 flex-1">
                <div className="whitespace-nowrap">🐖 - x50 (Pig)</div>
                <div className="whitespace-nowrap">🐸 - x20 (Frog)</div>
                <div className="whitespace-nowrap">🦍 - x10 (Ape)</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* История спинов */}
      {spinHistory.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2 text-white">Recent spins:</h4>
          <div className="flex flex-wrap gap-1">
            {spinHistory.map((spin, index) => (
              <div
                key={index}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all duration-200 ${
                  spin.result === "win"
                    ? "bg-green-500/20 text-green-500 border border-green-500/30"
                    : "bg-red-500/20 text-red-500 border border-red-500/30"
                }`}
                title={spin.result === "win" ? `Won ${spin.amount} OINK` : "No win"}
              >
                {spin.result === "win" ? "W" : "L"}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
