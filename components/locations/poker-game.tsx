"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, User, Bot } from "lucide-react"
import { useBalance } from "@/contexts/balance-context"

// ==================== ТИПЫ И ИНТЕРФЕЙСЫ ====================

type Suit = "♠" | "♥" | "♦" | "♣"
type Value = "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A"

interface PokerCard {
  suit: Suit
  value: Value
  hidden?: boolean
}

type GameState = "preflop" | "flop" | "turn" | "river" | "showdown" | "end"
type PlayerAction = "check" | "call" | "bet" | "raise" | "fold" | "allin"

interface GameEngine {
  gameState: GameState
  deck: PokerCard[]
  playerHand: PokerCard[]
  opponentHand: PokerCard[]
  communityCards: PokerCard[]
  playerBet: number
  opponentBet: number
  pot: number
  isPlayerDealer: boolean
  playerTurn: boolean
  message: string
  lastAction: { player: "player" | "opponent"; action: string } | null
  winner: "player" | "opponent" | "tie" | null
}

interface PokerGameProps {
  balance: number
}

// ==================== КОНСТАНТЫ ====================

const SMALL_BLIND = 5
const BIG_BLIND = 10
const SUITS: Suit[] = ["♠", "♥", "♦", "♣"]
const VALUES: Value[] = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"]

// ==================== ОСНОВНОЙ КОМПОНЕНТ ====================

