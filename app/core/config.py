"""
Core configuration and constants.
"""

from typing import Dict


class CacheConfig:
    """Cache configuration constants."""

    # TTL values in seconds
    PRICE_TTL = 1800  # 30 minutes
    METADATA_TTL = 7200  # 2 hours
    POPULAR_STOCKS_TTL = 86400  # 24 hours
    STOCK_QUOTE_TTL = 300  # 5 minutes
    DAILY_PERFORMANCE_TTL = 1800  # 30 minutes

    # Cache key prefixes
    PRICE_KEY_PREFIX = "price:"
    METADATA_KEY_PREFIX = "metadata:"
    POPULAR_STOCKS_KEY = "popular_stocks"
    STOCK_QUOTE_KEY_PREFIX = "stock_quote:"
    DAILY_PERFORMANCE_KEY_PREFIX = "daily_performance:"


class RateLimitConfig:
    """Rate limiting configuration."""

    MIN_REQUEST_INTERVAL = 1.0  # 1 second between requests
    MAX_CONCURRENT_REQUESTS = 3
    BATCH_SIZE = 10  # Maximum tickers per batch request


class DefaultPrices:
    """Default fallback prices for common stocks."""

    FALLBACK_PRICES: Dict[str, float] = {
        "AAPL": 150.0,
        "MSFT": 300.0,
        "GOOGL": 2500.0,
        "AMZN": 3000.0,
        "TSLA": 200.0,
        "META": 250.0,
        "NVDA": 400.0,
        "BRK.B": 300.0,
        "V": 250.0,
        "JNJ": 170.0,
        "WMT": 140.0,
        "JPM": 150.0,
        "PG": 150.0,
        "UNH": 500.0,
        "HD": 300.0,
        "MA": 350.0,
        "DIS": 100.0,
        "ADBE": 400.0,
        "NFLX": 400.0,
        "XOM": 100.0,
        "SPY": 400.0,
        "QQQ": 350.0,
        "VTI": 200.0,
    }
