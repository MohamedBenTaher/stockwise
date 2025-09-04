import asyncio
import json
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor
import httpx
import redis.asyncio as redis
import yfinance as yf
from app.config import settings

logger = logging.getLogger(__name__)


class StockService:
    """Enhanced stock service with Redis caching and multiple data sources."""

    def __init__(self):
        self.executor = ThreadPoolExecutor(max_workers=10)
        self.redis = None
        self.alpha_vantage_base_url = "https://www.alphavantage.co/query"
        self.cache_ttl = {
            "popular_stocks": 86400,  # 24 hours
            "stock_quote": 300,  # 5 minutes
            "stock_metadata": 3600,  # 1 hour
            "daily_performance": 1800,  # 30 minutes
        }

    async def _get_redis(self):
        """Get Redis connection."""
        if self.redis is None:
            try:
                self.redis = redis.from_url(settings.REDIS_URL, decode_responses=True)
                await self.redis.ping()
            except Exception as e:
                logger.warning(f"Redis connection failed: {e}")
                self.redis = None
        return self.redis

    async def _cache_get(self, key: str) -> Optional[Any]:
        """Get value from cache."""
        try:
            redis_client = await self._get_redis()
            if redis_client:
                value = await redis_client.get(key)
                if value:
                    return json.loads(value)
        except Exception as e:
            logger.warning(f"Cache get error for {key}: {e}")
        return None

    async def _cache_set(self, key: str, value: Any, ttl: int):
        """Set value in cache."""
        try:
            redis_client = await self._get_redis()
            if redis_client:
                await redis_client.setex(key, ttl, json.dumps(value, default=str))
        except Exception as e:
            logger.warning(f"Cache set error for {key}: {e}")

    async def get_popular_stocks(self) -> List[Dict[str, str]]:
        """Get popular stocks from cache or fetch from API."""
        cache_key = "popular_stocks"
        cached_data = await self._cache_get(cache_key)

        if cached_data:
            logger.info("Returning cached popular stocks")
            return cached_data

        # Fetch from Alpha Vantage or fallback to static list
        popular_stocks = await self._fetch_popular_stocks()

        # Cache the result
        await self._cache_set(
            cache_key, popular_stocks, self.cache_ttl["popular_stocks"]
        )

        return popular_stocks

    async def _fetch_popular_stocks(self) -> List[Dict[str, str]]:
        """Fetch popular stocks from Alpha Vantage API."""
        try:
            # Temporarily skip Alpha Vantage to avoid timeouts
            # if settings.ALPHA_VANTAGE_API_KEY:
            #     # Try to fetch from Alpha Vantage
            #     popular_stocks = await self._fetch_from_alpha_vantage()
            #     if popular_stocks:
            #         return popular_stocks
            logger.info("Using static stocks list for better performance")
        except Exception as e:
            logger.warning(f"Alpha Vantage fetch failed: {e}")

        # Fallback to enhanced static list with more data
        return await self._get_enhanced_static_stocks()

    async def _fetch_from_alpha_vantage(self) -> Optional[List[Dict[str, str]]]:
        """Fetch popular stocks from Alpha Vantage."""
        try:
            # Alpha Vantage doesn't have a direct "popular stocks" endpoint
            # So we'll fetch data for our known popular stocks to enhance them
            popular_tickers = [
                "AAPL",
                "MSFT",
                "GOOGL",
                "AMZN",
                "NVDA",
                "TSLA",
                "META",
                "BRK.B",
                "V",
                "JNJ",
                "WMT",
                "JPM",
                "PG",
                "UNH",
                "HD",
                "MA",
                "DIS",
                "ADBE",
                "BAC",
                "CRM",
                "NFLX",
                "XOM",
                "CVX",
                "AMD",
                "PFE",
                "SPY",
                "QQQ",
                "VTI",
            ]

            enhanced_stocks = []

            # Fetch metadata for each stock in batches
            for i in range(0, len(popular_tickers), 5):  # Process in batches of 5
                batch = popular_tickers[i : i + 5]
                batch_tasks = [self._get_stock_overview(ticker) for ticker in batch]
                batch_results = await asyncio.gather(
                    *batch_tasks, return_exceptions=True
                )

                for ticker, result in zip(batch, batch_results):
                    if isinstance(result, Exception):
                        # Fallback to basic info
                        enhanced_stocks.append(await self._get_basic_stock_info(ticker))
                    else:
                        enhanced_stocks.append(result)

            return enhanced_stocks

        except Exception as e:
            logger.error(f"Error fetching from Alpha Vantage: {e}")
            return None

    async def _get_stock_overview(self, ticker: str) -> Dict[str, str]:
        """Get stock overview from Alpha Vantage."""
        try:
            if not settings.ALPHA_VANTAGE_API_KEY:
                logger.debug("Alpha Vantage API key not set, skipping overview fetch")
                return {
                    "value": ticker,
                    "label": f"{ticker} - {ticker}",
                    "sector": "",
                    "industry": "",
                    "market_cap": "",
                    "exchange": "",
                }
            async with httpx.AsyncClient() as client:
                params = {
                    "function": "OVERVIEW",
                    "symbol": ticker,
                    "apikey": settings.ALPHA_VANTAGE_API_KEY,
                }

                response = await client.get(self.alpha_vantage_base_url, params=params)
                data = response.json()

                if "Symbol" in data:
                    return {
                        "value": ticker,
                        "label": f"{ticker} - {data.get('Name', ticker)}",
                        "sector": data.get("Sector", ""),
                        "industry": data.get("Industry", ""),
                        "market_cap": data.get("MarketCapitalization", ""),
                        "exchange": data.get("Exchange", ""),
                    }
        except Exception as e:
            logger.warning(f"Failed to get overview for {ticker}: {e}")

        return await self._get_basic_stock_info(ticker)

    async def _get_basic_stock_info(self, ticker: str) -> Dict[str, str]:
        """Get basic stock info as fallback."""
        # Static fallback data
        stock_names = {
            "AAPL": "Apple Inc.",
            "MSFT": "Microsoft Corporation",
            "GOOGL": "Alphabet Inc.",
            "AMZN": "Amazon.com Inc.",
            "NVDA": "NVIDIA Corporation",
            "TSLA": "Tesla, Inc.",
            "META": "Meta Platforms, Inc.",
            "BRK.B": "Berkshire Hathaway Inc.",
            "V": "Visa Inc.",
            "JNJ": "Johnson & Johnson",
            "WMT": "Walmart Inc.",
            "JPM": "JPMorgan Chase & Co.",
            "PG": "Procter & Gamble Company",
            "UNH": "UnitedHealth Group Incorporated",
            "HD": "The Home Depot, Inc.",
            "MA": "Mastercard Incorporated",
            "DIS": "The Walt Disney Company",
            "ADBE": "Adobe Inc.",
            "BAC": "Bank of America Corporation",
            "CRM": "Salesforce, Inc.",
            "NFLX": "Netflix, Inc.",
            "XOM": "Exxon Mobil Corporation",
            "CVX": "Chevron Corporation",
            "AMD": "Advanced Micro Devices, Inc.",
            "PFE": "Pfizer Inc.",
            "SPY": "SPDR S&P 500 ETF Trust",
            "QQQ": "Invesco QQQ Trust",
            "VTI": "Vanguard Total Stock Market ETF",
        }

        name = stock_names.get(ticker, ticker)
        return {
            "value": ticker,
            "label": f"{ticker} - {name}",
            "sector": "",
            "industry": "",
            "market_cap": "",
            "exchange": "",
        }

    async def _get_enhanced_static_stocks(self) -> List[Dict[str, str]]:
        """Get enhanced static stock list with yfinance data."""
        static_tickers = [
            "AAPL",
            "MSFT",
            "GOOGL",
            "AMZN",
            "NVDA",
            "TSLA",
            "META",
            "BRK.B",
            "V",
            "JNJ",
            "WMT",
            "JPM",
            "PG",
            "UNH",
            "HD",
            "MA",
            "DIS",
            "ADBE",
            "BAC",
            "CRM",
            "NFLX",
            "XOM",
            "CVX",
            "AMD",
            "PFE",
            "TMO",
            "COST",
            "ABBV",
            "ACN",
            "MRK",
            "LLY",
            "PEP",
            "AVGO",
            "TXN",
            "ABT",
            "ORCL",
            "NKE",
            "DHR",
            "VZ",
            "COP",
            "SPY",
            "QQQ",
            "VTI",
            "IWM",
            "EEM",
            "GLD",
            "SLV",
            "TLT",
            "BITO",
        ]

        enhanced_stocks = []

        # Process in batches to avoid overwhelming yfinance
        for i in range(0, len(static_tickers), 10):
            batch = static_tickers[i : i + 10]
            batch_tasks = [self._enhance_with_yfinance(ticker) for ticker in batch]
            batch_results = await asyncio.gather(*batch_tasks, return_exceptions=True)

            for ticker, result in zip(batch, batch_results):
                if isinstance(result, Exception):
                    enhanced_stocks.append(await self._get_basic_stock_info(ticker))
                else:
                    enhanced_stocks.append(result)

        return enhanced_stocks

    async def _enhance_with_yfinance(self, ticker: str) -> Dict[str, str]:
        """Enhance stock info with yfinance data."""
        try:
            loop = asyncio.get_event_loop()
            stock_info = await loop.run_in_executor(
                self.executor, self._fetch_yfinance_info, ticker
            )

            if stock_info:
                return {
                    "value": ticker,
                    "label": f"{ticker} - {stock_info.get('longName', ticker)}",
                    "sector": stock_info.get("sector", ""),
                    "industry": stock_info.get("industry", ""),
                    "market_cap": str(stock_info.get("marketCap", "")),
                    "exchange": stock_info.get("exchange", ""),
                }
        except Exception as e:
            logger.warning(f"Failed to enhance {ticker} with yfinance: {e}")

        return await self._get_basic_stock_info(ticker)

    def _fetch_yfinance_info(self, ticker: str) -> Optional[Dict[str, Any]]:
        """Fetch stock info from yfinance synchronously."""
        try:
            stock = yf.Ticker(ticker)
            return stock.info
        except Exception:
            return None

    async def get_stock_quote(self, ticker: str) -> Dict[str, Any]:
        """Get current stock quote with caching."""
        cache_key = f"stock_quote:{ticker}"
        cached_data = await self._cache_get(cache_key)

        if cached_data:
            return cached_data

        # Fetch fresh data
        quote_data = await self._fetch_stock_quote(ticker)

        # Cache the result
        await self._cache_set(cache_key, quote_data, self.cache_ttl["stock_quote"])

        return quote_data

    async def _fetch_stock_quote(self, ticker: str) -> Dict[str, Any]:
        """Fetch current stock quote."""
        try:
            # Try Alpha Vantage first
            if settings.ALPHA_VANTAGE_API_KEY:
                av_quote = await self._fetch_av_quote(ticker)
                if av_quote:
                    return av_quote

            # Fallback to yfinance
            loop = asyncio.get_event_loop()
            yf_quote = await loop.run_in_executor(
                self.executor, self._fetch_yf_quote, ticker
            )

            return yf_quote or {}

        except Exception as e:
            logger.error(f"Error fetching quote for {ticker}: {e}")
            return {}

    async def _fetch_av_quote(self, ticker: str) -> Optional[Dict[str, Any]]:
        """Fetch quote from Alpha Vantage."""
        try:

            if not settings.ALPHA_VANTAGE_API_KEY:
                logger.debug("Alpha Vantage API key not set, skipping quote fetch")
                return None
            async with httpx.AsyncClient() as client:
                params = {
                    "function": "GLOBAL_QUOTE",
                    "symbol": ticker,
                    "apikey": settings.ALPHA_VANTAGE_API_KEY,
                }

                response = await client.get(self.alpha_vantage_base_url, params=params)
                data = response.json()

                if "Global Quote" in data:
                    quote = data["Global Quote"]
                    return {
                        "symbol": quote.get("01. symbol"),
                        "price": float(quote.get("05. price", 0)),
                        "change": float(quote.get("09. change", 0)),
                        "change_percent": quote.get("10. change percent", "0%"),
                        "volume": int(quote.get("06. volume", 0)),
                        "latest_trading_day": quote.get("07. latest trading day"),
                        "source": "alpha_vantage",
                    }
        except Exception as e:
            logger.warning(f"Alpha Vantage quote fetch failed for {ticker}: {e}")

        return None

    def _fetch_yf_quote(self, ticker: str) -> Optional[Dict[str, Any]]:
        """Fetch quote from yfinance."""
        try:
            stock = yf.Ticker(ticker)
            hist = stock.history(period="2d")

            if len(hist) >= 1:
                latest = hist.iloc[-1]
                previous = hist.iloc[-2] if len(hist) > 1 else latest

                current_price = float(latest["Close"])
                previous_price = float(previous["Close"])
                change = current_price - previous_price
                change_percent = (
                    (change / previous_price) * 100 if previous_price > 0 else 0
                )

                return {
                    "symbol": ticker,
                    "price": current_price,
                    "change": change,
                    "change_percent": f"{change_percent:.2f}%",
                    "volume": int(latest["Volume"]),
                    "latest_trading_day": latest.name.strftime("%Y-%m-%d"),
                    "source": "yfinance",
                }
        except Exception as e:
            logger.warning(f"yfinance quote fetch failed for {ticker}: {e}")

        return None

    async def get_daily_performance(
        self, tickers: List[str]
    ) -> Dict[str, Dict[str, Any]]:
        """Get daily performance for multiple tickers."""
        cache_key = f"daily_performance:{':'.join(sorted(tickers))}"
        cached_data = await self._cache_get(cache_key)

        if cached_data:
            return cached_data

        # Fetch fresh data
        performance_data = {}
        tasks = [self.get_stock_quote(ticker) for ticker in tickers]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        for ticker, result in zip(tickers, results):
            if isinstance(result, Exception):
                performance_data[ticker] = {}
            else:
                performance_data[ticker] = result

        # Cache the result
        await self._cache_set(
            cache_key, performance_data, self.cache_ttl["daily_performance"]
        )

        return performance_data

    async def search_stocks(self, query: str, limit: int = 10) -> List[Dict[str, str]]:
        """Search for stocks by symbol or name."""
        try:
            if settings.ALPHA_VANTAGE_API_KEY:
                # Use Alpha Vantage search
                search_results = await self._search_alpha_vantage(query, limit)
                if search_results:
                    return search_results

            # Fallback to filtering popular stocks
            popular_stocks = await self.get_popular_stocks()
            query_lower = query.lower()

            filtered_stocks = [
                stock
                for stock in popular_stocks
                if query_lower in stock["value"].lower()
                or query_lower in stock["label"].lower()
            ]

            return filtered_stocks[:limit]

        except Exception as e:
            logger.error(f"Error searching stocks for query '{query}': {e}")
            return []

    async def _search_alpha_vantage(
        self, query: str, limit: int
    ) -> Optional[List[Dict[str, str]]]:
        """Search stocks using Alpha Vantage."""
        try:
            if not settings.ALPHA_VANTAGE_API_KEY:
                logger.debug("Alpha Vantage API key not set, skipping search")
                return None
            async with httpx.AsyncClient() as client:
                params = {
                    "function": "SYMBOL_SEARCH",
                    "keywords": query,
                    "apikey": settings.ALPHA_VANTAGE_API_KEY,
                }

                response = await client.get(self.alpha_vantage_base_url, params=params)
                data = response.json()

                if "bestMatches" in data:
                    results = []
                    for match in data["bestMatches"][:limit]:
                        results.append(
                            {
                                "value": match.get("1. symbol"),
                                "label": f"{match.get('1. symbol')} - {match.get('2. name')}",
                                "region": match.get("4. region"),
                                "currency": match.get("8. currency"),
                                "match_score": match.get("9. matchScore"),
                            }
                        )
                    return results
        except Exception as e:
            logger.warning(f"Alpha Vantage search failed for '{query}': {e}")

        return None

    async def validate_ticker(self, ticker: str) -> bool:
        """Validate if a ticker exists."""
        try:
            quote = await self.get_stock_quote(ticker)
            return bool(quote.get("price", 0) > 0)
        except Exception:
            return False


# Global instance
stock_service = StockService()
