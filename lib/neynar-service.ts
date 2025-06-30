interface NeynarUser {
  fid: number
  username: string
  display_name: string
  pfp_url: string
  bio?: string
  follower_count?: number
  following_count?: number
}

interface NeynarBulkResponse {
  users: NeynarUser[]
}

export class NeynarService {
  private static apiKey = process.env.NEYNAR_API_KEY
  private static baseUrl = "https://api.neynar.com/v2/farcaster"

  /**
   * Получить пользователей по массиву usernames
   */
  static async getUsersByUsernames(usernames: string[]): Promise<NeynarUser[]> {
    console.log(`🔑 Checking NEYNAR_API_KEY: ${this.apiKey ? "FOUND" : "NOT FOUND"}`)

    if (!this.apiKey) {
      console.warn("⚠️ NEYNAR_API_KEY not found")
      return []
    }

    try {
      // Очищаем usernames от @ и пробелов
      const cleanUsernames = usernames.map((username) => username.replace(/^@/, "").trim().toLowerCase())

      console.log(`🔍 Neynar: Looking up usernames:`, cleanUsernames)

      const requestBody = { usernames: cleanUsernames }
      console.log(`📤 Neynar API request:`, JSON.stringify(requestBody, null, 2))

      const response = await fetch(`${this.baseUrl}/user/bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          api_key: this.apiKey,
        },
        body: JSON.stringify(requestBody),
      })

      console.log(`📥 Neynar API response status:`, response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ Neynar API error:`, response.status, errorText)
        return []
      }

      const data: NeynarBulkResponse = await response.json()
      console.log(`✅ Neynar response:`, JSON.stringify(data, null, 2))

      return data.users || []
    } catch (error) {
      console.error("❌ Error fetching users by usernames:", error)
      return []
    }
  }

  /**
   * Получить пользователей по массиву FIDs
   */
  static async getUsersByFids(fids: number[]): Promise<NeynarUser[]> {
    console.log(`🔑 Checking NEYNAR_API_KEY: ${this.apiKey ? "FOUND" : "NOT FOUND"}`)

    if (!this.apiKey) {
      console.warn("⚠️ NEYNAR_API_KEY not found")
      return []
    }

    try {
      const response = await fetch(`${this.baseUrl}/user/bulk?fids=${fids.join(",")}`, {
        method: "GET",
        headers: {
          accept: "application/json",
          api_key: this.apiKey,
        },
      })

      console.log(`📥 Neynar API response status:`, response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ Neynar API error:`, response.status, errorText)
        return []
      }

      const data: NeynarBulkResponse = await response.json()
      console.log(`✅ Neynar response:`, JSON.stringify(data, null, 2))

      return data.users || []
    } catch (error) {
      console.error("❌ Error fetching users by FIDs:", error)
      return []
    }
  }

  /**
   * Получить одного пользователя по username
   */
  static async getUserByUsername(username: string): Promise<NeynarUser | null> {
    console.log(`🔍 Looking up single user: "${username}"`)

    const users = await this.getUsersByUsernames([username])

    if (users.length === 0) {
      console.log(`❌ User "${username}" not found in Neynar response`)
      return null
    }

    const user = users.find((u) => u.username.toLowerCase() === username.toLowerCase())

    if (user) {
      console.log(`✅ Found user: ${user.username} (FID: ${user.fid})`)
    } else {
      console.log(`❌ User "${username}" not found in response users`)
    }

    return user || null
  }

  /**
   * Получить одного пользователя по FID
   */
  static async getUserByFid(fid: number): Promise<NeynarUser | null> {
    const users = await this.getUsersByFids([fid])
    return users[0] || null
  }

  /**
   * Resolve username to FID - utility function for tips
   */
  static async resolveUserFromUsername(username: string): Promise<number | null> {
    console.log(`🔍 Resolving username "${username}" to FID`)

    const user = await this.getUserByUsername(username)

    if (user) {
      console.log(`✅ Resolved "${username}" → FID: ${user.fid}`)
      return user.fid
    } else {
      console.log(`❌ Could not resolve "${username}" to FID`)
      return null
    }
  }
}

// Export the utility function for easier import
export const resolveUserFromUsername = NeynarService.resolveUserFromUsername.bind(NeynarService)
