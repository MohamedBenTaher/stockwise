"use client"

import React from "react"
import { RefreshCw, Bell, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface NewsHeaderProps {
  onRefresh: () => Promise<void>
  isRefreshing: boolean
}

export const NewsHeader: React.FC<NewsHeaderProps> = React.memo(({ onRefresh, isRefreshing }) => {
  return (
    <div className="flex justify-between items-start mb-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground mb-2">Market News</h1>
        <p className="text-muted-foreground">AI-powered news analysis tailored to your portfolio</p>
      </div>
      <div className="flex items-center space-x-3">
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={isRefreshing}>
          {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          Refresh
        </Button>
        <Button variant="outline" size="sm">
          <Bell className="h-4 w-4 mr-2" />
          Alerts
        </Button>
      </div>
    </div>
  )
})

NewsHeader.displayName = "NewsHeader"
