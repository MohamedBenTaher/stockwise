"use client";

import React from "react";
import {
  Clock,
  Building,
  User,
  ExternalLink,
  MoreHorizontal,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BookmarkButton } from "../BookmarkButton";
import { cn } from "@/lib/utils";
import {
  getSentimentIcon,
  getSentimentColor,
  getImpactVariant,
  formatTimeAgo,
  NEWS_CONFIG,
} from "@/utils/newsUtils";

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  author?: string;
  published_at: string;
  image_url?: string;
  sentiment: string;
  impact: string;
  is_breaking?: boolean;
  is_bookmarked?: boolean;
  related_tickers: string[];
  tags: string[];
  relevance_score: number;
}

interface NewsArticleCardProps {
  article: NewsArticle;
}

export const NewsArticleCard: React.FC<NewsArticleCardProps> = React.memo(
  ({ article }) => {
    const SentimentIcon = getSentimentIcon(article.sentiment);

    const handleReadFullArticle = () => {
      console.log(`Opening article: ${article.url}`);
      window.open(article.url, "_blank", "noopener,noreferrer");
    };

    return (
      <Card className="bg-white/5 backdrop-blur-sm border border-white/20 hover:bg-white/10 transition-all">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            {article.image_url && (
              <img
                src={
                   "/placeholder/article.png"
                }
                alt=""
                className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
              />
            )}

            <div className="flex-1 space-y-3">
              {/* Article Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {article.is_breaking && (
                      <Badge variant="destructive" className="text-xs">
                        BREAKING
                      </Badge>
                    )}
                    <Badge
                      variant={getImpactVariant(article.impact)}
                      className="text-xs"
                    >
                      {article.impact.toUpperCase()} IMPACT
                    </Badge>
                    <div
                      className={cn(
                        "flex items-center space-x-1 px-2 py-1 rounded text-xs border",
                        getSentimentColor(article.sentiment)
                      )}
                    >
                      <SentimentIcon className="h-4 w-4" />
                      <span>{article.sentiment}</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">
                    {article.title}
                  </h3>

                  <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                    {article.summary}
                  </p>
                </div>

                {/* Article Actions */}
                <div className="flex items-center space-x-2">
                  <BookmarkButton
                    articleId={article.id}
                    isBookmarked={article.is_bookmarked || false}
                    size="sm"
                    variant="ghost"
                  />

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={handleReadFullArticle}
                        className="cursor-pointer"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Read Full Article
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Article Meta */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Building className="h-3 w-3" />
                    <span>{article.source}</span>
                  </div>
                  {article.author && (
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span>{article.author}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatTimeAgo(article.published_at)}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {article.related_tickers.length > 0 && (
                    <div className="flex items-center space-x-1">
                      {article.related_tickers
                        .slice(0, NEWS_CONFIG.MAX_VISIBLE_TICKERS)
                        .map((ticker: string) => (
                          <Badge
                            key={ticker}
                            variant="outline"
                            className="text-xs px-1 py-0"
                          >
                            {ticker}
                          </Badge>
                        ))}
                    </div>
                  )}
                  <span className="text-xs">
                    Relevance: {(article.relevance_score * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Tags */}
              {article.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {article.tags
                    .slice(0, NEWS_CONFIG.MAX_VISIBLE_TAGS)
                    .map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);

NewsArticleCard.displayName = "NewsArticleCard";
