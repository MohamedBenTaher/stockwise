"use client"

import React from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { NEWS_CONFIG } from "@/utils/newsUtils"

interface NewsFiltersProps {
  searchTerm: string
  selectedSentiment: string
  selectedImpact: string
  selectedSector: string
  onSearchChange: (value: string) => void
  onSentimentChange: (value: string) => void
  onImpactChange: (value: string) => void
  onSectorChange: (value: string) => void
}

export const NewsFilters: React.FC<NewsFiltersProps> = React.memo(
  ({
    searchTerm,
    selectedSentiment,
    selectedImpact,
    selectedSector,
    onSearchChange,
    onSentimentChange,
    onImpactChange,
    onSectorChange,
  }) => {
    return (
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search news, tickers, or topics..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-white/5 backdrop-blur-sm border border-white/20"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Select value={selectedSentiment} onValueChange={onSentimentChange}>
            <SelectTrigger className="w-[130px] bg-white/5 backdrop-blur-sm border border-white/20">
              <SelectValue placeholder="Sentiment" />
            </SelectTrigger>
            <SelectContent>
              {NEWS_CONFIG.SENTIMENTS.map((sentiment) => (
                <SelectItem key={sentiment.value} value={sentiment.value}>
                  {sentiment.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedImpact} onValueChange={onImpactChange}>
            <SelectTrigger className="w-[120px] bg-white/5 backdrop-blur-sm border border-white/20">
              <SelectValue placeholder="Impact" />
            </SelectTrigger>
            <SelectContent>
              {NEWS_CONFIG.IMPACTS.map((impact) => (
                <SelectItem key={impact.value} value={impact.value}>
                  {impact.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedSector} onValueChange={onSectorChange}>
            <SelectTrigger className="w-[130px] bg-white/5 backdrop-blur-sm border border-white/20">
              <SelectValue placeholder="Sector" />
            </SelectTrigger>
            <SelectContent>
              {NEWS_CONFIG.SECTORS.map((sector) => (
                <SelectItem key={sector.value} value={sector.value}>
                  {sector.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    )
  },
)

NewsFilters.displayName = "NewsFilters"
