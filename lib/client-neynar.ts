export async function resolveUsernameToFid(username: string): Promise<number | null> {
  try {
    const response = await fetch("/api/resolve-username", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    })

    const data = await response.json()

    if (!response.ok || !data?.fid) {
      console.error(`❌ Failed to resolve username ${username}:`, data)
      return null
    }

    console.log(`✅ Resolved ${username} to FID: ${data.fid}`)
    return data.fid
  } catch (error) {
    console.error(`❌ Error resolving username ${username}:`, error)
    return null
  }
}

export async function resolveUserFromUsername(username: string): Promise<number> {
  const result = await resolveUsernameToFid(username)
  if (result === null) {
    throw new Error(`User ${username} not found on Farcaster`)
  }
  return result
}
