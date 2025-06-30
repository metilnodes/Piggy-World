import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { BalanceProvider } from "@/contexts/balance-context"

let BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://piggyworld.xyz"
BASE_URL = BASE_URL.replace(/\/$/, "")

export const metadata: Metadata = {
  title: "Piggy World",
  description: "Interactive Piggy ecosystem",
  openGraph: {
    title: "Piggy World",
    description: "Interactive Piggy ecosystem",
    url: "https://piggyworld.xyz/",
    siteName: "Piggy World",
    images: [
      {
        url: "https://piggyworld.xyz/imageUrl.png",
        width: 1200,
        height: 630,
        alt: "Piggy World Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  other: {
    // Farcaster Frame metadata
    "fc:frame": JSON.stringify({
      version: "next",
      imageUrl: "https://piggyworld.xyz/imageUrl.png",
      button: {
        title: "Join Piggy World",
        action: {
          type: "launch_frame",
          name: "Piggy World",
          url: "https://piggyworld.xyz/",
          splashImageUrl: "https://piggyworld.xyz/icon.png",
          splashBackgroundColor: "#000000",
        },
      },
    }),
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="flex items-center justify-center min-h-screen bg-black">
        <BalanceProvider>
          <div className="w-[424px] h-[695px] overflow-hidden relative bg-black shadow-lg rounded-xl">{children}</div>
        </BalanceProvider>
      </body>
    </html>
  )
}
