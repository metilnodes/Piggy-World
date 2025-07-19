"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import { X } from "lucide-react"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  username?: string // Добавляем поле для имени пользователя
  children: React.ReactNode
  width?: string
  height?: string
}

export function Modal({ isOpen, onClose, title, username, children, width, height }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  // Добавим логирование для отладки
  useEffect(() => {
    if (isOpen && title === "Oink-Oink") {
      console.log("Modal opened for Oink-Oink with username:", username)
    }
  }, [isOpen, title, username])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.addEventListener("mousedown", handleClickOutside)
      // Prevent scrolling when modal is open
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.removeEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = "auto"
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4">
      <div
        ref={modalRef}
        className={`relative ${title === "Piggy Bank" ? "max-h-[850px]" : title === "Game Zone" ? "max-h-[900px]" : title === "Piggy AI" ? "max-h-[800px]" : "max-h-[690px]"} overflow-y-auto rounded-lg shadow-lg w-full max-w-md`}
        style={{
          width: width || "350px",
          maxHeight:
            title === "Piggy Bank"
              ? "850px"
              : title === "Game Zone"
                ? "900px"
                : title === "Piggy AI"
                  ? "800px"
                  : height || "750px",
          border: "2px solid #fd0c96",
          boxShadow: "0 0 10px #fd0c96, 0 0 20px #fd0c96",
          backgroundImage: "url('/background-grid.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div
          className="flex items-center justify-between p-3 border-b border-[#fd0c96]"
          style={{ background: "rgba(0, 0, 0, 0.4)" }}
        >
          <div className="flex items-center gap-2">
            <h2
              className="text-lg font-bold"
              style={{
                color: "#fd0c96",
                textShadow: "0 0 1px #fd0c96, 0 0 1px #fd0c96",
              }}
            >
              {title}
            </h2>
            {username && (
              <div className="flex items-center">
                <span className="text-[#fd0c96] text-sm opacity-70 mr-1">•</span>
                <span className="text-[#fd0c96] text-sm">{username}</span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-[#fd0c96] hover:text-white transition-colors"
            style={{ textShadow: "0 0 5px #fd0c96" }}
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4" style={{ background: "rgba(0, 0, 0, 0.4)" }}>
          {children}
        </div>
      </div>
    </div>
  )
}
