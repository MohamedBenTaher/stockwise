import React, { useState } from "react";
import { Bookmark, ChevronUp, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBookmarkedNews } from "@/hooks/useNews";
import { cn } from "@/lib/utils";

interface BookmarkFloaterProps {
  onNavigateToBookmarks?: () => void;
}

export const BookmarkFloater: React.FC<BookmarkFloaterProps> = ({
  onNavigateToBookmarks,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const { data: bookmarkedNews, isLoading } = useBookmarkedNews();

  const bookmarkCount = bookmarkedNews?.length || 0;

  if (!isVisible || bookmarkCount === 0) {
    return null;
  }

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleNavigateToBookmarks = () => {
    onNavigateToBookmarks?.();
    setIsExpanded(false);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours > 24) {
      return `${Math.floor(diffHours / 24)}d ago`;
    } else if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else {
      return "Just now";
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card
        className={cn(
          "bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-white/20 dark:border-gray-700/20 shadow-2xl transition-all duration-300",
          isExpanded ? "w-80" : "w-auto"
        )}
      >
        <CardContent className="p-0">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 dark:border-gray-700/30">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleExpanded}
              className="flex items-center space-x-2 hover:bg-yellow-50/20 dark:hover:bg-yellow-900/20"
            >
              <Bookmark className="h-4 w-4 fill-yellow-400 text-yellow-600" />
              <span className="font-medium text-sm">
                {bookmarkCount} Bookmarked
              </span>
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronUp className="h-3 w-3" />
              )}
            </Button>

            <div className="flex items-center space-x-1">
              {!isExpanded && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNavigateToBookmarks}
                  className="text-xs hover:bg-blue-50/20 dark:hover:bg-blue-900/20"
                >
                  View All
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="h-6 w-6 p-0 hover:bg-red-50/20 dark:hover:bg-red-900/20"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Expanded Content */}
          {isExpanded && (
            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Loading bookmarks...
                  </p>
                </div>
              ) : (
                <div className="space-y-2 p-2">
                  {bookmarkedNews?.slice(0, 5).map((article) => (
                    <div
                      key={article.id}
                      className="p-3 rounded-lg hover:bg-white/20 dark:hover:bg-gray-800/20 cursor-pointer transition-colors border border-white/10 dark:border-gray-700/20"
                      onClick={() => window.open(article.url, "_blank")}
                    >
                      <h4 className="font-medium text-sm line-clamp-2 mb-1">
                        {article.title}
                      </h4>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant="secondary"
                            className="text-xs px-1 py-0"
                          >
                            {article.source}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(article.published_at)}
                          </span>
                        </div>
                        <Badge
                          variant={
                            article.sentiment === "positive"
                              ? "default"
                              : article.sentiment === "negative"
                              ? "destructive"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {article.sentiment}
                        </Badge>
                      </div>
                    </div>
                  ))}

                  {bookmarkedNews && bookmarkedNews.length > 5 && (
                    <div className="text-center p-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNavigateToBookmarks}
                        className="text-xs w-full"
                      >
                        View All {bookmarkCount} Bookmarks
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
