from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from datetime import datetime, timedelta

from app.db import get_db
from app.services.auth import get_current_user
from app.services.news_optimized import optimized_news_service as news_service
from app.services.holdings import HoldingService
from app.services.bookmarks import BookmarkService
from app.schemas.user import User
from app.schemas.bookmark import BookmarkToggleRequest, BookmarkToggleResponse
from app.schemas.news import (
    NewsResponse,
    NewsFilter,
    SentimentType,
    ImpactLevel,
    EventType,
    SentimentAnalysisRequest,
    SentimentAnalysisResponse,
    MarketSentiment,
    NewsMetrics,
)

router = APIRouter()


@router.get("/", response_model=NewsResponse)
async def get_news_feed(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    sentiment: Optional[SentimentType] = Query(None, description="Filter by sentiment"),
    impact: Optional[ImpactLevel] = Query(None, description="Filter by impact level"),
    event_type: Optional[EventType] = Query(None, description="Filter by event type"),
    sector: Optional[str] = Query(None, description="Filter by sector"),
    tickers: Optional[str] = Query(None, description="Comma-separated ticker symbols"),
    sources: Optional[str] = Query(None, description="Comma-separated news sources"),
    is_breaking: Optional[bool] = Query(None, description="Filter breaking news"),
    is_portfolio_relevant: Optional[bool] = Query(
        None, description="Portfolio relevant only"
    ),
    search_query: Optional[str] = Query(None, description="Search in title/content"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get personalized news feed with AI-powered sentiment analysis.
    Returns news articles relevant to user's portfolio with sentiment scores.
    """
    try:
        # Get user's portfolio tickers
        holding_service = HoldingService(db)
        user_holdings = await holding_service.get_user_holdings(current_user.id)
        user_tickers = [holding.ticker for holding in user_holdings]

        # Build filters
        filters = NewsFilter(
            sentiment=sentiment,
            impact=impact,
            event_type=event_type,
            sector=sector,
            tickers=tickers.split(",") if tickers else None,
            sources=sources.split(",") if sources else None,
            is_breaking=is_breaking,
            is_portfolio_relevant=is_portfolio_relevant,
            search_query=search_query,
            date_from=datetime.now() - timedelta(days=7),  # Last 7 days
            date_to=datetime.now(),
        )

        # Fetch and analyze news
        news_response = await news_service.fetch_news_articles(
            user_tickers=user_tickers, filters=filters, page=page, page_size=page_size
        )

        # Mark articles as bookmarked based on user's bookmarks
        bookmark_service = BookmarkService(db)
        for article in news_response.articles:
            is_bookmarked = await bookmark_service.is_bookmarked(
                current_user.id, article.id
            )
            article.is_bookmarked = is_bookmarked

        return news_response

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch news: {str(e)}",
        )


@router.get("/metrics", response_model=NewsMetrics)
async def get_news_metrics(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get news metrics and statistics for the user's portfolio.
    """
    try:
        # Get user's portfolio tickers
        holding_service = HoldingService(db)
        user_holdings = await holding_service.get_user_holdings(current_user.id)
        user_tickers = [holding.ticker for holding in user_holdings]

        # Fetch recent news for metrics
        news_response = await news_service.fetch_news_articles(
            user_tickers=user_tickers,
            page=1,
            page_size=100,  # Get more for accurate metrics
        )

        return news_response.metrics

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch news metrics: {str(e)}",
        )


@router.get("/sentiment", response_model=MarketSentiment)
async def get_market_sentiment(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get overall market sentiment analysis based on recent news.
    """
    try:
        # Get user's portfolio tickers
        holding_service = HoldingService(db)
        user_holdings = await holding_service.get_user_holdings(current_user.id)
        user_tickers = [holding.ticker for holding in user_holdings]

        # Fetch recent news for sentiment analysis
        news_response = await news_service.fetch_news_articles(
            user_tickers=user_tickers, page=1, page_size=100
        )

        return news_response.market_sentiment

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch market sentiment: {str(e)}",
        )


@router.post("/analyze-sentiment", response_model=SentimentAnalysisResponse)
async def analyze_text_sentiment(
    request: SentimentAnalysisRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Analyze sentiment of arbitrary text using AI-powered analysis.
    Useful for analyzing news articles, social media posts, or other content.
    """
    try:
        analysis = await news_service.analyze_text_sentiment(
            text=request.text, context=request.context or ""
        )

        return analysis

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Sentiment analysis failed: {str(e)}",
        )


@router.get("/sources")
async def get_news_sources(
    current_user: User = Depends(get_current_user),
):
    """
    Get available news sources and their status.
    """
    try:
        sources = [
            {
                "name": "NewsAPI",
                "description": "Global news aggregator",
                "status": (
                    "active"
                    if hasattr(news_service.news_sources["newsapi"], "key")
                    and news_service.news_sources["newsapi"]["key"]
                    else "inactive"
                ),
                "categories": ["general", "business", "technology", "health"],
            },
            {
                "name": "Alpha Vantage",
                "description": "Financial news and sentiment",
                "status": (
                    "active"
                    if news_service.news_sources["alpha_vantage"]["key"]
                    else "inactive"
                ),
                "categories": ["financial", "earnings", "market"],
            },
            {
                "name": "Mock Data",
                "description": "Demo news articles",
                "status": "active",
                "categories": ["demo", "testing"],
            },
        ]

        return {
            "sources": sources,
            "total_active": sum(1 for s in sources if s["status"] == "active"),
            "last_updated": datetime.now(),
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch news sources: {str(e)}",
        )


@router.get("/sectors")
async def get_sector_sentiment(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get sentiment analysis breakdown by sector.
    """
    try:
        # Get user's portfolio tickers
        holding_service = HoldingService(db)
        user_holdings = await holding_service.get_user_holdings(current_user.id)
        user_tickers = [holding.ticker for holding in user_holdings]

        # Fetch news and get sector sentiment
        news_response = await news_service.fetch_news_articles(
            user_tickers=user_tickers, page=1, page_size=100
        )

        return {
            "sectors_analysis": news_response.market_sentiment.sectors_analysis,
            "last_updated": datetime.now(),
            "total_articles_analyzed": news_response.total_count,
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch sector sentiment: {str(e)}",
        )


@router.get("/trending")
async def get_trending_topics(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get trending topics and keywords from recent news.
    """
    try:
        # Get user's portfolio tickers
        holding_service = HoldingService(db)
        user_holdings = await holding_service.get_user_holdings(current_user.id)
        user_tickers = [holding.ticker for holding in user_holdings]

        # Fetch recent news
        news_response = await news_service.fetch_news_articles(
            user_tickers=user_tickers, page=1, page_size=50
        )

        # Extract trending keywords
        all_keywords = []
        ticker_mentions = {}
        sector_mentions = {}

        for article in news_response.articles:
            all_keywords.extend(article.tags)

            for ticker in article.related_tickers:
                ticker_mentions[ticker] = ticker_mentions.get(ticker, 0) + 1

            if article.sector:
                sector_mentions[article.sector] = (
                    sector_mentions.get(article.sector, 0) + 1
                )

        # Count keyword frequency
        keyword_counts = {}
        for keyword in all_keywords:
            keyword_counts[keyword] = keyword_counts.get(keyword, 0) + 1

        # Get top trending items
        trending_keywords = sorted(
            keyword_counts.items(), key=lambda x: x[1], reverse=True
        )[:10]
        trending_tickers = sorted(
            ticker_mentions.items(), key=lambda x: x[1], reverse=True
        )[:10]
        trending_sectors = sorted(
            sector_mentions.items(), key=lambda x: x[1], reverse=True
        )[:5]

        return {
            "trending_keywords": [
                {"keyword": k, "mentions": c} for k, c in trending_keywords
            ],
            "trending_tickers": [
                {"ticker": t, "mentions": c} for t, c in trending_tickers
            ],
            "trending_sectors": [
                {"sector": s, "mentions": c} for s, c in trending_sectors
            ],
            "analysis_period": "last_7_days",
            "last_updated": datetime.now(),
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch trending topics: {str(e)}",
        )


@router.get("/health")
async def news_health_check():
    """
    Health check for news service and external APIs.
    """
    try:
        # Check external API availability
        api_status = {}

        # NewsAPI status
        if news_service.news_sources["newsapi"]["key"]:
            api_status["newsapi"] = "configured"
        else:
            api_status["newsapi"] = "not_configured"

        # Alpha Vantage status
        if news_service.news_sources["alpha_vantage"]["key"]:
            api_status["alpha_vantage"] = "configured"
        else:
            api_status["alpha_vantage"] = "not_configured"

        return {
            "status": "healthy",
            "external_apis": api_status,
            "sentiment_analyzer": "active",
            "last_check": datetime.now(),
        }

    except Exception as e:
        return {"status": "error", "error": str(e), "last_check": datetime.now()}


@router.get("/dev", response_model=NewsResponse)
async def dev_news_feed(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    sentiment: Optional[SentimentType] = Query(None, description="Filter by sentiment"),
    impact: Optional[ImpactLevel] = Query(None, description="Filter by impact level"),
    event_type: Optional[EventType] = Query(None, description="Filter by event type"),
    sector: Optional[str] = Query(None, description="Filter by sector"),
    tickers: Optional[str] = Query(None, description="Comma-separated ticker symbols"),
    sources: Optional[str] = Query(None, description="Comma-separated news sources"),
    is_breaking: Optional[bool] = Query(None, description="Filter breaking news"),
    is_portfolio_relevant: Optional[bool] = Query(
        None, description="Portfolio relevant only"
    ),
    search_query: Optional[str] = Query(None, description="Search in title/content"),
    db: AsyncSession = Depends(get_db),
):
    """
    Development news feed endpoint without authentication.
    Uses common stock tickers for demo purposes.
    """
    try:
        # Parse tickers or use default popular ones
        user_tickers = []
        if tickers:
            user_tickers = [ticker.strip().upper() for ticker in tickers.split(",")]
        else:
            # Default popular stocks for demo
            user_tickers = ["AAPL", "MSFT", "GOOGL", "TSLA", "NVDA", "AMZN", "META"]

        # Build filters
        filters = None
        filter_conditions = [
            sentiment,
            impact,
            event_type,
            sector,
            sources,
            is_breaking,
            search_query,
        ]
        if any(filter_conditions):
            filters = NewsFilter(
                sentiment=sentiment,
                impact=impact,
                event_type=event_type,
                sector=sector,
                sources=sources.split(",") if sources else None,
                is_breaking=is_breaking,
                is_portfolio_relevant=is_portfolio_relevant,
                search_query=search_query,
            )

        # Fetch news
        response = await news_service.fetch_news_articles(
            user_tickers=user_tickers,
            filters=filters,
            page=page,
            page_size=page_size,
        )

        return response

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch news: {str(e)}",
        )


@router.get("/bookmarked")
async def get_bookmarked_news(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get user's bookmarked news articles.
    """
    try:
        bookmark_service = BookmarkService(db)
        bookmarks = await bookmark_service.get_user_bookmarks(current_user.id)

        # Convert bookmarks to article format
        articles = []
        for bookmark in bookmarks:
            article = {
                "id": bookmark.article_id,
                "title": bookmark.article_title,
                "summary": bookmark.article_summary or "",
                "url": bookmark.article_url,
                "source": bookmark.article_source or "",
                "author": "",
                "published_at": (
                    bookmark.article_published_at.isoformat()
                    if bookmark.article_published_at
                    else ""
                ),
                "sentiment": bookmark.article_sentiment or "neutral",
                "sentiment_score": 0.0,
                "impact": "medium",
                "relevance_score": 1.0,
                "tags": [],
                "related_tickers": [],
                "sector": "",
                "event_type": "general",
                "is_breaking": False,
                "is_bookmarked": True,
                "image_url": None,
                "created_at": bookmark.created_at.isoformat(),
                "updated_at": bookmark.updated_at.isoformat(),
            }
            articles.append(article)

        return articles
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch bookmarked news: {str(e)}",
        )


@router.post("/{article_id}/bookmark")
async def toggle_bookmark(
    article_id: str,
    request: BookmarkToggleRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Toggle bookmark status for a news article.
    """
    try:
        bookmark_service = BookmarkService(db)

        # First, just check if the article is currently bookmarked
        is_currently_bookmarked = await bookmark_service.is_bookmarked(
            current_user.id, article_id
        )

        if request.bookmarked and not is_currently_bookmarked:
            # Adding bookmark - need article details
            news_response = await news_service.fetch_news_articles(
                user_tickers=["AAPL", "MSFT", "GOOGL", "TSLA", "NVDA"],
                page=1,
                page_size=100,
            )

            # Find the article
            article = None
            for news_article in news_response.articles:
                if news_article.id == article_id:
                    article = news_article
                    break

            if not article:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, detail="Article not found"
                )

            await bookmark_service.add_bookmark(current_user.id, article)
            action = "bookmarked"

        elif not request.bookmarked and is_currently_bookmarked:
            # Removing bookmark
            await bookmark_service.remove_bookmark(current_user.id, article_id)
            action = "unbookmarked"

        else:
            # No change needed
            if is_currently_bookmarked:
                action = "already bookmarked"
            else:
                action = "not bookmarked"

        # Get total bookmark count
        total_bookmarks = await bookmark_service.get_bookmark_count(current_user.id)

        return BookmarkToggleResponse(
            success=True,
            article_id=article_id,
            bookmarked=request.bookmarked,
            message=f"Article {action} successfully",
            total_bookmarks=total_bookmarks,
        )

    except HTTPException:
        raise
    except Exception as e:
        import traceback

        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to toggle bookmark: {str(e)}",
        )


@router.post("/refresh")
async def refresh_news(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Trigger a refresh of news data.
    """
    try:
        # TODO: Implement cache invalidation and refresh
        # For now, just return success
        return {
            "success": True,
            "message": "News refresh triggered successfully",
            "timestamp": datetime.now(),
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to refresh news: {str(e)}",
        )
