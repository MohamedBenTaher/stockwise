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

    async def fetch_bulk_prices_safe(self) -> Dict[str, float]:
        """SAFE bulk price fetch with strict rate limiting and error handling."""
        logger.info(
            f"🚀 Starting SAFE bulk price fetch for {len(self.all_assets)} assets"
        )

        try:
            bulk_prices = {}

            # Always start with fallback prices as base
            for asset in self.all_assets:
                bulk_prices[asset] = self.fallback_prices.get(asset, 100.0)

            # Try to enhance with live data (with strict limits)
            live_prices = await self._fetch_limited_live_prices()
            if live_prices:
                bulk_prices.update(live_prices)
                logger.info(f"📈 Enhanced {len(live_prices)} prices with live data")

            logger.info(f"✅ SAFE bulk fetch completed: {len(bulk_prices)} prices")
            return bulk_prices

        except Exception as e:
            logger.error(f"❌ SAFE bulk fetch failed, using fallbacks: {e}")
            return {
                asset: self.fallback_prices.get(asset, 100.0)
                for asset in self.all_assets
            }

    async def _fetch_limited_live_prices(self) -> Dict[str, float]:
        """Fetch limited live prices with strict rate limiting."""
        live_prices = {}

        # Priority assets for live fetching (limit to prevent rate limiting)
        priority_assets = [
            "AAPL",
            "MSFT",
            "GOOGL",
            "AMZN",
            "NVDA",
            "TSLA",
            "META",
            "SPY",
            "QQQ",
            "VTI",
        ]

        # Limit to 20 assets max for live fetching
        fetch_assets = [asset for asset in priority_assets if asset in self.all_assets][
            :20
        ]

        if not fetch_assets:
            return live_prices

        # Try yfinance first (more reliable for bulk)
        yf_prices = await self._fetch_yfinance_limited(fetch_assets)
        if yf_prices:
            live_prices.update(yf_prices)

        # Only use Alpha Vantage for critical missing assets (max 5)
        missing_assets = [
            asset for asset in fetch_assets[:5] if asset not in live_prices
        ]
        if missing_assets and settings.ALPHA_VANTAGE_API_KEY:
            av_prices = await self._fetch_alpha_vantage_limited(missing_assets)
            if av_prices:
                live_prices.update(av_prices)

        return live_prices

    async def _fetch_yfinance_limited(self, assets: List[str]) -> Dict[str, float]:
        """Fetch from yfinance with error handling."""
        try:
            logger.info(f"📊 Fetching {len(assets)} assets via yfinance...")

            # Single batch request to avoid overwhelming yfinance
            loop = asyncio.get_event_loop()
            prices = await loop.run_in_executor(
                None, self._fetch_yfinance_chunk_safe, assets
            )

            logger.info(f"✅ yfinance fetch completed: {len(prices)} prices")
            return prices

        except Exception as e:
            logger.warning(f"⚠️ yfinance limited fetch failed: {e}")
            return {}

    def _fetch_yfinance_chunk_safe(self, tickers: List[str]) -> Dict[str, float]:
        """Safe yfinance chunk fetching with comprehensive error handling."""
        import yfinance as yf

        try:
            if not tickers:
                return {}

            # Use space-separated tickers for bulk request
            tickers_str = " ".join(tickers)
            logger.debug(f"Requesting yfinance data for: {tickers_str}")

            # Download with minimal period to reduce data transfer
            data = yf.download(
                tickers_str,
                period="1d",
                interval="1d",
                progress=False,
                show_errors=False,
                threads=True,
                timeout=30,
            )

            prices = {}

            if data.empty:
                logger.warning(f"yfinance returned empty DataFrame for: {tickers_str}")
                return prices

            # Handle single vs multiple tickers
            if len(tickers) == 1:
                # Single ticker response
                if "Close" in data.columns and not data["Close"].empty:
                    try:
                        latest_close = data["Close"].dropna().iloc[-1]
                        if pd.notna(latest_close) and latest_close > 0:
                            prices[tickers[0]] = float(latest_close)
                            logger.debug(
                                f"Single ticker {tickers[0]}: {prices[tickers[0]]}"
                            )
                    except Exception as e:
                        logger.debug(
                            f"Failed to extract single ticker {tickers[0]}: {e}"
                        )
            else:
                # Multiple tickers response - expect MultiIndex columns
                if "Close" in data.columns:
                    close_data = data["Close"]

                    for ticker in tickers:
                        try:
                            if ticker in close_data.columns:
                                ticker_data = close_data[ticker].dropna()
                                if not ticker_data.empty:
                                    latest_price = ticker_data.iloc[-1]
                                    if pd.notna(latest_price) and latest_price > 0:
                                        prices[ticker] = float(latest_price)
                                        logger.debug(
                                            f"Multi ticker {ticker}: "
                                            f"{prices[ticker]}"
                                        )
                            else:
                                logger.debug(
                                    f"Ticker {ticker} not found in columns: "
                                    f"{list(close_data.columns)}"
                                )
                        except Exception as e:
                            logger.debug(f"Failed to extract price for {ticker}: {e}")

            logger.info(
                f"yfinance extracted {len(prices)} valid prices "
                f"from {len(tickers)} requested"
            )
            return prices

        except Exception as e:
            logger.error(f"yfinance chunk fetch failed for {tickers}: {e}")
            return {}

    async def _fetch_alpha_vantage_limited(self, assets: List[str]) -> Dict[str, float]:
        """Fetch limited assets from Alpha Vantage with strict rate limiting."""
        if not settings.ALPHA_VANTAGE_API_KEY:
            return {}

        try:
            logger.info(
                f"📊 Fetching {len(assets)} critical assets via Alpha Vantage..."
            )

            prices = {}

            # Process one by one with delays to respect rate limits
            for i, asset in enumerate(assets):
                try:
                    price = await self._get_alpha_vantage_price_safe(asset)
                    if price and price > 0:
                        prices[asset] = price
                        logger.debug(f"Alpha Vantage {asset}: {price}")

                    # Rate limiting: wait between requests
                    if i < len(assets) - 1:  # Don't wait after the last request
                        await asyncio.sleep(12)  # 12 seconds = 5 requests per minute

                except Exception as e:
                    logger.warning(f"Alpha Vantage failed for {asset}: {e}")
                    continue

            logger.info(f"✅ Alpha Vantage limited fetch: {len(prices)} prices")
            return prices

        except Exception as e:
            logger.warning(f"⚠️ Alpha Vantage limited fetch failed: {e}")
            return {}

    async def _get_alpha_vantage_price_safe(self, ticker: str) -> Optional[float]:
        """Safe Alpha Vantage price fetch with timeout and error handling."""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                params = {
                    "function": "GLOBAL_QUOTE",
                    "symbol": ticker.upper(),
                    "apikey": settings.ALPHA_VANTAGE_API_KEY,
                }

                response = await client.get(
                    "https://www.alphavantage.co/query", params=params
                )

                # Check for valid response
                if response.status_code != 200:
                    logger.warning(
                        f"Alpha Vantage HTTP {response.status_code} for {ticker}"
                    )
                    return None

                # Parse JSON safely
                try:
                    data = response.json()
                except Exception:
                    logger.warning(f"Alpha Vantage invalid JSON for {ticker}")
                    return None

                # Check for rate limit
                if "Note" in data:
                    logger.warning(f"Alpha Vantage rate limit: {data['Note']}")
                    return None

                # Check for error messages
                if "Error Message" in data:
                    logger.warning(
                        f"Alpha Vantage error for {ticker}: {data['Error Message']}"
                    )
                    return None

                # Extract price
                if "Global Quote" in data:
                    quote = data["Global Quote"]
                    price_str = quote.get("05. price", "0")
                    if price_str and price_str != "0":
                        try:
                            price = float(price_str)
                            if price > 0:
                                return price
                        except ValueError:
                            logger.warning(
                                f"Invalid price format for {ticker}: {price_str}"
                            )

                return None

        except asyncio.TimeoutError:
            logger.warning(f"Alpha Vantage timeout for {ticker}")
            return None
        except Exception as e:
            logger.debug(f"Alpha Vantage error for {ticker}: {e}")
            return None

    async def _fetch_yfinance_batch(self) -> Dict[str, float]:
        """Fetch prices using yfinance in true bulk mode (DEPRECATED - use limited version)."""
        logger.warning(
            "Using deprecated _fetch_yfinance_batch - use _fetch_yfinance_limited"
        )
        return {}

    def _fetch_yfinance_chunk(self, tickers: List[str]) -> Dict[str, float]:
        """DEPRECATED - use _fetch_yfinance_chunk_safe instead."""
        logger.warning("Using deprecated _fetch_yfinance_chunk")
        return {}

    async def _fetch_alpha_vantage_batch(self) -> Dict[str, float]:
        """DEPRECATED - use _fetch_alpha_vantage_limited instead."""
        logger.warning("Using deprecated _fetch_alpha_vantage_batch")
        return {}

    async def _get_alpha_vantage_price(self, ticker: str) -> Optional[float]:
        """DEPRECATED - use _get_alpha_vantage_price_safe instead."""
        logger.warning("Using deprecated _get_alpha_vantage_price")
        return await self._get_alpha_vantage_price_safe(ticker)

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

    async def get_multiple_prices(self, tickers: List[str]) -> Dict[str, float]:
        """Alias for get_prices for compatibility."""
        return await self.get_prices(tickers)

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
