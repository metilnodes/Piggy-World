"use client"

import type React from "react"
import { openExternalLink } from "@/lib/external-links"

// Компонент-ссылка, которая автоматически выбирает правильный способ открытия
export const SmartLink = ({
  href,
  children,
  className = "",
  ...props
}: {
  href: string
  children: React.ReactNode
  className?: string
  [key: string]: any
}) => {
  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    await openExternalLink(href)
  }

  return (
    <a href={href} onClick={handleClick} className={className} {...props}>
      {children}
    </a>
  )
}
