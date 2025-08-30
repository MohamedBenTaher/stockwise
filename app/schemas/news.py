from pydantic import BaseModel, Field, HttpUrl
from typing import List, Optional, Literal
from datetime import datetime
from enum import Enum


class SentimentType(str, Enum):
    POSITIVE = "positive"
    NEGATIVE = "negative"
    NEUTRAL = "neutral"


class ImpactLevel(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class EventType(str, Enum):
    EARNINGS = "earnings"
    MERGER = "merger"
    REGULATION = "regulation"
    MARKET = "market"
    GENERAL = "general"


class TrendType(str, Enum):
    IMPROVING = "improving"
    DECLINING = "declining"
    STABLE = "stable"


class OverallSentiment(str, Enum):
    BULLISH = "bullish"
    BEARISH = "bearish"
    NEUTRAL = "neutral"


class NewsArticle(BaseModel):
    id: str = Field(..., description="Unique article identifier")
    title: str = Field(..., description="Article title")
    summary: str = Field(..., description="Article summary")
    content: Optional[str] = Field(None, description="Full article content")
    url: HttpUrl = Field(..., description="Article URL")
    source: str = Field(..., description="News source")
    author: Optional[str] = Field(None, description="Article author")
    published_at: datetime = Field(..., description="Publication timestamp")
    sentiment: SentimentType = Field(..., description="Article sentiment")
    sentiment_score: float = Field(
        ..., ge=-1.0, le=1.0, description="Sentiment score (-1 to 1)"
    )
    impact: ImpactLevel = Field(..., description="Market impact level")
    relevance_score: float = Field(
        ..., ge=0.0, le=1.0, description="Portfolio relevance (0 to 1)"
    )
    tags: List[str] = Field(default_factory=list, description="Article tags")
    related_tickers: List[str] = Field(
        default_factory=list, description="Related stock tickers"
    )
    sector: Optional[str] = Field(None, description="Primary sector")
    event_type: Optional[EventType] = Field(None, description="Event classification")
    is_breaking: bool = Field(default=False, description="Breaking news flag")
    is_bookmarked: bool = Field(default=False, description="User bookmark status")
    image_url: Optional[HttpUrl] = Field(None, description="Article image URL")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {datetime: lambda v: v.isoformat()}


class SectorSentiment(BaseModel):
    sector: str = Field(..., description="Sector name")
    sentiment: SentimentType = Field(..., description="Sector sentiment")
    score: float = Field(..., ge=-1.0, le=1.0, description="Sentiment score")
    news_count: int = Field(..., ge=0, description="Number of news articles")
    trend: TrendType = Field(..., description="Sentiment trend")


class MarketSentiment(BaseModel):
    overall: OverallSentiment = Field(..., description="Overall market sentiment")
    score: float = Field(..., ge=-1.0, le=1.0, description="Overall sentiment score")
    trend: TrendType = Field(..., description="Sentiment trend")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Analysis confidence")
    sectors_analysis: List[SectorSentiment] = Field(default_factory=list)
    last_updated: datetime = Field(default_factory=datetime.utcnow)


class NewsMetrics(BaseModel):
    total_articles: int = Field(..., ge=0, description="Total articles count")
    portfolio_relevant: int = Field(
        ..., ge=0, description="Portfolio-relevant articles"
    )
    breaking_news: int = Field(..., ge=0, description="Breaking news count")
    positive_news: int = Field(..., ge=0, description="Positive articles count")
    negative_news: int = Field(..., ge=0, description="Negative articles count")
    neutral_news: int = Field(..., ge=0, description="Neutral articles count")
    average_sentiment: float = Field(
        ..., ge=-1.0, le=1.0, description="Average sentiment"
    )
    last_update: datetime = Field(default_factory=datetime.utcnow)


class NewsFilter(BaseModel):
    sentiment: Optional[SentimentType] = None
    impact: Optional[ImpactLevel] = None
    event_type: Optional[EventType] = None
    sector: Optional[str] = None
    tickers: Optional[List[str]] = None
    sources: Optional[List[str]] = None
    is_breaking: Optional[bool] = None
    is_portfolio_relevant: Optional[bool] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    search_query: Optional[str] = None


class NewsResponse(BaseModel):
    articles: List[NewsArticle]
    total_count: int
    page: int
    page_size: int
    has_next: bool
    metrics: NewsMetrics
    market_sentiment: MarketSentiment


class NewsCreate(BaseModel):
    title: str
    summary: str
    content: Optional[str] = None
    url: HttpUrl
    source: str
    author: Optional[str] = None
    published_at: datetime
    tags: List[str] = Field(default_factory=list)
    related_tickers: List[str] = Field(default_factory=list)
    sector: Optional[str] = None
    event_type: Optional[EventType] = None
    image_url: Optional[HttpUrl] = None


class NewsUpdate(BaseModel):
    is_bookmarked: Optional[bool] = None
    tags: Optional[List[str]] = None


class SentimentAnalysisRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=10000)
    context: Optional[str] = None


class SentimentAnalysisResponse(BaseModel):
    sentiment: SentimentType
    score: float = Field(..., ge=-1.0, le=1.0)
    confidence: float = Field(..., ge=0.0, le=1.0)
    keywords: List[str] = Field(default_factory=list)
    analysis_time: datetime = Field(default_factory=datetime.utcnow)