export default function PokerGame({ balance }: PokerGameProps) {
  const { subtractFromBalance, addToBalance, isLoading } = useBalance()

  // Состояние игрового движка
  const [gameEngine, setGameEngine] = useState<GameEngine>({
    gameState: "end",
    deck: [],
    playerHand: [],
    opponentHand: [],
    communityCards: [],
    playerBet: 0,
    opponentBet: 0,
    pot: 0,
    isPlayerDealer: true,
    playerTurn: false,
    message: "Click 'New Hand' to start playing!",
    lastAction: null,
    winner: null,
  })

  const [raiseAmount, setRaiseAmount] = useState(20)
  const [gameMessage, setGameMessage] = useState("")

  // ==================== УТИЛИТЫ ДЛЯ КАРТ ====================

  const createDeck = (): PokerCard[] => {
    const deck: PokerCard[] = []
    for (const suit of SUITS) {
      for (const value of VALUES) {
        deck.push({ suit, value })
      }
    }
    return shuffleDeck(deck)
  }

  const shuffleDeck = (deck: PokerCard[]): PokerCard[] => {
    const shuffled = [...deck]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  // ==================== ОСНОВНЫЕ ИГРОВЫЕ ФУНКЦИИ ====================

  const startNewHand = async () => {
    if (balance < BIG_BLIND) {
      setGameMessage("Not enough chips to play! Need at least 10 OINK.")
      return
    }

    if (isLoading) {
      setGameMessage("Please wait...")
      return
    }

    console.log("🎮 Starting new hand...")

    const newDeck = createDeck()
    const newIsPlayerDealer = !gameEngine.isPlayerDealer

    // Раздаем карты
    const playerCards = [newDeck.pop()!, newDeck.pop()!]
    const opponentCards = [
      { ...newDeck.pop()!, hidden: true },
      { ...newDeck.pop()!, hidden: true },
    ]

    // Устанавливаем блайнды
    let newPlayerBet = 0
    let newOpponentBet = 0
    let newPot = 0
    let newPlayerTurn = false
    let newMessage = ""

    try {
      if (newIsPlayerDealer) {
        // Игрок = Dealer + SB
        await subtractFromBalance(SMALL_BLIND, "Poker small blind")
        newPlayerBet = SMALL_BLIND
        newOpponentBet = BIG_BLIND
        newPot = SMALL_BLIND + BIG_BLIND
        newPlayerTurn = true
        newMessage = `You are Dealer+SB (${SMALL_BLIND}). Call ${BIG_BLIND - SMALL_BLIND} more, raise or fold?`
      } else {
        // Игрок = BB
        await subtractFromBalance(BIG_BLIND, "Poker big blind")
        newPlayerBet = BIG_BLIND
        newOpponentBet = SMALL_BLIND
        newPot = SMALL_BLIND + BIG_BLIND
        newPlayerTurn = false
        newMessage = `Opponent is Dealer+SB (${SMALL_BLIND}). You are BB (${BIG_BLIND}). Waiting for opponent...`
      }

      setGameEngine({
        gameState: "preflop",
        deck: newDeck,
        playerHand: playerCards,
        opponentHand: opponentCards,
        communityCards: [],
        playerBet: newPlayerBet,
        opponentBet: newOpponentBet,
        pot: newPot,
        isPlayerDealer: newIsPlayerDealer,
        playerTurn: newPlayerTurn,
        message: newMessage,
        lastAction: null,
        winner: null,
      })

      setGameMessage(`✅ New hand started! Blinds posted.`)
    } catch (error) {
      console.error("Error starting new hand:", error)
      setGameMessage("❌ Failed to start new hand")
    }
  }

  const dealCards = (stage: "flop" | "turn" | "river") => {
    setGameEngine((prev) => {
      const newDeck = [...prev.deck]
      const newCommunityCards = [...prev.communityCards]

      if (stage === "flop") {
        // Сжигаем карту и раздаем 3
        newDeck.pop() // burn card
        newCommunityCards.push(newDeck.pop()!, newDeck.pop()!, newDeck.pop()!)
      } else {
        // Сжигаем карту и раздаем 1
        newDeck.pop() // burn card
        newCommunityCards.push(newDeck.pop()!)
      }

      // Постфлоп: BB ходит первым
      const newPlayerTurn = !prev.isPlayerDealer // Если игрок не дилер, то он BB
      const bbPlayer = prev.isPlayerDealer ? "Opponent" : "You"

      return {
        ...prev,
        gameState: stage,
        deck: newDeck,
        communityCards: newCommunityCards,
        playerBet: 0,
        opponentBet: 0,
        playerTurn: newPlayerTurn,
        message: `${stage.charAt(0).toUpperCase() + stage.slice(1)} dealt. ${bbPlayer} (BB) act first.`,
        lastAction: null,
      }
    })
  }

  const playerAction = async (action: PlayerAction, amount?: number) => {
    if (!gameEngine.playerTurn || gameEngine.gameState === "end" || gameEngine.gameState === "showdown" || isLoading) {
      return
    }

    console.log(`🎮 Player action: ${action}${amount ? ` (${amount})` : ""}`)

    const currentBet = Math.max(gameEngine.playerBet, gameEngine.opponentBet)
    const callAmount = currentBet - gameEngine.playerBet

    try {
      setGameEngine((prev) => {
        let newPlayerBet = prev.playerBet
        let newPot = prev.pot
        let newMessage = ""
        let newGameState = prev.gameState
        let newWinner = prev.winner

        switch (action) {
          case "fold":
            newWinner = "opponent"
            newGameState = "end"
            newMessage = "You folded. Opponent wins the pot."
            break

          case "check":
            if (callAmount > 0) {
              newMessage = "Cannot check when there's a bet to call!"
              return prev
            }
            newMessage = "You checked."
            break

          case "call":
            if (callAmount <= 0) {
              newMessage = "Nothing to call!"
              return prev
            }
            if (balance < callAmount) {
              newMessage = "Not enough chips to call!"
              return prev
            }
            // Списываем деньги асинхронно
            subtractFromBalance(callAmount, `Poker call ${callAmount}`)
            newPlayerBet = currentBet
            newPot = prev.pot + callAmount
            newMessage = `You called ${callAmount} OINK.`
            break

          case "bet":
            if (currentBet > 0) {
              newMessage = "Cannot bet when there's already a bet!"
              return prev
            }
            const betAmount = amount || raiseAmount
            if (balance < betAmount) {
              newMessage = "Not enough chips to bet!"
              return prev
            }
            subtractFromBalance(betAmount, `Poker bet ${betAmount}`)
            newPlayerBet = betAmount
            newPot = prev.pot + betAmount
            newMessage = `You bet ${betAmount} OINK.`
            break

          case "raise":
            const totalRaise = amount || raiseAmount
            if (totalRaise <= currentBet) {
              newMessage = "Raise must be higher than current bet!"
              return prev
            }
            const raiseActual = totalRaise - prev.playerBet
            if (balance < raiseActual) {
              newMessage = "Not enough chips to raise!"
              return prev
            }
            subtractFromBalance(raiseActual, `Poker raise to ${totalRaise}`)
            newPlayerBet = totalRaise
            newPot = prev.pot + raiseActual
            newMessage = `You raised to ${totalRaise} OINK.`
            break

          case "allin":
            const allInAmount = balance
            subtractFromBalance(allInAmount, "Poker all-in")
            newPlayerBet = prev.playerBet + allInAmount
            newPot = prev.pot + allInAmount
            newMessage = `You went all-in for ${allInAmount} OINK!`
            break
        }

        return {
          ...prev,
          playerBet: newPlayerBet,
          pot: newPot,
          playerTurn: false,
          message: newMessage,
          gameState: newGameState,
          winner: newWinner,
          lastAction: { player: "player", action },
        }
      })
    } catch (error) {
      console.error("Error in player action:", error)
      setGameMessage("❌ Failed to perform action")
    }
  }

  const opponentAction = () => {
    if (gameEngine.playerTurn || gameEngine.gameState === "end" || gameEngine.gameState === "showdown") {
      return
    }

    console.log("🤖 Opponent thinking...")

    setTimeout(() => {
      setGameEngine((prev) => {
        const currentBet = Math.max(prev.playerBet, prev.opponentBet)
        const callAmount = currentBet - prev.opponentBet
        const random = Math.random()

        let newOpponentBet = prev.opponentBet
        let newPot = prev.pot
        let newMessage = ""
        let newGameState = prev.gameState
        let newWinner = prev.winner

        // Простая AI логика
        if (callAmount === 0) {
          // Нет ставки - check или bet
          if (random < 0.7) {
            newMessage = "Opponent checked."
          } else {
            const betAmount = BIG_BLIND
            newOpponentBet = betAmount
            newPot = prev.pot + betAmount
            newMessage = `Opponent bet ${betAmount} OINK.`
          }
        } else {
          // Есть ставка - call, raise или fold
          if (random < 0.3) {
            // Fold
            newWinner = "player"
            newGameState = "end"
            newMessage = "Opponent folded. You win!"
          } else if (random < 0.9) {
            // Call
            newOpponentBet = currentBet
            newPot = prev.pot + callAmount
            newMessage = `Opponent called ${callAmount} OINK.`
          } else {
            // Raise
            const raiseAmount = currentBet + BIG_BLIND
            const raiseActual = raiseAmount - prev.opponentBet
            newOpponentBet = raiseAmount
            newPot = prev.pot + raiseActual
            newMessage = `Opponent raised to ${raiseAmount} OINK.`
          }
        }

        return {
          ...prev,
          opponentBet: newOpponentBet,
          pot: newPot,
          playerTurn: true,
          message: newMessage + " Your turn.",
          gameState: newGameState,
          winner: newWinner,
          lastAction: { player: "opponent", action: "action" },
        }
      })
    }, 1500)
  }

  const isBettingRoundComplete = (): boolean => {
    return gameEngine.playerBet === gameEngine.opponentBet && gameEngine.lastAction !== null
  }

  const advanceToNextStage = () => {
    if (isBettingRoundComplete()) {
      switch (gameEngine.gameState) {
        case "preflop":
          dealCards("flop")
          break
        case "flop":
          dealCards("turn")
          break
        case "turn":
          dealCards("river")
          break
        case "river":
          goToShowdown()
          break
      }
    }
  }

  const goToShowdown = () => {
    setGameEngine((prev) => ({
      ...prev,
      gameState: "showdown",
      opponentHand: prev.opponentHand.map((card) => ({ ...card, hidden: false })),
      message: "Showdown! Revealing cards...",
    }))

    setTimeout(async () => {
      // Простое определение победителя (можно улучшить)
      const winner = Math.random() < 0.5 ? "player" : "opponent"

      setGameEngine((prev) => {
        if (winner === "player") {
          addToBalance(prev.pot, `Poker win - pot ${prev.pot}`)
          setGameMessage(`🎉 You won ${prev.pot} OINK!`)
          return {
            ...prev,
            gameState: "end",
            winner: "player",
            message: `You won ${prev.pot} OINK!`,
          }
        } else {
          setGameMessage("😔 You lost. Better luck next time!")
          return {
            ...prev,
            gameState: "end",
            winner: "opponent",
            message: "You lost. Better luck next time!",
          }
        }
      })
    }, 2000)
  }

  // ==================== ЭФФЕКТЫ ====================

  // Автоматический ход оппонента
  useEffect(() => {
    if (!gameEngine.playerTurn && gameEngine.gameState !== "end" && gameEngine.gameState !== "showdown") {
      const timer = setTimeout(() => {
        opponentAction()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [gameEngine.playerTurn, gameEngine.gameState])

  // Проверка завершения раунда
  useEffect(() => {
    if (isBettingRoundComplete() && gameEngine.gameState !== "end") {
      const timer = setTimeout(() => {
        advanceToNextStage()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [gameEngine.playerBet, gameEngine.opponentBet, gameEngine.lastAction])

  // ==================== РЕНДЕР КАРТ ====================

  const getCardColor = (suit: Suit) => {
    return suit === "♥" || suit === "♦" ? "text-red-500" : "text-black"
  }

  const renderCard = (card: PokerCard, index: number) => {
    if (card.hidden) {
      return (
        <div
          key={index}
          className="w-12 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded border-2 border-blue-400 flex items-center justify-center shadow-md"
        >
          <span className="text-white text-lg font-bold">?</span>
        </div>
      )
    }

    return (
      <div
        key={index}
        className="w-12 h-16 bg-white rounded border border-gray-300 shadow-md flex flex-col relative overflow-hidden"
      >
        <div className="absolute top-0.5 left-0.5 flex flex-col items-center leading-none">
          <span className={`text-xs font-bold ${getCardColor(card.suit)}`} style={{ fontSize: "10px" }}>
            {card.value}
          </span>
          <span className={`${getCardColor(card.suit)}`} style={{ fontSize: "10px" }}>
            {card.suit}
          </span>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`${getCardColor(card.suit)}`} style={{ fontSize: "20px" }}>
            {card.suit}
          </span>
        </div>
        <div className="absolute bottom-0.5 right-0.5 flex flex-col items-center leading-none transform rotate-180">
          <span className={`text-xs font-bold ${getCardColor(card.suit)}`} style={{ fontSize: "10px" }}>
            {card.value}
          </span>
          <span className={`${getCardColor(card.suit)}`} style={{ fontSize: "10px" }}>
            {card.suit}
          </span>
        </div>
      </div>
    )
  }

  // ==================== ОСНОВНОЙ РЕНДЕР ====================

  const currentBet = Math.max(gameEngine.playerBet, gameEngine.opponentBet)
  const callAmount = currentBet - gameEngine.playerBet

  return (
    <div className="space-y-4">
    {/* Заголовок */}
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-lg font-bold text-[#fd0c96]">Piggy Hold'em</h3>
      <div className="text-sm text-white flex flex-col text-right">
        <div>
          Balance: <span className="font-bold text-[#fd0c96]">{balance} OINK</span>
        </div>
        <div>
          Pot: <span className="font-bold text-[#fd0c96]">{gameEngine.pot} OINK</span>
        </div>
      </div>
    </div>

      {/* Сообщения */}
      {gameMessage && (
        <div className="text-center text-sm text-white bg-black/30 rounded p-2 border border-[#fd0c96]/20">
          {gameMessage}
        </div>
      )}

      {/* Игровой стол */}
      <Card className="border-[#fd0c96]/30 bg-green-900/20">
        <CardContent className="p-4">
          {/* Оппонент */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
              <Bot className="h-4 w-4 text-red-500" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-white flex items-center gap-2">
                PorkChop
                {!gameEngine.isPlayerDealer && (
                  <span className="text-xs bg-[#fd0c96] text-black px-1 rounded">D/SB</span>
                )}
                {gameEngine.isPlayerDealer && <span className="text-xs bg-blue-500 text-white px-1 rounded">BB</span>}
                <span className="text-xs text-gray-400">(1000 OINK)</span>
              </div>
              <div className="flex gap-1 mt-1">
                {gameEngine.opponentHand.map((card, index) => renderCard(card, index))}
              </div>
              {gameEngine.opponentBet > 0 && (
                <div className="text-xs text-[#fd0c96] mt-1">Bet: {gameEngine.opponentBet} OINK</div>
              )}
            </div>
          </div>

          {/* Общие карты */}
          <div className="bg-green-800/50 rounded-lg p-3 mb-6 border border-green-600/30">
            <div className="text-xs text-center mb-2 text-white/70">Community Cards ({gameEngine.gameState})</div>
            <div className="flex justify-center gap-1 min-h-[64px] items-center">
              {gameEngine.communityCards.length > 0 ? (
                gameEngine.communityCards.map((card, index) => renderCard(card, index))
              ) : (
                <div className="text-white/50 text-sm">Waiting for flop...</div>
              )}
            </div>
          </div>

          {/* Игрок */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#fd0c96] flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-white flex items-center gap-2">
                You
                {gameEngine.isPlayerDealer && (
                  <span className="text-xs bg-[#fd0c96] text-black px-1 rounded">D/SB</span>
                )}
                {!gameEngine.isPlayerDealer && <span className="text-xs bg-blue-500 text-white px-1 rounded">BB</span>}
                <span className="text-xs text-gray-400">({balance} OINK)</span>
              </div>
              <div className="flex gap-1 mt-1">
                {gameEngine.playerHand.map((card, index) => renderCard(card, index))}
              </div>
              {gameEngine.playerBet > 0 && (
                <div className="text-xs text-[#fd0c96] mt-1">Bet: {gameEngine.playerBet} OINK</div>
              )}
            </div>
          </div>

          {/* Сообщение */}
          <div className="mt-4 p-2 bg-black/30 rounded text-center text-sm text-white border border-[#fd0c96]/20">
            {gameEngine.message}
          </div>

          {/* Результат */}
          {gameEngine.winner && (
            <div className={`mt-3 text-center ${gameEngine.winner === "player" ? "text-green-500" : "text-red-500"}`}>
              {gameEngine.winner === "player" && (
                <div className="flex items-center justify-center gap-1">
                  <Sparkles className="h-4 w-4" />
                  <span>You Won!</span>
                  <Sparkles className="h-4 w-4" />
                </div>
              )}
              {gameEngine.winner === "opponent" && <span>You Lost!</span>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Кнопки действий */}
      {gameEngine.gameState !== "end" && gameEngine.gameState !== "showdown" && (
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            disabled={!gameEngine.playerTurn || callAmount > 0 || isLoading}
            onClick={() => playerAction("check")}
            className="border-[#fd0c96]/30 text-[#fd0c96] hover:bg-[#fd0c96]/10"
          >
            Check
          </Button>
          <Button
            variant="outline"
            disabled={!gameEngine.playerTurn || callAmount <= 0 || balance < callAmount || isLoading}
            onClick={() => playerAction("call")}
            className="border-[#fd0c96]/30 text-[#fd0c96] hover:bg-[#fd0c96]/10"
          >
            {callAmount > 0 ? `Call ${callAmount}` : "Call"}
          </Button>
          <Button
            disabled={!gameEngine.playerTurn || balance < raiseAmount || isLoading}
            onClick={() => playerAction(currentBet === 0 ? "bet" : "raise")}
            className="bg-[#fd0c96] hover:bg-[#fd0c96]/80"
          >
            {currentBet === 0 ? `Bet ${raiseAmount}` : `Raise ${raiseAmount}`}
          </Button>
          <Button
            variant="outline"
            disabled={!gameEngine.playerTurn || isLoading}
            onClick={() => playerAction("fold")}
            className="border-red-500/30 text-red-500 hover:bg-red-500/10"
          >
            Fold
          </Button>
        </div>
      )}

      {/* Управление размером ставки */}
      {gameEngine.gameState !== "end" && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRaiseAmount(Math.max(BIG_BLIND, raiseAmount - 5))}
            disabled={isLoading}
            className="border-[#fd0c96]/30 text-[#fd0c96] hover:bg-[#fd0c96]/10"
          >
            -5
          </Button>
          <div className="flex-1 text-center text-white text-sm">Bet/Raise: {raiseAmount} OINK</div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRaiseAmount(Math.min(balance, raiseAmount + 5))}
            disabled={isLoading}
            className="border-[#fd0c96]/30 text-[#fd0c96] hover:bg-[#fd0c96]/10"
          >
            +5
          </Button>
        </div>
      )}

      {/* Новая игра */}
      {gameEngine.gameState === "end" && (
        <Button
          onClick={startNewHand}
          className="w-full bg-[#fd0c96] hover:bg-[#fd0c96]/80 mt-2"
          disabled={balance < BIG_BLIND || isLoading}
        >
          {isLoading ? "Loading..." : `New Hand (blinds ${SMALL_BLIND}/${BIG_BLIND} OINK)`}
        </Button>
      )}
    </div>
  )
}
