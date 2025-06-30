// Простой кэш для баланса пользователей
const balanceCache = new Map<string, { balance: number; timestamp: number }>()
const CACHE_TTL = 5000 // 5 секунд

export function getCachedBalance(fid: string): number | null {
  const cached = balanceCache.get(fid)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.balance
  }
  return null
}

export function setCachedBalance(fid: string, balance: number): void {
  balanceCache.set(fid, { balance, timestamp: Date.now() })
}

export function clearBalanceCache(fid: string): void {
  balanceCache.delete(fid)
}
