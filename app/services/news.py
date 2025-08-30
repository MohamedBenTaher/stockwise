import asyncio
import logging
from typing import List, Optional, Dict, Any, Tuple
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, desc, func
import httpx
import json
import hashlib
from textblob import TextBlob
import re

from app.config import settings
from app.schemas.news import (
    NewsArticle,
    NewsResponse,
    NewsMetrics,
    MarketSentiment,
    SectorSentiment,
    NewsFilter,
    SentimentType,
    ImpactLevel,
    EventType,
    TrendType,
    OverallSentiment,
    SentimentAnalysisResponse,
)

logger = logging.getLogger(__name__)


class SentimentAnalyzer:
    """Advanced sentiment analysis service with market context."""

    def __init__(self):
        # Market-specific sentiment keywords
        self.bullish_keywords = {
            "beat",
            "exceed",
            "outperform",
            "surge",
            "rally",
            "growth",
            "profit",
            "gain",
            "bullish",
            "upgrade",
            "strong",
            "positive",
            "buy",
            "breakthrough",
            "success",
            "momentum",
            "rise",
            "boost",
        }

        self.bearish_keywords = {
            "miss",
            "underperform",
            "decline",
            "fall",
            "drop",
            "loss",
            "bearish",
            "downgrade",
            "weak",
            "negative",
            "sell",
            "crash",
            "failure",
            "concern",
            "risk",
            "warning",
            "cut",
            "reduce",
        }

        # Impact keywords
        self.high_impact_keywords = {
            "earnings",
            "merger",
            "acquisition",
            "bankruptcy",
            "ipo",
            "split",
            "dividend",
            "guidance",
            "forecast",
            "regulation",
        }

    def analyze_sentiment(self, text: str, context: str = "") -> Dict[str, Any]:
        """Analyze sentiment with market context."""
        try:
            # Clean and prepare text
            clean_text = self._clean_text(text + " " + context)

            # TextBlob analysis
            blob = TextBlob(clean_text)
            polarity = blob.sentiment.polarity
            subjectivity = blob.sentiment.subjectivity

            # Market-specific keyword analysis
            text_lower = clean_text.lower()
            bullish_score = sum(
                1 for word in self.bullish_keywords if word in text_lower
            )
            bearish_score = sum(
                1 for word in self.bearish_keywords if word in text_lower
            )

            # Combined score
            keyword_score = (bullish_score - bearish_score) / max(
                bullish_score + bearish_score, 1
            )

            # Weighted final score
            final_score = (polarity * 0.6) + (keyword_score * 0.4)

            # Determine sentiment type
            if final_score > 0.1:
                sentiment = SentimentType.POSITIVE
            elif final_score < -0.1:
                sentiment = SentimentType.NEGATIVE
            else:
                sentiment = SentimentType.NEUTRAL

            # Confidence based on subjectivity and keyword presence
            confidence = min(
                1.0, abs(final_score) + ((bullish_score + bearish_score) * 0.1)
            )

            # Extract keywords
            keywords = self._extract_keywords(text_lower)

            return {
                "sentiment": sentiment,
                "score": max(-1.0, min(1.0, final_score)),
                "confidence": confidence,
                "keywords": keywords[:10],  # Top 10 keywords
                "raw_polarity": polarity,
                "subjectivity": subjectivity,
                "bullish_signals": bullish_score,
                "bearish_signals": bearish_score,
            }

        except Exception as e:
            logger.error(f"Sentiment analysis failed: {e}")
            return {
                "sentiment": SentimentType.NEUTRAL,
                "score": 0.0,
                "confidence": 0.0,
                "keywords": [],
                "error": str(e),
            }

    def _clean_text(self, text: str) -> str:
        """Clean text for analysis."""
        # Remove URLs, special characters, extra spaces
        text = re.sub(r"http\S+", "", text)
        text = re.sub(r"[^\w\s]", " ", text)
        text = re.sub(r"\s+", " ", text)
        return text.strip()

    def _extract_keywords(self, text: str) -> List[str]:
        """Extract relevant financial keywords."""
        # Simple keyword extraction - can be enhanced with NLP libraries
        words = text.split()
        # Filter for financial/business terms (longer than 3 chars)
        keywords = [word for word in words if len(word) > 3 and word.isalpha()]
        return list(set(keywords))

    def calculate_impact_level(self, text: str, tickers: List[str]) -> ImpactLevel:
        """Calculate market impact level."""
        text_lower = text.lower()

        # High impact indicators
        if any(keyword in text_lower for keyword in self.high_impact_keywords):
            return ImpactLevel.HIGH

        # Multiple tickers mentioned = medium impact
        if len(tickers) > 2:
            return ImpactLevel.MEDIUM

        # Default to low impact
        return ImpactLevel.LOW


