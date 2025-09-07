import React from "react"
import { Newspaper } from "lucide-react"
import { NewsArticleCard } from "./NewsArticleCard"

interface NewsArticle {
  id: string
  title: string
  summary: string
  url: string
  source: string
  author?: string
  published_at: string
  image_url?: string
  sentiment: string
  impact: string
  is_breaking?: boolean
  is_bookmarked?: boolean
  related_tickers: string[]
  tags: string[]
  relevance_score: number
}

interface NewsFeedProps {
  articles: NewsArticle[]
}

export const NewsFeed: React.FC<NewsFeedProps> = React.memo(({ articles }) => {
  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <Newspaper className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
        <h3 className="text-lg font-medium text-foreground mb-2">No News Found</h3>
        <p className="text-muted-foreground">Try adjusting your filters or search terms.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {articles.map((article) => (
        <NewsArticleCard key={article.id} article={article} />
      ))}
    </div>
  )
})

NewsFeed.displayName = "NewsFeed"
