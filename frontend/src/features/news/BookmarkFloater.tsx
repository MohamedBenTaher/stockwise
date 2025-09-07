"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Bookmark, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface BookmarkFloaterProps {
  onNavigateToBookmarks: () => void
}

export const BookmarkFloater: React.FC<BookmarkFloaterProps> = ({ onNavigateToBookmarks }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [bookmarkCount, setBookmarkCount] = useState(4)

  useEffect(() => {
    // Show floater after a delay to simulate bookmark activity
    const timer = setTimeout(() => setIsVisible(true), 2000)
    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) return null

  return (
    <Card className="fixed bottom-6 right-6 p-4 bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg z-50">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <Bookmark className="h-5 w-5 text-blue-400 fill-current" />
          <div>
            <div className="text-sm font-medium text-foreground">{bookmarkCount} Bookmarked</div>
            <div className="text-xs text-muted-foreground">Articles saved</div>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm" onClick={onNavigateToBookmarks} className="text-xs">
            View All
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setIsVisible(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