class NewsService:
    """News service with AI-powered analysis and sentiment tracking."""

    def __init__(self):
        self.sentiment_analyzer = SentimentAnalyzer()
        self.news_sources = {
            "newsapi": {
                "url": "https://newsapi.org/v2/everything",
                "key": (
                    settings.NEWS_API_KEY if hasattr(settings, "NEWS_API_KEY") else None
                ),
            },
            "alpha_vantage": {
                "url": "https://www.alphavantage.co/query",
                "key": settings.ALPHA_VANTAGE_API_KEY,
            },
        }

    async def fetch_news_articles(
        self,
        user_tickers: List[str] = None,
        filters: NewsFilter = None,
        page: int = 1,
        page_size: int = 20,
    ) -> NewsResponse:
        """Fetch and analyze news articles."""
        try:
            logger.info(f"Fetching news for tickers: {user_tickers}")

            # Get fresh articles from external APIs
            raw_articles = await self._fetch_from_external_sources(user_tickers)

            # Process and analyze articles
            analyzed_articles = []
            for article_data in raw_articles:
                try:
                    analyzed_article = await self._process_article(
                        article_data, user_tickers or []
                    )
                    if analyzed_article:
                        analyzed_articles.append(analyzed_article)
                except Exception as e:
                    logger.warning(f"Failed to process article: {e}")
                    continue

            # Apply filters
            filtered_articles = self._apply_filters(analyzed_articles, filters)

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

            # Calculate metrics and sentiment
            metrics = self._calculate_metrics(filtered_articles)
            market_sentiment = self._calculate_market_sentiment(filtered_articles)

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
            # Return empty response with error indication
            return self._get_empty_response(page, page_size)

    async def _fetch_from_external_sources(
        self, tickers: List[str] = None
    ) -> List[Dict[str, Any]]:
        """Fetch from external news sources."""
        all_articles = []

        # NewsAPI integration
        if self.news_sources["newsapi"]["key"]:
            try:
                newsapi_articles = await self._fetch_from_newsapi(tickers)
                all_articles.extend(newsapi_articles)
            except Exception as e:
                logger.warning(f"NewsAPI fetch failed: {e}")

        # Alpha Vantage News (if available)
        if self.news_sources["alpha_vantage"]["key"]:
            try:
                av_articles = await self._fetch_from_alpha_vantage(tickers)
                all_articles.extend(av_articles)
            except Exception as e:
                logger.warning(f"Alpha Vantage news fetch failed: {e}")

        # If no external data, use mock data
        if not all_articles:
            all_articles = self._get_mock_articles(tickers)

        return all_articles

    async def _fetch_from_newsapi(self, tickers: List[str] = None) -> List[Dict]:
        """Fetch from NewsAPI."""
        try:
            async with httpx.AsyncClient() as client:
                # Build query
                query = "stocks OR market OR finance"
                if tickers:
                    ticker_query = " OR ".join(
                        [f'"{ticker}"' for ticker in tickers[:5]]
                    )
                    query = f"({query}) OR ({ticker_query})"

                params = {
                    "q": query,
                    "apiKey": self.news_sources["newsapi"]["key"],
                    "language": "en",
                    "sortBy": "publishedAt",
                    "pageSize": 50,
                    "from": (datetime.now() - timedelta(days=7)).isoformat(),
                }

                response = await client.get(
                    self.news_sources["newsapi"]["url"], params=params, timeout=10.0
                )

                if response.status_code == 200:
                    data = response.json()
                    return data.get("articles", [])
                else:
                    logger.warning(f"NewsAPI error: {response.status_code}")
                    return []

        except Exception as e:
            logger.error(f"NewsAPI fetch error: {e}")
            return []

    async def _fetch_from_alpha_vantage(self, tickers: List[str] = None) -> List[Dict]:
        """Fetch from Alpha Vantage News API."""
        try:
            async with httpx.AsyncClient() as client:
                params = {
                    "function": "NEWS_SENTIMENT",
                    "apikey": self.news_sources["alpha_vantage"]["key"],
                    "limit": 50,
                }

                if tickers:
                    params["tickers"] = ",".join(tickers[:5])

                response = await client.get(
                    self.news_sources["alpha_vantage"]["url"],
                    params=params,
                    timeout=10.0,
                )

                if response.status_code == 200:
                    data = response.json()
                    return data.get("feed", [])
                else:
                    logger.warning(f"Alpha Vantage news error: {response.status_code}")
                    return []

        except Exception as e:
            logger.error(f"Alpha Vantage news fetch error: {e}")
            return []

    async def _process_article(
        self, raw_article: Dict[str, Any], user_tickers: List[str]
    ) -> Optional[NewsArticle]:
        """Process and analyze a single article."""
        try:
            # Extract basic info (handle different API formats)
            title = raw_article.get("title", "")
            description = raw_article.get("description") or raw_article.get(
                "summary", ""
            )
            url = raw_article.get("url", "")
            source = self._extract_source(raw_article)

            if not title or not url:
                return None

            # Generate unique ID
            article_id = hashlib.md5(url.encode()).hexdigest()

            # Parse date
            published_at = self._parse_date(
                raw_article.get("publishedAt") or raw_article.get("time_published")
            )

            # Analyze content
            content = title + " " + description
            sentiment_analysis = self.sentiment_analyzer.analyze_sentiment(content)

            # Extract tickers mentioned
            related_tickers = self._extract_tickers(content, user_tickers)

            # Calculate relevance to user portfolio
            relevance_score = self._calculate_relevance(related_tickers, user_tickers)

            # Determine impact level
            impact = self.sentiment_analyzer.calculate_impact_level(
                content, related_tickers
            )

            # Extract sector and event type
            sector = self._classify_sector(content)
            event_type = self._classify_event_type(content)

            return NewsArticle(
                id=article_id,
                title=title,
                summary=description,
                url=url,
                source=source,
                author=raw_article.get("author"),
                published_at=published_at,
                sentiment=sentiment_analysis["sentiment"],
                sentiment_score=sentiment_analysis["score"],
                impact=impact,
                relevance_score=relevance_score,
                tags=sentiment_analysis["keywords"],
                related_tickers=related_tickers,
                sector=sector,
                event_type=event_type,
                is_breaking=self._is_breaking_news(raw_article, published_at),
                image_url=raw_article.get("urlToImage"),
            )

        except Exception as e:
            logger.error(f"Article processing failed: {e}")
            return None

    def _extract_source(self, raw_article: Dict[str, Any]) -> str:
        """Extract source name from article."""
        source = raw_article.get("source", {})
        if isinstance(source, dict):
            return source.get("name", "Unknown")
        return str(source) if source else "Unknown"

    def _parse_date(self, date_str: str) -> datetime:
        """Parse date string to datetime."""
        if not date_str:
            return datetime.utcnow()

        try:
            # Handle different date formats
            if "T" in date_str:
                return datetime.fromisoformat(date_str.replace("Z", "+00:00"))
            else:
                # Try common formats
                for fmt in ["%Y%m%dT%H%M%S", "%Y-%m-%d %H:%M:%S"]:
                    try:
                        return datetime.strptime(date_str, fmt)
                    except ValueError:
                        continue
                return datetime.utcnow()
        except Exception:
            return datetime.utcnow()

    def _extract_tickers(self, content: str, user_tickers: List[str]) -> List[str]:
        """Extract ticker symbols from content."""
        # Simple ticker extraction - can be enhanced
        tickers = []
        content_upper = content.upper()

        # Check for user tickers
        for ticker in user_tickers:
            if ticker.upper() in content_upper:
                tickers.append(ticker.upper())

        # Common ticker pattern (3-5 uppercase letters)
        import re

        ticker_pattern = r"\b[A-Z]{3,5}\b"
        potential_tickers = re.findall(ticker_pattern, content_upper)

        # Filter common words that aren't tickers
        common_words = {
            "THE",
            "AND",
            "FOR",
            "ARE",
            "BUT",
            "NOT",
            "YOU",
            "ALL",
            "CAN",
            "HIS",
            "HER",
            "WAS",
            "ONE",
            "OUR",
            "OUT",
            "DAY",
            "GET",
            "HAS",
            "HIM",
            "OLD",
            "SEE",
            "TWO",
            "WHO",
            "ITS",
            "NOW",
            "DID",
            "YES",
            "YET",
            "HOW",
            "TOO",
            "ANY",
            "NEW",
            "WAY",
            "MAY",
            "USE",
            "OWN",
            "SAY",
            "SHE",
            "GOT",
            "WHY",
            "LET",
            "PUT",
            "END",
            "ASK",
            "TRY",
            "OLD",
            "AGO",
            "SET",
            "RUN",
            "HOT",
            "CUT",
            "OFF",
            "FAR",
            "SEA",
            "EYE",
            "BAD",
            "EAT",
            "AGE",
            "RED",
            "TOP",
            "ARM",
            "JOB",
            "LOT",
            "BIG",
            "BOX",
            "FEW",
            "HIT",
            "MAN",
            "CAR",
            "DOG",
            "SUN",
            "AIR",
            "FUN",
            "BAG",
            "BED",
            "SIT",
            "WIN",
            "BUY",
            "GUN",
            "SON",
            "RUN",
            "CUP",
            "GOD",
            "LAW",
            "PAY",
            "SIX",
            "WAR",
            "BOY",
            "HAD",
            "ART",
            "EAR",
            "FIT",
            "LAY",
            "OIL",
            "SIR",
            "TEN",
            "BIT",
            "DUE",
            "FLY",
            "GAS",
            "ODD",
            "PAN",
            "PHD",
            "RAW",
            "SAD",
            "TAX",
            "TIP",
            "VAN",
            "YES",
            "ZIP",
        }

        for ticker in potential_tickers:
            if ticker not in common_words and len(ticker) <= 5:
                tickers.append(ticker)

        return list(set(tickers))[:10]  # Limit to 10 tickers

    def _calculate_relevance(
        self, article_tickers: List[str], user_tickers: List[str]
    ) -> float:
        """Calculate article relevance to user portfolio."""
        if not user_tickers:
            return 0.3  # Base relevance for general market news

        if not article_tickers:
            return 0.2  # Lower relevance if no specific tickers mentioned

        # Calculate overlap
        overlap = set(article_tickers) & set(user_tickers)
        relevance = len(overlap) / len(user_tickers)

        return min(1.0, relevance + 0.2)  # Boost relevance but cap at 1.0

    def _classify_sector(self, content: str) -> Optional[str]:
        """Classify article by sector."""
        content_lower = content.lower()

        sector_keywords = {
            "Technology": [
                "tech",
                "software",
                "cloud",
                "ai",
                "artificial intelligence",
                "semiconductor",
            ],
            "Healthcare": ["healthcare", "pharma", "medical", "drug", "biotech"],
            "Financial": ["bank", "financial", "insurance", "fintech", "payment"],
            "Energy": ["oil", "gas", "energy", "renewable", "solar", "wind"],
            "Consumer": ["retail", "consumer", "restaurant", "food", "beverage"],
            "Industrial": ["manufacturing", "industrial", "construction", "materials"],
            "Real Estate": ["real estate", "reit", "property", "housing"],
            "Utilities": ["utility", "utilities", "electric", "water", "power"],
        }

        for sector, keywords in sector_keywords.items():
            if any(keyword in content_lower for keyword in keywords):
                return sector

        return None

    def _classify_event_type(self, content: str) -> Optional[EventType]:
        """Classify article by event type."""
        content_lower = content.lower()

        if any(
            word in content_lower
            for word in ["earnings", "quarterly", "revenue", "profit"]
        ):
            return EventType.EARNINGS
        elif any(
            word in content_lower
            for word in ["merger", "acquisition", "buyout", "deal"]
        ):
            return EventType.MERGER
        elif any(
            word in content_lower for word in ["regulation", "regulatory", "sec", "fda"]
        ):
            return EventType.REGULATION
        elif any(
            word in content_lower
            for word in ["market", "index", "dow", "nasdaq", "sp500"]
        ):
            return EventType.MARKET
        else:
            return EventType.GENERAL

    def _is_breaking_news(self, raw_article: Dict, published_at: datetime) -> bool:
        """Determine if article is breaking news."""
        # Consider news breaking if published within last 2 hours
        time_diff = datetime.utcnow() - published_at
        return time_diff.total_seconds() < 7200

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

        if filters.event_type:
            filtered = [a for a in filtered if a.event_type == filters.event_type]

        if filters.sector:
            filtered = [a for a in filtered if a.sector == filters.sector]

        if filters.tickers:
            filtered = [
                a
                for a in filtered
                if any(t in a.related_tickers for t in filters.tickers)
            ]

        if filters.is_breaking is not None:
            filtered = [a for a in filtered if a.is_breaking == filters.is_breaking]

        if filters.is_portfolio_relevant is not None:
            threshold = 0.5 if filters.is_portfolio_relevant else 0.0
            filtered = [a for a in filtered if a.relevance_score >= threshold]

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
        """Calculate overall market sentiment."""
        if not articles:
            return MarketSentiment(
                overall=OverallSentiment.NEUTRAL,
                score=0.0,
                trend=TrendType.STABLE,
                confidence=0.0,
                sectors_analysis=[],
            )

        # Calculate overall sentiment
        sentiment_scores = [a.sentiment_score for a in articles]
        avg_score = sum(sentiment_scores) / len(sentiment_scores)

        # Determine overall sentiment
        if avg_score > 0.1:
            overall = OverallSentiment.BULLISH
        elif avg_score < -0.1:
            overall = OverallSentiment.BEARISH
        else:
            overall = OverallSentiment.NEUTRAL

        # Calculate confidence based on consistency
        score_variance = sum((s - avg_score) ** 2 for s in sentiment_scores) / len(
            sentiment_scores
        )
        confidence = max(0.1, min(1.0, 1.0 - score_variance))

        # Sector analysis
        sectors_analysis = self._analyze_sector_sentiment(articles)

        return MarketSentiment(
            overall=overall,
            score=avg_score,
            trend=TrendType.STABLE,  # Could be enhanced with historical data
            confidence=confidence,
            sectors_analysis=sectors_analysis,
        )

    def _analyze_sector_sentiment(
        self, articles: List[NewsArticle]
    ) -> List[SectorSentiment]:
        """Analyze sentiment by sector."""
        sector_data = {}

        for article in articles:
            if article.sector:
                if article.sector not in sector_data:
                    sector_data[article.sector] = []
                sector_data[article.sector].append(article.sentiment_score)

        sectors_analysis = []
        for sector, scores in sector_data.items():
            avg_score = sum(scores) / len(scores)

            if avg_score > 0.1:
                sentiment = SentimentType.POSITIVE
            elif avg_score < -0.1:
                sentiment = SentimentType.NEGATIVE
            else:
                sentiment = SentimentType.NEUTRAL

            sectors_analysis.append(
                SectorSentiment(
                    sector=sector,
                    sentiment=sentiment,
                    score=avg_score,
                    news_count=len(scores),
                    trend=TrendType.STABLE,
                )
            )

        return sectors_analysis

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

    def _get_mock_articles(self, tickers: List[str] = None) -> List[Dict[str, Any]]:
        """Generate mock articles for testing."""
        mock_articles = [
            {
                "title": "Tech Stocks Rally on Strong Earnings Reports",
                "description": "Technology companies report better-than-expected quarterly results, driving market optimism.",
                "url": "https://example.com/tech-rally",
                "source": {"name": "Financial Times"},
                "publishedAt": datetime.utcnow().isoformat(),
                "author": "Market Reporter",
            },
            {
                "title": "Federal Reserve Signals Potential Rate Changes",
                "description": "Central bank officials discuss monetary policy adjustments in response to economic indicators.",
                "url": "https://example.com/fed-rates",
                "source": {"name": "Reuters"},
                "publishedAt": (datetime.utcnow() - timedelta(hours=2)).isoformat(),
                "author": "Economic Correspondent",
            },
            {
                "title": "Energy Sector Faces Regulatory Challenges",
                "description": "New environmental regulations impact energy companies operations and future planning.",
                "url": "https://example.com/energy-regulations",
                "source": {"name": "Bloomberg"},
                "publishedAt": (datetime.utcnow() - timedelta(hours=4)).isoformat(),
                "author": "Energy Analyst",
            },
        ]

        # Add ticker-specific articles if provided
        if tickers:
            for ticker in tickers[:3]:
                mock_articles.append(
                    {
                        "title": f"{ticker} Reports Quarterly Results",
                        "description": f"{ticker} announces quarterly earnings with mixed results and forward guidance.",
                        "url": f"https://example.com/{ticker.lower()}-earnings",
                        "source": {"name": "MarketWatch"},
                        "publishedAt": (
                            datetime.utcnow() - timedelta(hours=1)
                        ).isoformat(),
                        "author": "Earnings Reporter",
                    }
                )

        return mock_articles

    async def analyze_text_sentiment(
        self, text: str, context: str = ""
    ) -> SentimentAnalysisResponse:
        """Analyze sentiment of arbitrary text."""
        analysis = self.sentiment_analyzer.analyze_sentiment(text, context)

        return SentimentAnalysisResponse(
            sentiment=analysis["sentiment"],
            score=analysis["score"],
            confidence=analysis["confidence"],
            keywords=analysis["keywords"],
        )


# Global service instance
news_service = NewsService()
