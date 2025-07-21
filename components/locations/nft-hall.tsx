"use client"

import { useState } from "react"
import { RefreshCw, ExternalLink, Clock, Sparkles } from "lucide-react"
import { openExternalLink } from "@/lib/external-links"

// Типы для новостей
interface NewsItem {
  id: string
  title: string
  summary?: string
  imageUrl?: string
  category: "breaking" | "update" | "alert" | "new" | "tip"
  timestamp: string
  url: string
}

// Мок данных с pnn.lol
const mockPnnNews: NewsItem[] = [
  {
    id: "10",
    title: "PIGGY IDENTITY CREATED",
    summary: "Not KYC'd. Not doxxed. Just 100% OINK-verified.",
    imageUrl: "/images/piggy-identity-preview.jpg",
    category: "new",
    timestamp: "2 days ago",
    url: "https://id.piggyworld.xyz/",
  },
  {
    id: "0",
    title: "Welcome to PiggyDAO",
    summary: "The onchain organization that oversees the future direction of PIGGY.",
    imageUrl: "/images/piggy-dao.png",
    category: "breaking",
    timestamp: "10 days ago",
    url: "https://piggydao.xyz/",
  },
  {
    id: "1",
    title: "PIGGYS CAN FLY?? SUPERFORM ANNOUNCES $UP",
    summary:
      "Superform has officially announced their governance token $UP, sending shockwaves through the DeFi community. The token is expected to launch in Q2 2024.",
    imageUrl: "/flying-pig-up-token.png",
    category: "breaking",
    timestamp: "15 days ago",
    url: "https://www.pnn.lol/",
  },
  {
    id: "2",
    title: "Spectra Market for Superform Points Launches",
    summary:
      "Spectra has launched a new market for Superform Points, allowing users to trade their points ahead of the $UP token launch.",
    category: "new",
    timestamp: "1 day ago",
    url: "https://www.pnn.lol/",
  },
  {
    id: "3",
    title: "Superform V2 Announced with Multi-chain Support",
    summary:
      "Superform has announced V2 of their protocol with expanded multi-chain support, including Arbitrum, Optimism, and Base.",
    category: "update",
    timestamp: "3 days ago",
    url: "https://www.pnn.lol/",
  },
  {
    id: "4",
    title: "Pendle Market for Superform Points Sees Record Volume",
    summary:
      "The Pendle market for Superform Points has seen record trading volume as anticipation builds for the $UP token launch.",
    category: "alert",
    timestamp: "20 days ago",
    url: "https://www.pnn.lol/",
  },
  {
    id: "5",
    title: "Term Market for Superform Points Opens with High Demand",
    summary:
      "The Term market for Superform Points has opened with high demand, with prices surging in the first day of trading.",
    category: "update",
    timestamp: "8 days ago",
    url: "https://www.pnn.lol/",
  },
  {
    id: "6",
    title: "Pigs are really cute, experts confirm",
    summary:
      "In a groundbreaking study, experts have confirmed what we all suspected: pigs are indeed really cute. The study involved showing pictures of pigs to 1,000 participants.",
    category: "tip",
    timestamp: "25 days ago",
    url: "https://www.pnn.lol/",
  },
  {
    id: "7",
    title: "Pigs are still really cute",
    summary:
      "In a follow-up study, researchers have confirmed that pigs remain really cute. This groundbreaking discovery has shocked absolutely no one.",
    category: "alert",
    timestamp: "40 days ago",
    url: "https://www.pnn.lol/",
  },
  {
    id: "8",
    title: "Experts are saying pigs are really cute",
    summary:
      "A panel of international experts has convened to discuss the cuteness of pigs. Their unanimous conclusion: pigs are indeed really cute.",
    category: "new",
    timestamp: "1 day ago",
    url: "https://www.pnn.lol/",
  },
  {
    id: "9",
    title: "Dr. Hamilton Pork: 'Piggy's AI is so advanced, it's started writing poetry'",
    summary:
      "Renowned AI expert Dr. Hamilton Pork claims that Piggy AI has reached a new level of sophistication, with the system now capable of writing poetry about DeFi protocols.",
    category: "breaking",
    timestamp: "3 days ago",
    url: "https://www.pnn.lol/",
  },
]

// Компонент для отображения категории новости
const NewsCategoryBadge = ({ category }: { category: NewsItem["category"] }) => {
  const categoryStyles = {
    breaking: "bg-red-500",
    update: "bg-green-500",
    alert: "bg-amber-500",
    new: "bg-blue-500",
    tip: "bg-emerald-500",
  }

  const categoryLabels = {
    breaking: "BREAKING",
    update: "UPDATE",
    alert: "ALERT",
    new: "NEW",
    tip: "TIP",
  }

  return (
    <span className={`${categoryStyles[category]} text-white text-xs px-2 py-0.5 rounded-full uppercase font-bold`}>
      {categoryLabels[category]}
    </span>
  )
}

