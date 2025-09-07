import React from "react"
import { Badge } from "@/components/ui/badge"
import { getSentimentIcon } from "@/utils/newsUtils"

interface MarketSentimentProps {
  marketSentiment: {
    overall: string
    sectors_analysis: Array<{
      sector: string
      sentiment: string
      score: number
      news_count: number
    }>
  } | null
}

export const MarketSentiment: React.FC<MarketSentimentProps> = React.memo(({ marketSentiment }) => {
  return (
    <div className="relative">
      <div className="absolute inset-0 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10" />
      <div className="relative p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Market Sentiment</h2>
          {marketSentiment && (
            <Badge variant={marketSentiment.overall === "bullish" ? "default" : "destructive"}>
              {marketSentiment.overall.toUpperCase()}
            </Badge>
          )}
        </div>

        {marketSentiment ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {marketSentiment.sectors_analysis.map((sector) => {
              const SentimentIcon = getSentimentIcon(sector.sentiment)
              return (
                <div key={sector.sector} className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">{sector.sector}</span>
                    <SentimentIcon className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="text-lg font-bold text-foreground mb-1">
                    {sector.score > 0 ? "+" : ""}
                    {(sector.score * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-muted-foreground">{sector.news_count} articles</div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">Loading market sentiment...</div>
        )}
      </div>
    </div>
  )
})

MarketSentiment.displayName = "MarketSentiment"
