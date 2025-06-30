"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"

interface TokenInfo {
  name: string
  symbol: string
  iconUrl: string
  address: string
  price: number
  color: string
  decimals: number
}

interface AssetBreakdown {
  name: string
  symbol: string
  iconUrl: string
  balance: number
  formattedBalance: string
  value: number
  color: string
}

interface TreasuryStats {
  totalValue: number
  uniqueTokens: number
  proposals: number
  members: number
  breakdown: AssetBreakdown[]
  loading: boolean
  error: string | null
}

const treasuryAddress = "0x3076a0c4f44f1ec229c850380f3dd970094ca873"

const tokenList: TokenInfo[] = [
  {
    name: "PIGGY",
    symbol: "PIGGY",
    iconUrl: "/images/tokens/piggy-coin.svg",
    address: "0xe3CF8dBcBDC9B220ddeaD0bD6342E245DAFF934d", // Placeholder - need actual PIGGY address
    price: 0.00001,
    color: "text-[#fd0c96]",
    decimals: 18,
  },
  {
    name: "USDC",
    symbol: "USDC",
    iconUrl: "/images/tokens/usdc-coin.webp",
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC on Base
    price: 1,
    color: "text-blue-500",
    decimals: 6,
  },
  {
    name: "WETH",
    symbol: "WETH",
    iconUrl: "/images/tokens/weth-coin.webp",
    address: "0x4200000000000000000000000000000000000006", // WETH on Base
    price: 3000,
    color: "text-gray-400",
    decimals: 18,
  },
]

// ERC20 ABI for balanceOf and decimals
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
]

export function useTreasuryStats(): TreasuryStats {
  const [stats, setStats] = useState<TreasuryStats>({
    totalValue: 0,
    uniqueTokens: 0,
    proposals: 0,
    members: 0,
    breakdown: [],
    loading: true,
    error: null,
  })

  const fetchTokenBalances = async () => {
    try {
      const provider = new ethers.JsonRpcProvider("https://lb.drpc.org/ogrpc?network=base&dkey=AnLsO_P2YEOrtR1m_plgoZcgLuQT_3QR76KJnqSgS7QB")
      const breakdown: AssetBreakdown[] = []
      let totalValue = 0

      for (const token of tokenList) {
        try {
          const contract = new ethers.Contract(token.address, ERC20_ABI, provider)
          const balance = await contract.balanceOf(treasuryAddress)
          const decimals = await contract.decimals()

          const formattedBalance = Number.parseFloat(ethers.formatUnits(balance, decimals))
          const value = formattedBalance * token.price

          // Format balance display
          let displayBalance: string
          if (formattedBalance >= 1000000) {
            displayBalance = `${(formattedBalance / 1000000).toFixed(2)}M ${token.symbol}`
          } else if (formattedBalance >= 1000) {
            displayBalance = `${(formattedBalance / 1000).toFixed(2)}K ${token.symbol}`
          } else {
            displayBalance = `${formattedBalance.toFixed(4)} ${token.symbol}`
          }

          breakdown.push({
            name: token.name,
            symbol: token.symbol,
            iconUrl: token.iconUrl,
            balance: formattedBalance,
            formattedBalance: displayBalance,
            value: value,
            color: token.color,
          })

          totalValue += value
        } catch (error) {
          console.error(`Error fetching balance for ${token.name}:`, error)
          // Add token with 0 balance if there's an error
          breakdown.push({
            name: token.name,
            symbol: token.symbol,
            iconUrl: token.iconUrl,
            balance: 0,
            formattedBalance: `0.0000 ${token.symbol}`,
            value: 0,
            color: token.color,
          })
        }
      }

      return { breakdown, totalValue }
    } catch (error) {
      console.error("Error fetching token balances:", error)
      throw error
    }
  }

  const fetchSnapshotData = async () => {
    try {
      const query = `
        query {
          space(id: "basedpiggy.eth") {
            followersCount
            proposalsCount
          }
        }
      `

      const response = await fetch("https://hub.snapshot.org/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      })

      const data = await response.json()

      if (data.errors) {
        throw new Error(data.errors[0].message)
      }

      return {
        members: data.data?.space?.followersCount || 0,
        proposals: data.data?.space?.proposalsCount || 0,
      }
    } catch (error) {
      console.error("Error fetching Snapshot data:", error)
      // Return fallback values
      return {
        members: 10,
        proposals: 1,
      }
    }
  }

  const fetchAllData = async () => {
    try {
      setStats((prev) => ({ ...prev, loading: true, error: null }))

      const [tokenData, snapshotData] = await Promise.all([fetchTokenBalances(), fetchSnapshotData()])

      setStats({
        totalValue: tokenData.totalValue,
        uniqueTokens: tokenData.breakdown.filter((asset) => asset.balance > 0).length,
        proposals: snapshotData.proposals,
        members: snapshotData.members,
        breakdown: tokenData.breakdown,
        loading: false,
        error: null,
      })
    } catch (error) {
      console.error("Error fetching treasury stats:", error)
      setStats((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Failed to fetch data",
      }))
    }
  }

  useEffect(() => {
    fetchAllData()

    // Refresh data every 30 seconds
    const interval = setInterval(fetchAllData, 30000)

    return () => clearInterval(interval)
  }, [])

  return stats
}
