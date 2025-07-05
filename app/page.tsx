import type { Metadata } from "next"
import ClientPage from "./client-page"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://piggyworld.xyz"

export const metadata: Metadata = {
  title: "OINK World",
  description: "Enter the world of Piggy",
  openGraph: {
    title: "OINK World",
    description: "Enter the world of Piggy",
    images: [
      {
        url: `${BASE_URL}/og.jpg`,
        width: 1200,
        height: 630,
        alt: "OINK World",
      },
    ],
  },
  other: {
    "fc:frame": "vNext",
    "fc:frame:image": `${BASE_URL}/og.jpg`,
    "fc:frame:button:1": "Open Piggy World",
    "fc:frame:button:1:action": "post_redirect",
    "fc:frame:button:1:target": BASE_URL,
    "fc:frame:post_url": `${BASE_URL}/api/frame-events`,
    "fc:frame:embed": `{"appId":"0197c693-6369-5ad3-dd98-effee2596d7a","url":"${BASE_URL}","version":"vNext"}`,
  },
}

export default function HomePage() {
  return (
    <>
      <ClientPage />
    </>
  )
}
