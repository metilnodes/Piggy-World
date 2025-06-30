"use client"

export function EnvTest() {
  return (
    <div className="p-4 bg-gray-100 rounded">
      <p>Base URL: {process.env.NEXT_PUBLIC_BASE_URL || "Not set - using fallback"}</p>
      <p>Fallback URL: https://v0-eban9in.vercel.app</p>
    </div>
  )
}
