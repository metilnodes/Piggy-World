"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { Send, Heart, Coins, AlertTriangle, RefreshCw } from "lucide-react"
import { useHybridAuth } from "@/hooks/useHybridAuth"
import { useBalance } from "@/contexts/balance-context"
import { resolveUsernameToFid } from "@/lib/client-neynar"
import { openExternalLink } from "@/lib/external-links"

interface ChatMessage {
  id: string
  userId: string
  username: string
  displayName?: string
  pfp?: string
  message: string
  timestamp: string
  reactions?: {
    likes: number
    hasLiked: boolean
    isSystemMessage?: boolean
  }
  isOptimistic?: boolean
  isTipsCommand?: boolean
}

export function OinkOink() {
  // Используем новый BalanceContext
  const {
    balance,
    isLoading: balanceLoading,
    error: balanceError,
    fetchBalance,
    subtractFromBalance,
    refreshBalance,
  } = useBalance()
  const { fid, username, displayName, pfpUrl } = useHybridAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [dbConnectionFailed, setDbConnectionFailed] = useState(false)
  const [isPolling, setIsPolling] = useState(isPolling)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastSuccessfulFetch, setLastSuccessfulFetch] = useState<Date | null>(null)
  const [currentUser, setCurrentUser] = useState<any | null>(null)
  const [optimisticMessageId, setOptimisticMessageId] = useState(0)

  // Добавить useRef для input поля в начале компонента, после других хуков:
  const inputRef = useRef<HTMLInputElement>(null)

  // Рефы для интервалов
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const balanceIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Функция для создания fallback пользователя
  const createFallbackUser = useCallback(() => {
    const fallbackUser = {
      fid: "guest_" + Math.floor(Math.random() * 10000),
      username: "guest" + Math.floor(Math.random() * 1000),
      displayName: "Guest User",
      pfp: null,
    }

    console.log("🔄 Created fallback user:", fallbackUser)
    localStorage.setItem("farcasterUser", JSON.stringify(fallbackUser))
    return fallbackUser
  }, [])

  // Инициализация пользователя
  useEffect(() => {
    let user = null

    if (fid && username) {
      user = {
        fid,
        username,
        displayName: displayName || username,
        pfp: pfpUrl,
      }
      console.log("👤 OinkOink: Using HybridAuth user:", user.username, "FID:", user.fid)
    } else {
      try {
        // ИСПРАВЛЕНО: Приоритет hybridUser над farcasterUser
        const savedUser = localStorage.getItem("hybridUser") || localStorage.getItem("farcasterUser")
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser)
          if (parsedUser.fid && parsedUser.username) {
            user = parsedUser
            console.log("👤 OinkOink: Using saved user:", user.username, "FID:", user.fid)
          } else {
            user = createFallbackUser()
            console.log("👤 OinkOink: Created fallback user:", user.username, "FID:", user.fid)
          }
        } else {
          user = createFallbackUser()
          console.log("👤 OinkOink: Created fallback user (no saved):", user.username, "FID:", user.fid)
        }
      } catch (error) {
        console.error("❌ Error parsing saved user:", error)
        user = createFallbackUser()
        console.log("👤 OinkOink: Created fallback user (error):", user.username, "FID:", user.fid)
      }
    }

    if (user && user.fid && user.username) {
      console.log("🚀 Setting current user:", user)
      setCurrentUser(user)
    } else {
      console.error("❌ Failed to create valid user")
      setError("Failed to initialize user")
      setIsLoading(false)
    }
  }, [fid, username, displayName, pfpUrl, createFallbackUser])

  // Инициализация чата когда пользователь готов
  useEffect(() => {
    if (currentUser && currentUser.fid && currentUser.username) {
      initializeChat()
    }
  }, [currentUser])

  // Обновление баланса при монтировании компонента
  useEffect(() => {
    if (currentUser?.fid) {
      refreshBalance()
    }
  }, [currentUser, refreshBalance])

  const initializeChat = async () => {
    if (!currentUser) return

    try {
      console.log("🚀 Initializing chat for user:", currentUser)
      setIsLoading(true)
      setError(null)

      // Загружаем начальные данные
      await Promise.all([
        fetchMessages(true), // initial load
        fetchBalance(), // используем BalanceContext
      ])

      // Запускаем polling
      startPolling()
    } catch (error) {
      console.error("❌ Failed to initialize chat:", error)
      setError("Failed to initialize chat")
    } finally {
      setIsLoading(false)
    }
  }

  // Запуск polling с правильными интервалами
  const startPolling = () => {
    // Очищаем существующие интервалы
    stopPolling()

    // Polling сообщений каждые 2 секунды
    pollIntervalRef.current = setInterval(() => {
      if (document.visibilityState === "visible" && !isSending && !isRefreshing && currentUser) {
        setIsPolling(true)
        fetchMessages(false)
          .catch((error) => console.error("❌ Error polling messages:", error))
          .finally(() => setIsPolling(false))
      }
    }, 5000)

    // Polling баланса каждые 5 секунд
    balanceIntervalRef.current = setInterval(() => {
      if (document.visibilityState === "visible" && currentUser) {
        fetchBalance().catch((error) => console.error("❌ Error polling balance:", error))
      }
    }, 5000)

    console.log("✅ Polling started")
  }

  // Остановка polling
  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }
    if (balanceIntervalRef.current) {
      clearInterval(balanceIntervalRef.current)
      balanceIntervalRef.current = null
    }
    console.log("🛑 Polling stopped")
  }

  const fetchMessages = async (isInitial = false) => {
    if (!currentUser) return

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const response = await fetch(`/api/chat/messages?limit=50&fid=${currentUser.fid}`, {
        signal: controller.signal,
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        if (response.status === 500) {
          setDbConnectionFailed(true)
          return
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.messages && Array.isArray(data.messages)) {
        const filteredMessages = data.messages.filter(
          (msg: any) => msg && msg.userId !== "system" && msg.username && msg.message,
        )

        // Проверяем есть ли новые сообщения
        const newMessages = filteredMessages.filter((msg: any) => {
          return !messages.some((existingMsg) => existingMsg.id === msg.id)
        })

        if (newMessages.length > 0 || isInitial) {
          console.log(
            `📨 ${isInitial ? "Loading" : "Found"} ${newMessages.length} ${isInitial ? "initial" : "new"} messages`,
          )

          // Обновляем состояние сообщений
          setMessages(filteredMessages)

          // Проверяем tips команды для текущего пользователя
          if (!isInitial && newMessages.length > 0) {
            const tipsToMe = newMessages.filter(
              (msg) =>
                msg.message.toLowerCase().includes(`!tips ${currentUser.username}`) ||
                msg.message.toLowerCase().includes(`!tips @${currentUser.username}`),
            )

            if (tipsToMe.length > 0) {
              console.log(`💰 Found ${tipsToMe.length} tips commands for me, updating balance...`)
              // Обновляем баланс с задержкой
              setTimeout(() => fetchBalance(), 1000)
            }
          }

          // Прокручиваем к последнему сообщению
          setTimeout(() => scrollToBottom(), 100)
        }

        setDbConnectionFailed(false)
        setLastSuccessfulFetch(new Date())
      }
    } catch (error: any) {
      console.error("❌ Error fetching messages:", error)
      if (isInitial) {
        setDbConnectionFailed(true)
      }
    }
  }

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      const container = chatContainerRef.current
      container.scrollTop = container.scrollHeight
    }
  }

  // Оптимистичное добавление сообщения
  const addOptimisticMessage = (message: string, isTipsCommand = false) => {
    if (!currentUser) return null

    const optimisticMsg: ChatMessage = {
      id: `optimistic_${optimisticMessageId}`,
      userId: currentUser.fid,
      username: currentUser.username,
      displayName: currentUser.displayName,
      pfp: currentUser.pfp,
      message,
      timestamp: new Date().toISOString(),
      reactions: { likes: 0, hasLiked: false },
      isOptimistic: true,
      isTipsCommand,
    }

    setOptimisticMessageId((prev) => prev + 1)
    setMessages((prev) => [...prev, optimisticMsg])

    setTimeout(() => scrollToBottom(), 100)
    return optimisticMsg.id
  }

  // Удаление оптимистичного сообщения
  const removeOptimisticMessage = (id: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id))
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || !currentUser || isSending) return

    const messageText = inputMessage.trim()
    const isTipsCommand = messageText.toLowerCase().startsWith("!tips")

    setInputMessage("") // Очищаем поле сразу
    inputRef.current?.focus()

    setIsSending(true)

    try {
      if (isTipsCommand) {
        await processTipsCommand(messageText)
        return
      }

      // Добавляем оптимистичное сообщение
      const optimisticId = addOptimisticMessage(messageText, false)
      if (!optimisticId) {
        throw new Error("Failed to create optimistic message")
      }

      const response = await fetch("/api/chat/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fid: currentUser.fid,
          username: currentUser.username,
          displayName: currentUser.displayName,
          pfpUrl: currentUser.pfp,
          message: messageText,
        }),
      })

      if (response.ok) {
        // Удаляем оптимистичное сообщение
        removeOptimisticMessage(optimisticId)

        // Принудительно обновляем сообщения через короткое время
        setTimeout(() => {
          fetchMessages(false)
        }, 500)
      } else {
        removeOptimisticMessage(optimisticId)
        throw new Error("Failed to send message")
      }
    } catch (error) {
      console.error("❌ Error sending message:", error)
      setError("Failed to send message")
    } finally {
      setIsSending(false)
    }
  }

  const processTipsCommand = async (message: string) => {
    if (!currentUser) {
      setError("User data not available")
      return false
    }

    if (dbConnectionFailed) {
      setError("Can't send tips: database error.")
      return false
    }

    const tipsRegex = /^!tips\s+(\S+)\s+(\d+)$/i
    const match = message.match(tipsRegex)

    if (!match) {
      setError("Incorrect command. Use: !tips username amount")
      return false
    }

    const toUsername = match[1].replace("@", "") // убираем @ если есть
    const amount = Number.parseInt(match[2], 10)

    if (amount <= 0) {
      setError("Amount must be greater than 0")
      return false
    }

    // ИСПРАВЛЕНО: Проверяем баланс через BalanceContext
    const currentBalance = balance || 0
    if (amount > currentBalance) {
      console.log(`❌ Insufficient balance: trying to send ${amount}, but only have ${currentBalance}`)
      setError(`Insufficient balance. You have ${currentBalance} OINK, but trying to send ${amount}`)
      return false
    }

    // Добавляем оптимистичное сообщение
    const optimisticId = addOptimisticMessage(message, true)
    if (!optimisticId) {
      setError("Failed to create message")
      return false
    }

    try {
      console.log(`🔍 Looking up recipient: ${toUsername}`)

      // ШАГ 1: Получаем FID получателя через серверный API
      const toFid = await resolveUsernameToFid(toUsername)

      if (!toFid) {
        removeOptimisticMessage(optimisticId)
        setError(`User ${toUsername} not found on Farcaster`)
        return false
      }

      console.log(`✅ Found recipient: ${toUsername} (FID: ${toFid})`)

      // ШАГ 2: Отправляем tip с реальными FID
      console.log(
        `💸 Sending tip: ${amount} OINK from ${currentUser.username} (${currentUser.fid}) to ${toUsername} (${toFid})`,
      )

      const response = await fetch("/api/send-tip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fromFid: currentUser.fid,
          fromUsername: currentUser.username,
          toFid: toFid.toString(), // РЕАЛЬНЫЙ FID от Neynar через сервер
          toUsername: toUsername,
          amount: amount,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        removeOptimisticMessage(optimisticId)
        setError(`Error: ${data.error || "Failed to process transaction"}`)
        return false
      }

      console.log("✅ Tip sent successfully:", data)

      // Remove optimistic message
      removeOptimisticMessage(optimisticId)

      // ИСПРАВЛЕНО: Используем refreshBalance для немедленного обновления
      await refreshBalance()

      // Send message about transaction
      const messageResponse = await fetch("/api/chat/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fid: currentUser.fid,
          username: currentUser.username,
          displayName: currentUser.displayName,
          pfpUrl: currentUser.pfp,
          message: message,
        }),
      })

      if (messageResponse.ok) {
        // Force refresh messages
        setTimeout(() => {
          fetchMessages(false)
        }, 1000)
      }

      // Show success message
      setError(null)
      console.log(`🎉 Successfully sent ${amount} OINK to ${toUsername}. Balance updated.`)

      return true
    } catch (error) {
      console.error("❌ Error processing tips:", error)
      removeOptimisticMessage(optimisticId)
      setError("Failed to process transaction")
      return false
    } finally {
      setIsSending(false)
    }
  }

  const refreshMessages = useCallback(async () => {
    if (isRefreshing || !currentUser) return

    setIsRefreshing(true)
    try {
      await Promise.all([fetchMessages(true), fetchBalance()])
    } catch (error) {
      console.error("❌ Error refreshing messages:", error)
    } finally {
      setIsRefreshing(false)
    }
  }, [currentUser, isRefreshing, fetchBalance])

  const likeMessage = async (messageId: string) => {
    if (dbConnectionFailed || !currentUser) return

    try {
      const messageIndex = messages.findIndex((msg) => msg.id === messageId)
      if (messageIndex === -1) return

      const message = messages[messageIndex]
      const hasLiked = message.reactions?.hasLiked || false

      // Оптимистичное обновление лайка
      const updatedMessages = [...messages]
      updatedMessages[messageIndex] = {
        ...message,
        reactions: {
          likes: hasLiked ? (message.reactions?.likes || 1) - 1 : (message.reactions?.likes || 0) + 1,
          hasLiked: !hasLiked,
        },
      }
      setMessages(updatedMessages)

      const response = await fetch("/api/chat/likes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messageId,
          fid: currentUser.fid,
          action: hasLiked ? "unlike" : "like",
        }),
      })

      if (!response.ok) {
        // Откатываем изменения если запрос не удался
        setMessages(messages)
      } else {
        // Обновляем сообщения через короткое время
        setTimeout(() => {
          fetchMessages(false)
        }, 500)
      }
    } catch (error) {
      console.error("❌ Error liking message:", error)
      setMessages(messages)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Очистка интервалов при размонтировании
  useEffect(() => {
    return () => {
      stopPolling()
    }
  }, [])

  // Остановка polling при потере фокуса
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        console.log("🔇 Page hidden, reducing polling frequency")
      } else {
        console.log("👁️ Page visible, resuming normal polling")
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [])

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-[520px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#fd0c96] mx-auto mb-2"></div>
          <p className="text-gray-400 text-sm">Initializing user...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3 h-[520px] flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Coins className="h-6 w-6 text-[#fd0c96]" />
          <h2 className="text-lg font-bold text-[#fd0c96]">Balance:</h2>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-[#fd0c96] font-medium text-lg">
            {balanceLoading ? "..." : balance !== null ? balance : "..."} OINK
          </p>
          {isPolling && <div className="w-2 h-2 bg-[#fd0c96] rounded-full animate-pulse"></div>}
        </div>
      </div>

      <div className="text-xs text-center text-gray-400 mb-2">
        Logged in as: <span className="text-[#fd0c96] font-bold">@{currentUser.username}</span>
        {currentUser.displayName !== currentUser.username && (
          <span className="text-white"> ({currentUser.displayName})</span>
        )}
      </div>

      {(dbConnectionFailed || balanceError) && (
        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-2 mb-2 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <div className="flex-1">
            <p className="text-yellow-500 text-xs">
              {balanceError ? "Balance service issue" : "Connection issue"}. Retrying...
            </p>
            {lastSuccessfulFetch && (
              <p className="text-gray-400 text-xs">Last update: {lastSuccessfulFetch.toLocaleTimeString()}</p>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-2 mb-2">
          <p className="text-red-500 text-xs">{error}</p>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300 text-xs mt-1 underline">
            Dismiss
          </button>
        </div>
      )}

      <div className="h-[315px] border border-[#fd0c96] rounded-lg relative">
        <button
          onClick={refreshMessages}
          disabled={isRefreshing || isLoading}
          className="absolute top-2 right-6 p-1 bg-black/80 rounded-full hover:bg-[#fd0c96]/20 transition-colors z-10 border border-[#fd0c96]/30"
          title="Refresh messages"
        >
          <RefreshCw className={`h-4 w-4 text-[#fd0c96] ${isRefreshing ? "animate-spin" : ""}`} />
        </button>

        <div ref={chatContainerRef} className="h-full overflow-y-auto px-10 py-3">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#fd0c96]"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-400 p-4">No messages yet. Be the first to write!</div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`mb-3 flex ${msg.userId === currentUser.fid ? "justify-end" : "justify-start"} ${
                  msg.isOptimistic ? "opacity-70" : ""
                }`}
              >
                <div className="flex items-end gap-2">
                  {msg.userId === currentUser.fid && (msg.reactions?.likes || 0) > 0 && (
                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                      <Heart className="h-3 w-3 text-red-500" fill="#ef4444" />
                      <span>{msg.reactions?.likes}</span>
                    </div>
                  )}

                  <div className="relative group">
                    <div
                      className={`inline-block max-w-[280px] p-2 rounded-lg ${
                        msg.userId === currentUser.fid ? "bg-[#fd0c96] text-black" : "bg-gray-800 text-white"
                      }`}
                      onDoubleClick={() => !msg.isOptimistic && likeMessage(msg.id)}
                    >
                      {msg.userId !== currentUser.fid && (
                        <p className="text-xs font-bold mb-1 text-white">
                          {msg.username || msg.displayName || "Unknown"}
                        </p>
                      )}
                      <p className="break-words">{msg.message}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {formatTime(msg.timestamp)}
                        {msg.isOptimistic && msg.isTipsCommand && <span className="ml-1">⏳</span>}
                      </p>
                    </div>

                    {!msg.isOptimistic && (
                      <button
                        className={`absolute ${
                          msg.userId === currentUser.fid ? "-left-8" : "-right-8"
                        } bottom-1 bg-black rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity`}
                        onClick={() => likeMessage(msg.id)}
                        disabled={dbConnectionFailed}
                      >
                        <Heart
                          className={`h-3 w-3 ${msg.reactions?.hasLiked ? "text-red-500 fill-red-500" : "text-gray-400"}`}
                        />
                      </button>
                    )}
                  </div>

                  {msg.userId !== currentUser.fid && (msg.reactions?.likes || 0) > 0 && (
                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                      <Heart className="h-3 w-3 text-red-500" fill="#ef4444" />
                      <span>{msg.reactions?.likes}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="flex space-x-2">
        <input
          ref={inputRef}
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 px-3 py-2 bg-black border border-[#fd0c96] rounded-md focus:outline-none focus:ring-2 focus:ring-[#fd0c96] text-white"
          placeholder="Type here..."
          disabled={isSending}
        />
        <button onClick={sendMessage} className="neon-button p-2" disabled={!inputMessage.trim() || isSending}>
          <Send size={20} />
        </button>
      </div>

      <div className="text-xs text-gray-400 text-center space-y-2">
        <div>
          <p>
            Command to send OINK:
            <br />
            <span className="text-[#fd0c96]">!tips username amount</span>
          </p>
        </div>
        <div className="flex justify-center gap-2">
          <a
            href="https://discord.gg/superform"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs py-1 px-3 rounded-full transition-colors"
          >
            Join Discord
          </a>
          <button
            onClick={() => openExternalLink("https://t.me/piggyisforthepeople")}
            className="inline-block bg-[#0088cc] hover:bg-[#0077b5] text-white text-xs py-1 px-3 rounded-full transition-colors"
          >
            Join Telegram
          </button>
        </div>
      </div>
    </div>
  )
}
