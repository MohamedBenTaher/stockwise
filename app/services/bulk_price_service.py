import asyncio
import logging
import httpx
import json
import time
from typing import Optional, Dict, List
import redis.asyncio as redis
from app.config import settings
import pandas as pd

logger = logging.getLogger(__name__)


class BulkPriceService:
    """Bulk price service with Redis caching and intelligent batching."""

    def __init__(self):
        self.redis_client = None
        self.cache_ttl = 86400  # 24 hours in seconds
        self.price_cache_key = "bulk_prices:all"
        self.metadata_cache_key = "bulk_metadata:all"
        self.last_bulk_fetch_key = "bulk_fetch:timestamp"
        self.bulk_fetch_interval = 3600  # Fetch bulk data every hour

        # Comprehensive list of all assets we track
        self.all_assets = {
            # Major Stocks
            "AAPL",
            "MSFT",
            "GOOGL",
            "GOOG",
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
            "MCD",
            "BMY",
            "WFC",
            "CSCO",
            "HON",
            "UPS",
            "IBM",
            "GS",
            "CAT",
            "MMM",
            "BA",
            "AXP",
            "TRV",
            # ETFs
            "SPY",
            "QQQ",
            "IWM",
            "VTI",
            "VOO",
            "VEA",
            "VWO",
            "GLD",
            "SLV",
            "TLT",
            "HYG",
            "LQD",
            "EEM",
            "FXI",
            "EWJ",
            "EWZ",
            "RSX",
            "EWU",
            "IEFA",
            "IEMG",
            "ITOT",
            "IXUS",
            "VTV",
            "VUG",
            "VYM",
            "VXUS",
            # Sector ETFs
            "XLK",
            "XLF",
            "XLE",
            "XLV",
            "XLI",
            "XLP",
            "XLY",
            "XLU",
            "XLRE",
            "XLB",
            "XME",
            "XRT",
            "XHB",
            "XBI",
            "XOP",
            "XAR",
            "XTN",
            "XTL",
            # Crypto (if supported by your data provider)
            "BTC-USD",
            "ETH-USD",
            "ADA-USD",
            "SOL-USD",
            "DOT-USD",
            "LINK-USD",
            # International
            "TSM",
            "ASML",
            "SAP",
            "TM",
            "NVO",
            "AZN",
            "BABA",
            "NVS",
            "ROCHE",
            # Popular alternatives
            "GME",
            "AMC",
            "PLTR",
            "RIVN",
            "LCID",
            "COIN",
            "SQ",
            "SHOP",
            "ROKU",
        }

        # Fallback prices for all assets
        self.fallback_prices = {
            "AAPL": 175.50,
            "MSFT": 420.25,
            "GOOGL": 142.80,
            "AMZN": 155.30,
            "NVDA": 875.40,
            "TSLA": 245.60,
            "META": 485.20,
            "DIS": 112.85,
            "JPM": 175.25,
            "V": 285.90,
            "BRK.B": 445.75,
            "JNJ": 162.45,
            "WMT": 165.80,
            "PG": 145.60,
            "UNH": 520.30,
            "HD": 385.75,
            "MA": 475.40,
            "ADBE": 565.20,
            "BAC": 42.75,
            "CRM": 285.90,
            "NFLX": 485.60,
            "XOM": 115.40,
            "CVX": 165.30,
            "AMD": 185.75,
            "PFE": 28.90,
            "SPY": 485.20,
            "QQQ": 395.80,
            "VTI": 245.30,
            "VOO": 445.60,
            "IWM": 195.40,
            "GLD": 185.70,
            "SLV": 22.45,
            "TLT": 89.60,
            "BTC-USD": 42500.00,
            "ETH-USD": 2650.00,
            # Add more fallback prices as needed
        }

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
                logger.info("✅ Redis connected successfully")
            except Exception as e:
                logger.warning(f"❌ Redis connection failed: {e}")
                self.redis_client = None
        return self.redis_client

    async def should_fetch_bulk_data(self) -> bool:
        """Check if we should fetch bulk data."""
        try:
            redis_client = await self.get_redis()
            if not redis_client:
                return True  # No Redis, always fetch

            last_fetch_str = await redis_client.get(self.last_bulk_fetch_key)
            if not last_fetch_str:
                return True  # Never fetched before

            last_fetch = float(last_fetch_str)
            time_since_fetch = time.time() - last_fetch

            return time_since_fetch > self.bulk_fetch_interval

        except Exception as e:
            logger.warning(f"Error checking bulk fetch status: {e}")
            return True

    async def fetch_bulk_prices(self) -> Dict[str, float]:
        """Fetch prices for all assets in bulk."""
        logger.info(f"🚀 Starting bulk price fetch for {len(self.all_assets)} assets")

        try:
            # Try different bulk fetching strategies
            bulk_prices = {}

            # Strategy 1: Try Alpha Vantage batch (if available)
            if settings.ALPHA_VANTAGE_API_KEY:
                av_prices = await self._fetch_alpha_vantage_batch()
                if av_prices:
                    bulk_prices.update(av_prices)

            # Strategy 2: Try yfinance bulk (fallback)
            if len(bulk_prices) < len(self.all_assets) * 0.8:  # Less than 80% success
                yf_prices = await self._fetch_yfinance_batch()
                bulk_prices.update(yf_prices)

            # Strategy 3: Fill remaining with fallback prices
            for asset in self.all_assets:
                if asset not in bulk_prices:
                    bulk_prices[asset] = self.fallback_prices.get(asset, 100.0)

            logger.info(f"✅ Bulk fetch completed: {len(bulk_prices)} prices fetched")
            return bulk_prices

        except Exception as e:
            logger.error(f"❌ Bulk price fetch failed: {e}")
            return {
                asset: self.fallback_prices.get(asset, 100.0)
                for asset in self.all_assets
            }

    async def _fetch_yfinance_batch(self) -> Dict[str, float]:
        """Fetch prices using yfinance in true bulk mode."""
        try:
            logger.info("📊 Fetching prices via yfinance bulk...")

            # yfinance can handle multiple tickers in one request
            import yfinance as yf

            # Split into chunks to avoid overwhelming yfinance
            chunk_size = 50
            all_prices = {}
            asset_list = list(self.all_assets)

            for i in range(0, len(asset_list), chunk_size):
                chunk = asset_list[i : i + chunk_size]

                try:
                    # Use yfinance download for bulk fetching
                    loop = asyncio.get_event_loop()
                    chunk_data = await loop.run_in_executor(
                        None, self._fetch_yfinance_chunk, chunk
                    )

                    if chunk_data:
                        all_prices.update(chunk_data)

                    logger.info(
                        f"yfinance chunk {i//chunk_size + 1} completed: {len(chunk_data)} prices"
                    )

                    # Small delay between chunks
                    if i + chunk_size < len(asset_list):
                        await asyncio.sleep(2)

                except Exception as e:
                    logger.warning(f"yfinance chunk {i//chunk_size + 1} failed: {e}")

            return all_prices

        except Exception as e:
            logger.warning(f"yfinance batch fetch failed: {e}")
            return {}

    async def _fetch_alpha_vantage_batch(self) -> Dict[str, float]:
        """Fetch prices using Alpha Vantage in optimized batches."""
        try:
            if not settings.ALPHA_VANTAGE_API_KEY:
                return {}

            logger.info("📊 Fetching prices via Alpha Vantage batch...")
            prices = {}

            # Alpha Vantage doesn't have true batch API, but we can optimize
            # Process in very small batches with delays to respect rate limits
            asset_list = list(self.all_assets)
            batch_size = 5  # Very conservative for free tier

            for i in range(
                0, min(50, len(asset_list)), batch_size
            ):  # Limit to 50 assets max
                batch = asset_list[i : i + batch_size]

                # Concurrent requests within batch
                tasks = [self._get_alpha_vantage_price(asset) for asset in batch]
                results = await asyncio.gather(*tasks, return_exceptions=True)

                for asset, price in zip(batch, results):
                    if isinstance(price, Exception):
                        logger.debug(f"Alpha Vantage failed for {asset}: {price}")
                    elif price and price > 0:
                        prices[asset] = price

                # Rate limiting between batches
                if i + batch_size < min(50, len(asset_list)):
                    await asyncio.sleep(15)  # 15 seconds between batches

                logger.info(
                    f"Alpha Vantage batch {i//batch_size + 1} completed: {len(prices)} prices so far"
                )

            return prices

        except Exception as e:
            logger.warning(f"Alpha Vantage batch fetch failed: {e}")
            return {}

    async def _fetch_yfinance_batch(self) -> Dict[str, float]:
        """Fetch prices using yfinance in true bulk mode."""
        try:
            logger.info("📊 Fetching prices via yfinance bulk...")

            # yfinance can handle multiple tickers in one request
            import yfinance as yf

            # Split into chunks to avoid overwhelming yfinance
            chunk_size = 50
            all_prices = {}
            asset_list = list(self.all_assets)

            for i in range(0, len(asset_list), chunk_size):
                chunk = asset_list[i : i + chunk_size]

                try:
                    # Use yfinance download for bulk fetching
                    loop = asyncio.get_event_loop()
                    chunk_data = await loop.run_in_executor(
                        None, self._fetch_yfinance_chunk, chunk
                    )

                    if chunk_data:
                        all_prices.update(chunk_data)

                    logger.info(
                        f"yfinance chunk {i//chunk_size + 1} completed: {len(chunk_data)} prices"
                    )

                    # Small delay between chunks
                    if i + chunk_size < len(asset_list):
                        await asyncio.sleep(2)

                except Exception as e:
                    logger.warning(f"yfinance chunk {i//chunk_size + 1} failed: {e}")

            return all_prices

        except Exception as e:
            logger.warning(f"yfinance batch fetch failed: {e}")
            return {}

    def _fetch_yfinance_chunk(self, tickers: List[str]) -> Dict[str, float]:

        import yfinance as yf

        try:
            tickers_str = " ".join(tickers)
            data = yf.download(tickers_str, period="1d", interval="1d", progress=False)
            prices = {}

            if data.empty:
                logger.warning(f"yfinance returned empty DataFrame for: {tickers_str}")
            else:
                logger.debug(f"yfinance DataFrame for {tickers_str}:\n{data}")

            if len(tickers) == 1:
                if not data.empty and "Close" in data.columns:
                    prices[tickers[0]] = float(data["Close"].iloc[-1])
            else:
                if not data.empty and "Close" in data.columns:
                    for ticker in tickers:
                        try:
                            if ticker in data["Close"].columns:
                                prices[ticker] = float(data["Close"][ticker].iloc[-1])
                            else:
                                logger.warning(
                                    f"Ticker {ticker} not in yfinance Close columns"
                                )
                        except Exception as e:
                            logger.debug(f"Failed to extract price for {ticker}: {e}")

            return prices

        except Exception as e:
            logger.error(f"yfinance chunk fetch failed for {tickers}: {e}")
            return {}

    async def _get_alpha_vantage_price(self, ticker: str) -> Optional[float]:
        try:
            if not settings.ALPHA_VANTAGE_API_KEY:
                logger.debug("Alpha Vantage API key not set, skipping fetch")
                return None
            async with httpx.AsyncClient() as client:
                params = {
                    "function": "GLOBAL_QUOTE",
                    "symbol": ticker.upper(),
                    "apikey": settings.ALPHA_VANTAGE_API_KEY,
                }
                response = await client.get(
                    "https://www.alphavantage.co/query", params=params, timeout=5.0
                )
                logger.debug(
                    f"Raw response for {ticker}: {response.text} (Status: {response.status_code})"
                )
                try:
                    data = response.json()
                except Exception as e:
                    logger.error(f"JSON decode error for {ticker}: {e}")
                    logger.debug(f"Raw response content for {ticker}: {response.text}")
                    return None

                if "Note" in data:
                    logger.warning(f"Alpha Vantage rate limit hit: {data['Note']}")
                    return None

                if "Global Quote" in data:
                    quote = data["Global Quote"]
                    price_str = quote.get("05. price", "0")
                    if price_str and price_str != "0":
                        return float(price_str)
        except Exception as e:
            logger.debug(f"Alpha Vantage single fetch failed for {ticker}: {e}")

        return None

    async def cache_bulk_prices(self, prices: Dict[str, float]) -> bool:
        """Cache bulk prices in Redis."""
        try:
            redis_client = await self.get_redis()
            if not redis_client:
                return False

            # Store prices with timestamp
            cache_data = {
                "prices": prices,
                "timestamp": time.time(),
                "count": len(prices),
            }

            await redis_client.setex(
                self.price_cache_key, self.cache_ttl, json.dumps(cache_data)
            )

            # Update last fetch timestamp
            await redis_client.setex(
                self.last_bulk_fetch_key, self.cache_ttl, str(time.time())
            )

            logger.info(
                f"✅ Cached {len(prices)} prices in Redis (TTL: {self.cache_ttl}s)"
            )
            return True

        except Exception as e:
            logger.error(f"❌ Failed to cache bulk prices: {e}")
            return False

    async def get_cached_prices(self) -> Optional[Dict[str, float]]:
        """Get cached prices from Redis."""
        try:
            redis_client = await self.get_redis()
            if not redis_client:
                return None

            cached_data_str = await redis_client.get(self.price_cache_key)
            if not cached_data_str:
                return None

            cached_data = json.loads(cached_data_str)
            prices = cached_data.get("prices", {})
            timestamp = cached_data.get("timestamp", 0)

            # Check if cache is still valid
            cache_age = time.time() - timestamp
            if cache_age > self.cache_ttl:
                logger.info("Cache expired, will fetch fresh data")
                return None

            logger.info(
                f"✅ Using cached prices: {len(prices)} assets (age: {cache_age/3600:.1f}h)"
            )
            return prices

        except Exception as e:
            logger.warning(f"Failed to get cached prices: {e}")
            return None

    async def get_prices(self, tickers: List[str]) -> Dict[str, float]:
        """Get prices for specific tickers from cache only - no live API calls."""
        try:
            # Always try cache first - never make live API calls during requests
            cached_prices = await self.get_cached_prices()

            if cached_prices:
                # Return requested tickers from cache
                result = {}
                for ticker in tickers:
                    ticker_upper = ticker.upper()
                    if ticker_upper in cached_prices:
                        result[ticker] = cached_prices[ticker_upper]
                    else:
                        # Use fallback instead of making API call
                        result[ticker] = self.fallback_prices.get(ticker_upper, 100.0)
                        logger.info(
                            f"Using fallback price for {ticker}: {result[ticker]}"
                        )
                return result

            # If no cache available, use all fallback prices and trigger background refresh
            logger.warning(
                "No cached prices available, using fallbacks and triggering background refresh"
            )

            # Trigger background refresh asynchronously (don't wait for it)
            asyncio.create_task(self._trigger_background_refresh())

            # Return fallback prices immediately
            return {
                ticker: self.fallback_prices.get(ticker.upper(), 100.0)
                for ticker in tickers
            }

        except Exception as e:
            logger.error(f"Error in get_prices: {e}")
            return {
                ticker: self.fallback_prices.get(ticker.upper(), 100.0)
                for ticker in tickers
            }

    async def _trigger_background_refresh(self):
        """Trigger background refresh without blocking the request."""
        try:
            from app.celery import fetch_and_cache_bulk_prices_task

            # Trigger Celery task asynchronously
            fetch_and_cache_bulk_prices_task.delay()
            logger.info("🔄 Triggered background price refresh via Celery")
        except Exception as e:
            logger.warning(f"Failed to trigger background refresh: {e}")

    async def get_single_price(self, ticker: str) -> float:
        """Get price for a single ticker from cache only."""
        prices = await self.get_prices([ticker])
        return prices.get(ticker, self.fallback_prices.get(ticker.upper(), 100.0))

    async def warm_cache(self) -> bool:
        """Warm the cache by fetching all prices."""
        try:
            logger.info("🔥 Warming price cache...")
            bulk_prices = await self.fetch_bulk_prices()
            success = await self.cache_bulk_prices(bulk_prices)
            if success:
                logger.info("✅ Cache warmed successfully")
            return success
        except Exception as e:
            logger.error(f"❌ Cache warming failed: {e}")
            return False


# Create singleton instance
bulk_price_service = BulkPriceService()
