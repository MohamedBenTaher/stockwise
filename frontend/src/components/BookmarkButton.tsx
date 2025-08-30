import React, { useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "./ui/button";
import { useBookmarkNews } from "../hooks/useNews";
import { useToast } from "./Toast";
import { cn } from "@/lib/utils";

interface BookmarkButtonProps {
  articleId: string;
  isBookmarked: boolean;
  className?: string;
  size?: "sm" | "default" | "lg";
  variant?: "ghost" | "outline" | "default";
  showText?: boolean;
}

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  articleId,
  isBookmarked,
  className,
  size = "sm",
  variant = "ghost",
  showText = false,
}) => {
  const [isOptimistic, setIsOptimistic] = useState(isBookmarked);
  const [isAnimating, setIsAnimating] = useState(false);
  const bookmarkMutation = useBookmarkNews();
  const { showToast } = useToast();

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Start animation
    setIsAnimating(true);

    // Optimistic update
    const newBookmarkedState = !isOptimistic;
    setIsOptimistic(newBookmarkedState);

    try {
      await bookmarkMutation.mutateAsync({
        articleId,
        bookmarked: !isBookmarked,
      });

      // Show success toast
      showToast(
        newBookmarkedState ? "Article bookmarked!" : "Bookmark removed",
        "success"
      );

      // Stop animation after delay
      setTimeout(() => setIsAnimating(false), 600);
    } catch (error) {
      // Revert optimistic update on error
      setIsOptimistic(isBookmarked);
      setIsAnimating(false);
      showToast("Failed to update bookmark", "error");
      console.error("Failed to toggle bookmark:", error);
    }
  };

  const Icon = isOptimistic ? BookmarkCheck : Bookmark;
  const iconClassName = cn(
    "transition-all duration-300",
    size === "sm" && "h-4 w-4",
    size === "default" && "h-5 w-5",
    size === "lg" && "h-6 w-6",
    isOptimistic
      ? "fill-yellow-400 text-yellow-600 scale-110"
      : "text-muted-foreground hover:text-yellow-600 hover:scale-105",
    isAnimating && "animate-pulse scale-125"
  );

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      disabled={bookmarkMutation.isPending}
      className={cn(
        "transition-all duration-300 hover:scale-105",
        isOptimistic && "text-yellow-600 bg-yellow-50/10 dark:bg-yellow-900/20",
        bookmarkMutation.isPending && "opacity-50",
        isAnimating && "scale-110",
        className
      )}
      title={isOptimistic ? "Remove bookmark" : "Bookmark article"}
    >
      <Icon className={iconClassName} />
      {showText && (
        <span className="ml-2 transition-colors duration-200">
          {isOptimistic ? "Bookmarked" : "Bookmark"}
        </span>
      )}

      {/* Show small success indicator when bookmarked */}
      {isOptimistic && (
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
      )}
    </Button>
  );
};
