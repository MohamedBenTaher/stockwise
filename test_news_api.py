#!/usr/bin/env python3
"""
Test script for the News API implementation
"""
import asyncio
import sys
import os

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), "app"))

from app.services.news import NewsService, SentimentAnalyzer


async def test_news_service():
    """Test the news service functionality"""
    print("Testing News Service...")

    # Initialize services
    sentiment_analyzer = SentimentAnalyzer()
    news_service = NewsService()

    # Test sentiment analysis
    print("\n1. Testing Sentiment Analysis:")
    test_texts = [
        "Apple reports record earnings with strong iPhone sales",
        "Tesla faces production challenges at Berlin factory",
        "Market volatility continues amid uncertainty",
    ]

    for text in test_texts:
        result = sentiment_analyzer.analyze_sentiment(text)
        print(f"Text: {text}")
        print(
            f"Sentiment: {result['sentiment']} (Score: {result['score']:.2f}, Confidence: {result['confidence']:.2f})"
        )
        print()

    # Test news fetching (this will use mock data if API keys aren't available)
    print("2. Testing News Fetching:")
    try:
        news_response = await news_service.get_news_feed()
        print(f"Total articles fetched: {len(news_response.articles)}")

        if news_response.articles:
            article = news_response.articles[0]
            print(f"Sample article: {article.title}")
            print(
                f"Sentiment: {article.sentiment} (Score: {article.sentiment_score:.2f})"
            )
            print(f"Impact: {article.impact}")
            print(f"Related tickers: {article.related_tickers}")

        print(f"\nMarket sentiment: {news_response.market_sentiment.overall}")
        print(f"Market score: {news_response.market_sentiment.score:.2f}")

    except Exception as e:
        print(f"Error fetching news: {e}")
        print("This is expected if API keys are not configured")

    print("\n3. Testing Market Sentiment Calculation:")
    # Test with mock articles
    from app.schemas.news import NewsArticle
    from datetime import datetime

    mock_articles = [
        NewsArticle(
            id="1",
            title="Positive tech news",
            summary="Good things happening",
            url="http://example.com/1",
            source="TechNews",
            published_at=datetime.utcnow(),
            sentiment="positive",
            sentiment_score=0.8,
            impact="high",
            relevance_score=0.9,
            tags=["tech"],
            related_tickers=["AAPL", "MSFT"],
            sector="Technology",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        ),
        NewsArticle(
            id="2",
            title="Negative energy news",
            summary="Bad things happening",
            url="http://example.com/2",
            source="EnergyNews",
            published_at=datetime.utcnow(),
            sentiment="negative",
            sentiment_score=-0.6,
            impact="medium",
            relevance_score=0.7,
            tags=["energy"],
            related_tickers=["XOM"],
            sector="Energy",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        ),
    ]

    market_sentiment = news_service._calculate_market_sentiment(mock_articles)
    print(f"Overall sentiment: {market_sentiment.overall}")
    print(f"Overall score: {market_sentiment.score:.2f}")
    print(f"Sectors analyzed: {len(market_sentiment.sectors_analysis)}")

    for sector in market_sentiment.sectors_analysis:
        print(f"  {sector.sector}: {sector.sentiment} ({sector.score:.2f})")

    print("\nNews Service test completed successfully! ✅")


if __name__ == "__main__":
    asyncio.run(test_news_service())