export function NFTHall() {
  const [news, setNews] = useState<NewsItem[]>(mockPnnNews)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedNewsId, setSelectedNewsId] = useState<string | null>(news[0]?.id || null)
  const [marketPulseNews, setMarketPulseNews] = useState<NewsItem[]>(
    mockPnnNews.filter((item) => item.category === "tip" || item.category === "alert"),
  )

  const selectedNews = news.find((item) => item.id === selectedNewsId) || news[0]

  // Фунция для обновления новостей (симуляция)
  const refreshNews = () => {
    setIsLoading(true)

    // Симулируем задержку загрузки
    setTimeout(() => {
      // Перемешиваем новости для имитации обновления
      const shuffledNews = [...news].sort(() => Math.random() - 0.5)
      setNews(shuffledNews)

      // Обновляем Market Pulse
      setMarketPulseNews(
        shuffledNews.filter((item) => item.category === "tip" || item.category === "alert").slice(0, 3),
      )

      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="space-y-4">
      {/* Заголовок и кнопка обновления */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <h2 className="text-lg font-bold text-[#fd0c96]">Piggy News</h2>
        </div>
        <button
          onClick={refreshNews}
          disabled={isLoading}
          className="flex items-center px-3 py-1 text-sm border border-[#fd0c96] rounded-md text-[#fd0c96] hover:bg-[#fd0c96]/10"
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Бегущая строка с новостями */}
      <div className="bg-black border border-[#fd0c96]/30 rounded-lg p-2 overflow-hidden">
        <div className="whitespace-nowrap animate-marquee">
          {news.map((item, index) => (
            <span key={item.id} className="inline-block mx-4">
              <span className="text-[#fd0c96] font-bold">{item.title}</span>
              <span className="mx-2 text-gray-400">•</span>
            </span>
          ))}
        </div>
      </div>

      {/* Основная новость */}
      {selectedNews && (
        <div className="bg-black border border-[#fd0c96]/30 rounded-lg overflow-hidden">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <NewsCategoryBadge category={selectedNews.category} />
              <div className="flex items-center text-xs text-gray-400">
                <Clock className="h-3 w-3 mr-1" />
                {selectedNews.timestamp}
              </div>
            </div>

            <h3 className="text-xl font-bold mb-3 text-white">{selectedNews.title}</h3>

            {selectedNews.imageUrl && (
              <div className="mb-4">
                <img
                  src={selectedNews.imageUrl || "/placeholder.svg"}
                  alt={selectedNews.title}
                  className="w-full h-auto rounded-lg"
                />
              </div>
            )}

            <p className="text-sm text-gray-300 mb-4">{selectedNews.summary}</p>

            <button
              onClick={() => openExternalLink(selectedNews.url)}
              className="neon-button py-1 px-3 text-sm flex items-center inline-flex"
            >
              {selectedNews.id === "0" ? "Checkout" : selectedNews.id === "10" ? "Create Identity" : "Read Full Story"}
              <ExternalLink className="h-3 w-3 ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* Список последних новостей */}
      <div>
        <h3 className="text-sm font-medium text-[#fd0c96] mb-2">Latest News</h3>
        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
          {news.map((item) => (
            <div
              key={item.id}
              className={`p-2 rounded-lg cursor-pointer transition-colors ${
                item.id === selectedNewsId
                  ? "bg-[#fd0c96]/20 border border-[#fd0c96]/30"
                  : "bg-black/50 hover:bg-[#fd0c96]/10"
              }`}
              onClick={() => setSelectedNewsId(item.id)}
            >
              <div className="flex items-center justify-between mb-1">
                <NewsCategoryBadge category={item.category} />
                <span className="text-xs text-gray-400">{item.timestamp}</span>
              </div>
              <h4 className="text-sm font-medium line-clamp-1 text-white">{item.title}</h4>
            </div>
          ))}
        </div>
      </div>

      {/* Market Pulse */}
      <div>
        <h3 className="text-sm font-medium text-[#fd0c96] mb-2 flex items-center">
          <Sparkles className="h-4 w-4 mr-1" />
          MARKET PULSE
        </h3>
        <div className="space-y-2">
          {marketPulseNews.map((item) => (
            <div key={item.id} className="p-2 bg-black/50 border border-[#fd0c96]/10 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <NewsCategoryBadge category={item.category} />
                <span className="text-xs text-gray-400">{item.timestamp}</span>
              </div>
              <h4 className="text-sm font-medium text-white">{item.title}</h4>
            </div>
          ))}
        </div>
      </div>

      {/* Подвал */}
      <div className="text-center text-xs text-gray-400 mt-4">
        <button
          onClick={() => openExternalLink("https://www.pnn.lol/")}
          className="flex items-center justify-center gap-1 hover:text-[#fd0c96] transition-colors"
        >
          Visit PNN.lol for more news
          <ExternalLink className="h-3 w-3" />
        </button>
      </div>
    </div>
  )
}
