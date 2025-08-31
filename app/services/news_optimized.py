"""
Optimized news service with caching and rate limiting.
This replaces the original news service to prevent excessive API calls.
"""

import asyncio
import logging
import time
import json
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import redis.asyncio as redis
import httpx

from app.config import settings
from app.schemas.news import (
    NewsArticle,
    NewsResponse,
    NewsMetrics,
    MarketSentiment,
    NewsFilter,
    SentimentType,
    ImpactLevel,
    EventType,
    TrendType,
    OverallSentiment,
    SentimentAnalysisResponse,
    SectorSentiment,
)

logger = logging.getLogger(__name__)


class OptimizedNewsService:
    """Optimized news service with intelligent caching and rate limiting."""

    def __init__(self):
        self.redis_client = None
        self.cache_ttl = 3600  # 1 hour cache for news
        self.news_cache_key = "news:articles:v2"
        self.last_fetch_key = "news:last_fetch"
        self.fetch_interval = 1800  # Fetch every 30 minutes

        # Mock news data for immediate response
        self.mock_articles_cache = None
        self.mock_articles_timestamp = 0

    async def get_redis(self) -> Optional[redis.Redis]:
        """Get Redis connection."""
        if self.redis_client is None:
            try:
                self.redis_client = redis.from_url(
                    settings.REDIS_URL,
                    decode_responses=True,
                    socket_connect_timeout=5,
                    socket_timeout=5,
                )
                await self.redis_client.ping()
            except Exception as e:
                logger.warning(f"Redis connection failed for news: {e}")
                self.redis_client = None
        return self.redis_client

    async def should_fetch_news(self) -> bool:
        """Check if we should fetch fresh news."""
        try:
            redis_client = await self.get_redis()
            if not redis_client:
                return True

            last_fetch_str = await redis_client.get(self.last_fetch_key)
            if not last_fetch_str:
                return True

            last_fetch = float(last_fetch_str)
            return (time.time() - last_fetch) > self.fetch_interval

        except Exception:
            return True

    async def fetch_news_articles(
        self,
        user_tickers: List[str] = None,
        filters: NewsFilter = None,
        page: int = 1,
        page_size: int = 20,
    ) -> NewsResponse:
        """Fetch news articles with aggressive caching."""
        try:
            # Always try cache first
            cached_articles = await self._get_cached_articles()

            if cached_articles:
                logger.info(f"📰 Using {len(cached_articles)} cached news articles")
            else:
                # Check if we have API keys configured
                has_news_api = bool(getattr(settings, "NEWS_API_KEY", None))
                has_alpha_vantage = bool(
                    getattr(settings, "ALPHA_VANTAGE_API_KEY", None)
                )

                if has_news_api or has_alpha_vantage:
                    logger.info("🔄 No cached articles, fetching from external APIs...")
                    # Try to fetch immediately (with timeout)
                    try:
                        fresh_articles = await asyncio.wait_for(
                            self._fetch_external_sources_limited(),
                            timeout=10.0,  # 10 second timeout
                        )
                        if fresh_articles:
                            cached_articles = fresh_articles
                            # Cache the fresh articles
                            await self._cache_articles(fresh_articles)
                            logger.info(
                                f"✅ Fetched {len(fresh_articles)} fresh articles"
                            )
                        else:
                            logger.warning(
                                "⚠️ External APIs returned no articles, using mock data"
                            )
                            cached_articles = self._get_enhanced_mock_articles(
                                user_tickers
                            )
                    except asyncio.TimeoutError:
                        logger.warning("⏰ External API timeout, using mock data")
                        cached_articles = self._get_enhanced_mock_articles(user_tickers)
                        # Trigger background fetch for next time
                        asyncio.create_task(self._background_fetch_and_cache())
                else:
                    logger.info(
                        "📰 No external APIs configured, using enhanced mock data"
                    )
                    cached_articles = self._get_enhanced_mock_articles(user_tickers)

            # Process and filter articles
            processed_articles = self._process_cached_articles(
                cached_articles, user_tickers or []
            )

            # Apply filters
            filtered_articles = self._apply_filters(processed_articles, filters)

            # Sort by relevance and recency
            sorted_articles = sorted(
                filtered_articles,
                key=lambda x: (x.relevance_score, x.published_at),
                reverse=True,
            )

            # Pagination
            start_idx = (page - 1) * page_size
            end_idx = start_idx + page_size
            paginated_articles = sorted_articles[start_idx:end_idx]

            # Calculate metrics
            metrics = self._calculate_metrics(filtered_articles)
            market_sentiment = self._calculate_market_sentiment(filtered_articles)

            # Add metadata about data source
            is_mock_data = all(
                article.source
                in [
                    "TechFinance Daily",
                    "Market News",
                    "Energy Times",
                    "BioMed Report",
                    "Supply Chain Weekly",
                    "Earnings Central",
                ]
                for article in paginated_articles
            )

            if is_mock_data:
                # Add a note in the first article's summary for transparency
                if paginated_articles:
                    paginated_articles[0].summary = (
                        "[DEMO DATA] " + paginated_articles[0].summary
                    )

            return NewsResponse(
                articles=paginated_articles,
                total_count=len(filtered_articles),
                page=page,
                page_size=page_size,
                has_next=end_idx < len(filtered_articles),
                metrics=metrics,
                market_sentiment=market_sentiment,
            )

        except Exception as e:
            logger.error(f"News fetch failed: {e}")
            return self._get_empty_response(page, page_size)

    async def _get_cached_articles(self) -> Optional[List[Dict[str, Any]]]:
        """Get cached news articles."""
        try:
            redis_client = await self.get_redis()
            if not redis_client:
                return None

            cached_data_str = await redis_client.get(self.news_cache_key)
            if not cached_data_str:
                return None

            cached_data = json.loads(cached_data_str)
            articles = cached_data.get("articles", [])
            timestamp = cached_data.get("timestamp", 0)

            # Check if cache is still valid
            cache_age = time.time() - timestamp
            if cache_age > self.cache_ttl:
                return None

            logger.info(f"Using cached news: {len(articles)} articles")
            return articles

        except Exception as e:
            logger.warning(f"Failed to get cached news: {e}")
            return None

    async def _background_fetch_and_cache(self):
        """Background task to fetch and cache news."""
        try:
            logger.info("🔄 Background news fetch started...")

            # Fetch from external sources with rate limiting
            fresh_articles = await self._fetch_external_sources_limited()

            if fresh_articles:
                # Cache the results
                await self._cache_articles(fresh_articles)
                logger.info(f"✅ Cached {len(fresh_articles)} news articles")
            else:
                logger.warning("⚠️ No fresh articles fetched, keeping existing cache")

        except Exception as e:
            logger.error(f"❌ Background news fetch failed: {e}")

    async def _fetch_external_sources_limited(self) -> List[Dict[str, Any]]:
        """Fetch from external sources with strict limits."""
        articles = []

        # Try NewsAPI first (if available)
        if getattr(settings, "NEWS_API_KEY", None):
            try:
                logger.info("🔄 Trying NewsAPI...")
                newsapi_articles = await self._fetch_newsapi_limited()
                if newsapi_articles:
                    articles.extend(newsapi_articles)
                    logger.info(f"✅ NewsAPI returned {len(newsapi_articles)} articles")
                else:
                    logger.warning("⚠️ NewsAPI returned no articles")
            except Exception as e:
                logger.warning(f"❌ NewsAPI fetch failed: {e}")

        # Try Alpha Vantage News (if available and still need more articles)
        if getattr(settings, "ALPHA_VANTAGE_API_KEY", None) and len(articles) < 10:
            try:
                logger.info("🔄 Trying Alpha Vantage news...")
                av_articles = await self._fetch_alpha_vantage_news()
                if av_articles:
                    articles.extend(av_articles)
                    logger.info(
                        f"✅ Alpha Vantage returned {len(av_articles)} articles"
                    )
                else:
                    logger.warning("⚠️ Alpha Vantage returned no articles")
            except Exception as e:
                logger.warning(f"❌ Alpha Vantage news fetch failed: {e}")

        # If we got some articles, return them
        if articles:
            logger.info(f"📰 Total external articles fetched: {len(articles)}")
            return articles

        # If no external articles, return empty (caller will use mock data)
        logger.warning("⚠️ No external sources returned articles")
        return []

    async def _fetch_alpha_vantage_news(self) -> List[Dict[str, Any]]:
        """Fetch news from Alpha Vantage News & Sentiment API."""
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                params = {
                    "function": "NEWS_SENTIMENT",
                    "apikey": settings.ALPHA_VANTAGE_API_KEY,
                    "limit": 20,  # Limit to 20 articles
                    "sort": "LATEST",
                }

                response = await client.get(
                    "https://www.alphavantage.co/query", params=params
                )

                if response.status_code == 200:
                    data = response.json()

                    # Check for API errors
                    if "Error Message" in data:
                        logger.warning(f"Alpha Vantage error: {data['Error Message']}")
                        return []

                    if "Note" in data:
                        logger.warning(f"Alpha Vantage rate limit: {data['Note']}")
                        return []

                    # Extract articles from feed
                    articles = data.get("feed", [])
                    if articles:
                        # Convert Alpha Vantage format to our format
                        converted_articles = []
                        for article in articles[:15]:  # Limit to 15 articles
                            try:
                                converted = {
                                    "title": article.get("title", ""),
                                    "description": article.get("summary", ""),
                                    "url": article.get("url", ""),
                                    "source": {
                                        "name": article.get("source", "Alpha Vantage")
                                    },
                                    "publishedAt": article.get("time_published", ""),
                                    "author": (
                                        article.get("authors", [{}])[0].get("name", "")
                                        if article.get("authors")
                                        else ""
                                    ),
                                    "urlToImage": article.get("banner_image"),
                                    "sentiment": "neutral",  # We'll analyze this ourselves
                                }
                                if converted["title"] and converted["url"]:
                                    converted_articles.append(converted)
                            except Exception as e:
                                logger.debug(
                                    f"Failed to convert Alpha Vantage article: {e}"
                                )
                                continue

                        return converted_articles
                    else:
                        logger.warning("Alpha Vantage returned empty feed")
                        return []
                else:
                    logger.warning(f"Alpha Vantage HTTP {response.status_code}")
                    return []

        except Exception as e:
            logger.warning(f"Alpha Vantage news request failed: {e}")
            return []

    async def _fetch_newsapi_limited(self) -> List[Dict[str, Any]]:
        """Fetch limited articles from NewsAPI."""
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                params = {
                    "q": "stocks OR market OR finance",
                    "apiKey": settings.NEWS_API_KEY,
                    "language": "en",
                    "sortBy": "publishedAt",
                    "pageSize": 30,  # Limited to 30 articles
                }

                logger.info(f"📡 Making NewsAPI request with params: {params}")
                response = await client.get(
                    "https://newsapi.org/v2/everything", params=params
                )

                logger.info(f"📡 NewsAPI response status: {response.status_code}")

                if response.status_code == 200:
                    data = response.json()
                    articles = data.get("articles", [])
                    total_results = data.get("totalResults", 0)
                    logger.info(
                        f"✅ NewsAPI returned {len(articles)} articles "
                        f"(total: {total_results})"
                    )

                    # Filter out removed articles
                    valid_articles = [
                        article
                        for article in articles
                        if (
                            article.get("title") != "[Removed]"
                            and article.get("description") != "[Removed]"
                            and article.get("url")
                            and article.get("title")
                        )
                    ]

                    logger.info(
                        f"📰 Valid articles after filtering: {len(valid_articles)}"
                    )

                    # Update last fetch time
                    redis_client = await self.get_redis()
                    if redis_client:
                        await redis_client.setex(
                            self.last_fetch_key,
                            self.cache_ttl,
                            str(time.time()),
                        )

                    return valid_articles
                else:
                    logger.warning(f"❌ NewsAPI error: {response.status_code}")
                    logger.warning(f"Response text: {response.text[:200]}")
                    return []

        except Exception as e:
            logger.warning(f"❌ NewsAPI request failed: {e}")
            return []

    async def _cache_articles(self, articles: List[Dict[str, Any]]):
        """Cache articles in Redis."""
        try:
            redis_client = await self.get_redis()
            if not redis_client:
                return

            cache_data = {
                "articles": articles,
                "timestamp": time.time(),
                "count": len(articles),
            }

            await redis_client.setex(
                self.news_cache_key, self.cache_ttl, json.dumps(cache_data)
            )

        except Exception as e:
            logger.error(f"Failed to cache news articles: {e}")

    def _get_enhanced_mock_articles(
        self, user_tickers: List[str] = None
    ) -> List[Dict[str, Any]]:
        """Get enhanced mock articles with dynamic content."""
        # Use cached mock data if recent
        now = time.time()
        if (
            self.mock_articles_cache
            and (now - self.mock_articles_timestamp) < 1800  # 30 minutes
        ):
            return self.mock_articles_cache

        base_articles = [
            {
                "title": "Technology Stocks Show Strong Performance This Quarter",
                "description": "Major tech companies continue to outperform market expectations with robust earnings and growth prospects.",
                "url": "https://example.com/tech-performance",
                "source": {"name": "TechFinance Daily"},
                "publishedAt": (datetime.now() - timedelta(hours=1)).isoformat(),
                "author": "Financial Reporter",
                "sentiment": "positive",
                "sector": "Technology",
            },
            {
                "title": "Federal Reserve Policy Update Impacts Market Sentiment",
                "description": "Latest monetary policy decisions affect investor confidence across multiple sectors and asset classes.",
                "url": "https://example.com/fed-policy",
                "source": {"name": "Market News"},
                "publishedAt": (datetime.now() - timedelta(hours=3)).isoformat(),
                "author": "Economic Analyst",
                "sentiment": "neutral",
                "sector": "Financial",
            },
            {
                "title": "Renewable Energy Sector Sees Increased Investment",
                "description": "Clean energy companies attract significant capital as sustainability becomes a priority for institutional investors.",
                "url": "https://example.com/renewable-investment",
                "source": {"name": "Energy Times"},
                "publishedAt": (datetime.now() - timedelta(hours=5)).isoformat(),
                "author": "Energy Correspondent",
                "sentiment": "positive",
                "sector": "Energy",
            },
            {
                "title": "Healthcare Innovation Drives Sector Growth",
                "description": "Breakthrough treatments and medical technologies fuel optimism in healthcare and biotech stocks.",
                "url": "https://example.com/healthcare-innovation",
                "source": {"name": "BioMed Report"},
                "publishedAt": (datetime.now() - timedelta(hours=6)).isoformat(),
                "author": "Medical Journalist",
                "sentiment": "positive",
                "sector": "Healthcare",
            },
            {
                "title": "Supply Chain Challenges Continue to Affect Consumer Goods",
                "description": "Global logistics issues impact production and distribution for consumer-focused companies.",
                "url": "https://example.com/supply-chain",
                "source": {"name": "Supply Chain Weekly"},
                "publishedAt": (datetime.now() - timedelta(hours=8)).isoformat(),
                "author": "Industry Expert",
                "sentiment": "negative",
                "sector": "Consumer",
            },
        ]

        # Add ticker-specific articles if user has specific holdings
        if user_tickers:
            for ticker in user_tickers[:3]:  # Limit to 3 tickers
                ticker_article = {
                    "title": f"{ticker} Reports Quarterly Earnings Results",
                    "description": f"{ticker} announces quarterly financial results with analysis of performance metrics and future outlook.",
                    "url": f"https://example.com/{ticker.lower()}-earnings",
                    "source": {"name": "Earnings Central"},
                    "publishedAt": (datetime.now() - timedelta(hours=2)).isoformat(),
                    "author": "Earnings Analyst",
                    "sentiment": "neutral",
                    "sector": "Technology",
                    "tickers": [ticker],
                }
                base_articles.append(ticker_article)

        # Cache the mock articles
        self.mock_articles_cache = base_articles
        self.mock_articles_timestamp = now

        return base_articles

    def _process_cached_articles(
        self, raw_articles: List[Dict[str, Any]], user_tickers: List[str]
    ) -> List[NewsArticle]:
        """Process cached articles into NewsArticle objects."""
        processed_articles = []

        for article_data in raw_articles:
            try:
                processed_article = self._create_news_article(
                    article_data, user_tickers
                )
                if processed_article:
                    processed_articles.append(processed_article)
            except Exception as e:
                logger.debug(f"Failed to process article: {e}")
                continue

        return processed_articles

    def _create_news_article(
        self, article_data: Dict[str, Any], user_tickers: List[str]
    ) -> Optional[NewsArticle]:
        """Create NewsArticle from raw data."""
        try:
            title = article_data.get("title", "")
            description = article_data.get("description", "")
            url = article_data.get("url", "")

            logger.debug(
                f"Creating article: title='{title}', desc='{description}', url='{url}'"
            )

            # Skip removed articles
            if (
                not title
                or not url
                or title == "[Removed]"
                or description == "[Removed]"
            ):
                logger.debug("Article filtered out by basic checks")
                return None

            # Ensure we have a non-empty summary (required by schema)
            if not description or description == "...":
                content = article_data.get("content", "")
                if content:
                    # Clean up content and take first 200 chars
                    clean_content = content.replace("{ window.open", "").strip()
                    if len(clean_content) > 200:
                        description = clean_content[:200] + "..."
                    else:
                        description = clean_content

                # If still no description, create one from title
                if not description:
                    description = f"Read the full article: {title}"

            logger.debug(f"Final description: '{description}'")

            # Extract source
            source = self._extract_source(article_data)
            logger.debug(f"Source: '{source}'")

            # Parse published date
            published_at = self._parse_date(article_data.get("publishedAt"))
            logger.debug(f"Published at: {published_at}")

            # Simple sentiment analysis based on keywords
            sentiment_data = self._analyze_simple_sentiment(title + " " + description)
            logger.debug(f"Sentiment: {sentiment_data}")

            # Extract related tickers
            related_tickers = article_data.get("tickers", [])
            if not related_tickers:
                related_tickers = self._extract_simple_tickers(
                    title + " " + description, user_tickers
                )

            # Calculate relevance
            relevance_score = self._calculate_simple_relevance(
                related_tickers, user_tickers
            )

            # Determine sector
            sector = article_data.get("sector") or self._classify_simple_sector(
                title + " " + description
            )

            logger.debug("Creating NewsArticle object...")

            result = NewsArticle(
                id=str(hash(url))[-8:],  # Simple ID from URL hash
                title=title,
                summary=description,
                url=url,
                source=source,
                author=article_data.get("author"),
                published_at=published_at,
                sentiment=sentiment_data["sentiment"],
                sentiment_score=sentiment_data["score"],
                impact=ImpactLevel.MEDIUM,  # Default impact
                relevance_score=relevance_score,
                tags=sentiment_data.get("keywords", []),
                related_tickers=related_tickers,
                sector=sector,
                event_type=EventType.GENERAL,
                is_breaking=self._is_recent_news(published_at),
                image_url=article_data.get("urlToImage"),
            )

            logger.debug(f"Successfully created NewsArticle: {result.id}")
            return result

        except Exception as e:
            logger.error(f"Failed to create news article: {e}")
            import traceback

            logger.error(traceback.format_exc())
            return None

    def _extract_source(self, article_data: Dict[str, Any]) -> str:
        """Extract source name."""
        source = article_data.get("source", {})
        if isinstance(source, dict):
            return source.get("name", "Unknown")
        return str(source) if source else "Unknown"

    def _parse_date(self, date_str: str) -> datetime:
        """Parse date string safely."""
        if not date_str:
            return datetime.utcnow()

        try:
            if "T" in date_str:
                return datetime.fromisoformat(date_str.replace("Z", "+00:00"))
            return datetime.utcnow()
        except Exception:
            return datetime.utcnow()

    def _analyze_simple_sentiment(self, text: str) -> Dict[str, Any]:
        """Simple sentiment analysis using keywords."""
        text_lower = text.lower()

        positive_words = ["growth", "profit", "strong", "beat", "positive", "gain"]
        negative_words = ["loss", "decline", "fall", "weak", "negative", "drop"]

        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)

        if positive_count > negative_count:
            sentiment = SentimentType.POSITIVE
            score = 0.3
        elif negative_count > positive_count:
            sentiment = SentimentType.NEGATIVE
            score = -0.3
        else:
            sentiment = SentimentType.NEUTRAL
            score = 0.0

        return {
            "sentiment": sentiment,
            "score": score,
            "keywords": positive_words + negative_words,
        }

    def _extract_simple_tickers(self, text: str, user_tickers: List[str]) -> List[str]:
        """Simple ticker extraction."""
        tickers = []
        text_upper = text.upper()

        for ticker in user_tickers:
            if ticker.upper() in text_upper:
                tickers.append(ticker.upper())

        return tickers[:5]  # Limit to 5 tickers

    def _calculate_simple_relevance(
        self, article_tickers: List[str], user_tickers: List[str]
    ) -> float:
        """Simple relevance calculation."""
        if not user_tickers:
            return 0.3

        if not article_tickers:
            return 0.2

        overlap = set(article_tickers) & set(user_tickers)
        return min(1.0, len(overlap) / len(user_tickers) + 0.2)

    def _classify_simple_sector(self, text: str) -> Optional[str]:
        """Simple sector classification."""
        text_lower = text.lower()

        if any(word in text_lower for word in ["tech", "software", "ai"]):
            return "Technology"
        elif any(word in text_lower for word in ["healthcare", "pharma", "medical"]):
            return "Healthcare"
        elif any(word in text_lower for word in ["bank", "financial"]):
            return "Financial"
        elif any(word in text_lower for word in ["energy", "oil", "gas"]):
            return "Energy"
        else:
            return None

    def _is_recent_news(self, published_at: datetime) -> bool:
        """Check if news is recent (within 4 hours)."""
        now = datetime.utcnow()

        # Handle timezone-aware datetime
        if published_at.tzinfo is not None:
            # Convert both to UTC
            now = now.replace(tzinfo=published_at.tzinfo)

        time_diff = now - published_at
        return time_diff.total_seconds() < 14400  # 4 hours

    def _apply_filters(
        self, articles: List[NewsArticle], filters: NewsFilter
    ) -> List[NewsArticle]:
        """Apply filters to articles."""
        if not filters:
            return articles

        filtered = articles

        if filters.sentiment:
            filtered = [a for a in filtered if a.sentiment == filters.sentiment]

        if filters.impact:
            filtered = [a for a in filtered if a.impact == filters.impact]

        if filters.sector:
            filtered = [a for a in filtered if a.sector == filters.sector]

        if filters.tickers:
            filtered = [
                a
                for a in filtered
                if any(t in a.related_tickers for t in filters.tickers)
            ]

        if filters.search_query:
            query_lower = filters.search_query.lower()
            filtered = [
                a
                for a in filtered
                if query_lower in a.title.lower() or query_lower in a.summary.lower()
            ]

        return filtered

    def _calculate_metrics(self, articles: List[NewsArticle]) -> NewsMetrics:
        """Calculate news metrics."""
        if not articles:
            return NewsMetrics(
                total_articles=0,
                portfolio_relevant=0,
                breaking_news=0,
                positive_news=0,
                negative_news=0,
                neutral_news=0,
                average_sentiment=0.0,
            )

        positive_count = sum(
            1 for a in articles if a.sentiment == SentimentType.POSITIVE
        )
        negative_count = sum(
            1 for a in articles if a.sentiment == SentimentType.NEGATIVE
        )
        neutral_count = len(articles) - positive_count - negative_count

        avg_sentiment = sum(a.sentiment_score for a in articles) / len(articles)

        return NewsMetrics(
            total_articles=len(articles),
            portfolio_relevant=sum(1 for a in articles if a.relevance_score > 0.5),
            breaking_news=sum(1 for a in articles if a.is_breaking),
            positive_news=positive_count,
            negative_news=negative_count,
            neutral_news=neutral_count,
            average_sentiment=avg_sentiment,
        )

    def _calculate_market_sentiment(
        self, articles: List[NewsArticle]
    ) -> MarketSentiment:
        """Calculate market sentiment."""
        if not articles:
            return MarketSentiment(
                overall=OverallSentiment.NEUTRAL,
                score=0.0,
                trend=TrendType.STABLE,
                confidence=0.5,
                sectors_analysis=[],
            )

        sentiment_scores = [a.sentiment_score for a in articles]
        avg_score = sum(sentiment_scores) / len(sentiment_scores)

        if avg_score > 0.1:
            overall = OverallSentiment.BULLISH
        elif avg_score < -0.1:
            overall = OverallSentiment.BEARISH
        else:
            overall = OverallSentiment.NEUTRAL

        return MarketSentiment(
            overall=overall,
            score=avg_score,
            trend=TrendType.STABLE,
            confidence=0.7,
            sectors_analysis=[],
        )

    def _get_empty_response(self, page: int, page_size: int) -> NewsResponse:
        """Get empty response for error cases."""
        return NewsResponse(
            articles=[],
            total_count=0,
            page=page,
            page_size=page_size,
            has_next=False,
            metrics=NewsMetrics(
                total_articles=0,
                portfolio_relevant=0,
                breaking_news=0,
                positive_news=0,
                negative_news=0,
                neutral_news=0,
                average_sentiment=0.0,
            ),
            market_sentiment=MarketSentiment(
                overall=OverallSentiment.NEUTRAL,
                score=0.0,
                trend=TrendType.STABLE,
                confidence=0.0,
                sectors_analysis=[],
            ),
        )

    async def analyze_text_sentiment(
        self, text: str, context: str = ""
    ) -> SentimentAnalysisResponse:
        """Analyze sentiment of arbitrary text."""
        analysis = self._analyze_simple_sentiment(text + " " + context)

        return SentimentAnalysisResponse(
            sentiment=analysis["sentiment"],
            score=analysis["score"],
            confidence=0.7,
            keywords=analysis["keywords"][:10],
        )


# Global optimized service instance
optimized_news_service = OptimizedNewsService()
