"use client"

import type React from "react"
import { useState } from "react"
import { Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface BookmarkButtonProps {
  articleId: string
  isBookmarked: boolean
  size?: "sm" | "md" | "lg"
  variant?: "ghost" | "outline" | "default"
  className?: string
}

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  articleId,
  isBookmarked: initialBookmarked,
  size = "md",
  variant = "ghost",
  className,
}) => {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked)
  const [isLoading, setIsLoading] = useState(false)

  const handleToggleBookmark = async () => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 300))

    setIsBookmarked(!isBookmarked)
    setIsLoading(false)

    console.log(`${isBookmarked ? "Removed" : "Added"} bookmark for article: ${articleId}`)
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggleBookmark}
      disabled={isLoading}
      className={cn("transition-colors", isBookmarked && "text-blue-600 hover:text-blue-700", className)}
    >
      <Bookmark className={cn("h-4 w-4", isBookmarked && "fill-current")} />
    </Button>
  )
}
