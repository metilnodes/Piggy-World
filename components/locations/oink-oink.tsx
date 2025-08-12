"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useAppContext } from "@/contexts/app-context"
import { MessageCircle, Send, Heart, ExternalLink, Users } from "lucide-react"
import { SmartLink } from "@/components/smart-link"

interface Message {
  id: string
  username: string
  message: string
  timestamp: string
  likes: number
  userLiked: boolean
}

interface OinkOinkProps {
  username?: string | null
}

export function OinkOink({ username }: OinkOinkProps) {
  const { balance, updateBalance } = useAppContext()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      setIsLoadingMessages(true)
      const response = await fetch("/api/chat/messages")
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setIsLoadingMessages(false)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading) return

    // Проверяем, есть ли username
    if (!username) {
      alert("Username not available. Please try refreshing the app.")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/chat/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          message: newMessage.trim(),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setNewMessage("")
        // Обновляем баланс если получили награду
        if (data.newBalance) {
          updateBalance(data.newBalance)
        }
        // Перезагружаем сообщения
        await fetchMessages()
      } else {
        const errorData = await response.json()
        alert(errorData.error || "Failed to send message")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Failed to send message")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLikeMessage = async (messageId: string) => {
    if (!username) return

    try {
      const response = await fetch("/api/chat/likes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messageId,
          username: username,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Обновляем баланс если получили награду
        if (data.newBalance) {
          updateBalance(data.newBalance)
        }
        // Перезагружаем сообщения для обновления лайков
        await fetchMessages()
      }
    } catch (error) {
      console.error("Error liking message:", error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <MessageCircle className="h-6 w-6 text-[#fd0c96]" />
        <h2 className="text-lg font-bold text-[#fd0c96]">Oink-Oink Chat</h2>
      </div>

      {/* User Info */}
      <div className="bg-black/30 p-3 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[#fd0c96]" />
            <span className="text-sm text-gray-300">{username ? `Logged in as: ${username}` : "Guest user"}</span>
          </div>
          <div className="text-sm text-[#fd0c96] font-semibold">{balance.toLocaleString()} PIGGY</div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 bg-black/20 rounded-lg p-3 overflow-y-auto max-h-[300px] min-h-[200px]">
        {isLoadingMessages ? (
          <div className="text-center text-gray-400 text-sm">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-400 text-sm">No messages yet. Be the first to say something!</div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className="bg-black/30 p-3 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#fd0c96] text-sm">{msg.username}</span>
                    <span className="text-xs text-gray-400">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <button
                    onClick={() => handleLikeMessage(msg.id)}
                    className={`flex items-center gap-1 text-xs transition-colors ${
                      msg.userLiked ? "text-red-400" : "text-gray-400 hover:text-red-400"
                    }`}
                    disabled={!username}
                  >
                    <Heart className={`h-3 w-3 ${msg.userLiked ? "fill-current" : ""}`} />
                    <span>{msg.likes}</span>
                  </button>
                </div>
                <p className="text-sm text-gray-200 break-words">{msg.message}</p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={username ? "Type your message..." : "Login required to chat"}
          disabled={!username || isLoading}
          className="flex-1 bg-black/30 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#fd0c96] disabled:opacity-50"
          maxLength={280}
        />
        <button
          onClick={handleSendMessage}
          disabled={!username || !newMessage.trim() || isLoading}
          className="bg-[#fd0c96] hover:bg-[#fd0c96]/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>

      {/* Rewards Info */}
      <div className="bg-black/20 p-3 rounded-lg">
        <h4 className="text-sm font-semibold text-[#fd0c96] mb-2">Chat Rewards</h4>
        <div className="text-xs text-gray-300 space-y-1">
          <div>• Send message: +5 PIGGY</div>
          <div>• Receive like: +2 PIGGY</div>
          <div>• Give like: +1 PIGGY</div>
        </div>
      </div>

      {/* External Links */}
      <div className="flex flex-col gap-2">
        <SmartLink
          href="https://warpcast.com/~/channel/piggyworld"
          className="w-full neon-button flex items-center justify-center relative text-sm"
        >
          <span className="mx-auto">WARPCAST CHANNEL</span>
          <ExternalLink className="h-3 w-3 absolute right-3" />
        </SmartLink>

        <SmartLink
          href="https://t.me/piggyworldchat"
          className="w-full neon-button flex items-center justify-center relative text-sm"
        >
          <span className="mx-auto">TELEGRAM</span>
          <ExternalLink className="h-3 w-3 absolute right-3" />
        </SmartLink>
      </div>
    </div>
  )
}
