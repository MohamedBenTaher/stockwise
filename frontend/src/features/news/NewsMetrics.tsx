import React from "react"

interface NewsMetricsProps {
  metrics: {
    total_articles: number
    portfolio_relevant: number
    breaking_news: number
    positive_news: number
    negative_news: number
  }
}

export const NewsMetrics: React.FC<NewsMetricsProps> = React.memo(({ metrics }) => {
  const metricItems = [
    {
      value: metrics.total_articles,
      label: "Total Articles",
      color: "text-foreground",
    },
    {
      value: metrics.portfolio_relevant,
      label: "Portfolio Related",
      color: "text-blue-400",
    },
    {
      value: metrics.breaking_news,
      label: "Breaking News",
      color: "text-orange-400",
    },
    {
      value: metrics.positive_news,
      label: "Positive",
      color: "text-green-400",
    },
    {
      value: metrics.negative_news,
      label: "Negative",
      color: "text-red-400",
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {metricItems.map((item, index) => (
        <div key={index} className="glass-card p-4">
          <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
          <div className="text-xs text-muted-foreground">{item.label}</div>
        </div>
      ))}
    </div>
  )
})

NewsMetrics.displayName = "NewsMetrics"
