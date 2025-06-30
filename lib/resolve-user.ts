import { NeynarService } from "./neynar-service"

/**
 * Преобразует username в FID через Neynar API
 */
export async function resolveUserFromUsername(username: string): Promise<number | null> {
  try {
    console.log(`🔍 Resolving username "${username}" to FID...`)

    const user = await NeynarService.getUserByUsername(username)

    if (!user) {
      console.log(`❌ User "${username}" not found on Farcaster`)
      return null
    }

    console.log(`✅ Resolved "${username}" → FID: ${user.fid}`)
    return user.fid
  } catch (error) {
    console.error(`❌ Error resolving username "${username}":`, error)
    return null
  }
}
