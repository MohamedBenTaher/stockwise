"""Price service with clean architecture and comprehensive caching."""

import yfinance as yf
import logging
import time
from typing import Optional, Dict
import asyncio
from concurrent.futures import ThreadPoolExecutor

from app.core.config import CacheConfig, RateLimitConfig, DefaultPrices
from app.core.exceptions import PriceServiceException
from app.services.cache import cache_service

logger = logging.getLogger(__name__)


class PriceService:
    """Clean price service with caching and rate limiting."""

    def __init__(self):
        self.executor = ThreadPoolExecutor(
            max_workers=RateLimitConfig.MAX_CONCURRENT_REQUESTS
        )
        self.last_request_time = 0.0

    async def _rate_limit(self) -> None:
        """Implement rate limiting."""
        current_time = time.time()
        time_since_last = current_time - self.last_request_time

        if time_since_last < RateLimitConfig.MIN_REQUEST_INTERVAL:
            sleep_time = RateLimitConfig.MIN_REQUEST_INTERVAL - time_since_last
            await asyncio.sleep(sleep_time)

        self.last_request_time = time.time()

    async def get_current_price(self, ticker: str) -> float:
        """Get current price for a single ticker."""
        ticker = ticker.upper()
        cache_key = f"{CacheConfig.PRICE_KEY_PREFIX}{ticker}"

        # Try cache first
        cached_price = await cache_service.get(cache_key)
        if cached_price is not None:
            logger.debug(f"Cache hit for {ticker}: ${cached_price}")
            return float(cached_price)

        # Fetch from API
        try:
            await self._rate_limit()
            price = await self._fetch_price_from_api(ticker)

            # Cache the result
            await cache_service.set(cache_key, price, CacheConfig.PRICE_TTL)
            logger.info(f"Fetched and cached price for {ticker}: ${price}")
            return price

        except Exception as e:
            logger.warning(f"Failed to fetch price for {ticker}: {e}")
            # Return fallback price
            fallback_price = DefaultPrices.FALLBACK_PRICES.get(ticker, 100.0)
            logger.info(f"Using fallback price for {ticker}: ${fallback_price}")
            return fallback_price

    async def get_multiple_prices(self, tickers: list[str]) -> Dict[str, float]:
        """Get prices for multiple tickers efficiently."""
        tickers = [t.upper() for t in tickers]
        prices = {}
        uncached_tickers = []

        # Check cache for all tickers
        for ticker in tickers:
            cache_key = f"{CacheConfig.PRICE_KEY_PREFIX}{ticker}"
            cached_price = await cache_service.get(cache_key)

            if cached_price is not None:
                prices[ticker] = float(cached_price)
                logger.debug(f"Cache hit for {ticker}")
            else:
                uncached_tickers.append(ticker)

        # Fetch uncached prices in batches
        if uncached_tickers:
            logger.info(f"Fetching prices for {len(uncached_tickers)} tickers")
            await self._fetch_batch_prices(uncached_tickers, prices)

        # Ensure all tickers have prices
        for ticker in tickers:
            if ticker not in prices:
                fallback_price = DefaultPrices.FALLBACK_PRICES.get(ticker, 100.0)
                prices[ticker] = fallback_price
                logger.warning(f"Using fallback price for {ticker}: ${fallback_price}")

        return prices

    async def _fetch_batch_prices(
        self, tickers: list[str], prices: Dict[str, float]
    ) -> None:
        """Fetch prices for multiple tickers in batches."""
        for i in range(0, len(tickers), RateLimitConfig.BATCH_SIZE):
            batch = tickers[i : i + RateLimitConfig.BATCH_SIZE]

            # Process batch with rate limiting
            await self._rate_limit()

            # Create tasks for concurrent fetching (with limits)
            semaphore = asyncio.Semaphore(RateLimitConfig.MAX_CONCURRENT_REQUESTS)
            tasks = [
                self._fetch_price_with_semaphore(semaphore, ticker) for ticker in batch
            ]

            batch_results = await asyncio.gather(*tasks, return_exceptions=True)

            # Process results and cache
            for ticker, result in zip(batch, batch_results):
                if isinstance(result, Exception):
                    logger.warning(f"Failed to fetch {ticker}: {result}")
                    continue

                prices[ticker] = result

                # Cache the price
                cache_key = f"{CacheConfig.PRICE_KEY_PREFIX}{ticker}"
                try:
                    await cache_service.set(cache_key, result, CacheConfig.PRICE_TTL)
                except Exception as e:
                    logger.warning(f"Failed to cache {ticker}: {e}")

    async def _fetch_price_with_semaphore(
        self, semaphore: asyncio.Semaphore, ticker: str
    ) -> float:
        """Fetch price with semaphore for concurrency control."""
        async with semaphore:
            return await self._fetch_price_from_api(ticker)

    async def _fetch_price_from_api(self, ticker: str) -> float:
        """Fetch price from yfinance API."""
        loop = asyncio.get_event_loop()

        try:
            stock_data = await loop.run_in_executor(
                self.executor, self._get_yfinance_price, ticker
            )

            if stock_data and stock_data > 0:
                return float(stock_data)
            else:
                raise PriceServiceException(f"Invalid price data for {ticker}")

        except Exception as e:
            logger.error(f"API fetch failed for {ticker}: {e}")
            raise PriceServiceException(f"Failed to fetch {ticker}: {e}")

    def _get_yfinance_price(self, ticker: str) -> Optional[float]:
        """Get price from yfinance synchronously."""
        try:
            stock = yf.Ticker(ticker)
            hist = stock.history(period="1d", interval="1m")

            if not hist.empty:
                return float(hist["Close"].iloc[-1])

            # Fallback to info if history fails
            info = stock.info
            current_price = info.get("currentPrice") or info.get("regularMarketPrice")

            if current_price:
                return float(current_price)

        except Exception as e:
            logger.warning(f"yfinance error for {ticker}: {e}")

        return None

    async def get_asset_metadata(self, ticker: str) -> Optional[Dict]:
        """Get asset metadata with caching."""
        ticker = ticker.upper()
        cache_key = f"{CacheConfig.METADATA_KEY_PREFIX}{ticker}"

        # Try cache first
        cached_metadata = await cache_service.get(cache_key)
        if cached_metadata:
            return cached_metadata

        # Fetch from API
        try:
            await self._rate_limit()
            metadata = await self._fetch_metadata_from_api(ticker)

            if metadata:
                # Cache the result
                await cache_service.set(cache_key, metadata, CacheConfig.METADATA_TTL)

            return metadata

        except Exception as e:
            logger.warning(f"Failed to fetch metadata for {ticker}: {e}")
            return None

    async def _fetch_metadata_from_api(self, ticker: str) -> Optional[Dict]:
        """Fetch metadata from yfinance API."""
        loop = asyncio.get_event_loop()

        try:
            metadata = await loop.run_in_executor(
                self.executor, self._get_yfinance_metadata, ticker
            )
            return metadata

        except Exception as e:
            logger.error(f"Metadata fetch failed for {ticker}: {e}")
            return None

    def _get_yfinance_metadata(self, ticker: str) -> Optional[Dict]:
        """Get metadata from yfinance synchronously."""
        try:
            stock = yf.Ticker(ticker)
            info = stock.info

            return {
                "sector": info.get("sector"),
                "industry": info.get("industry"),
                "country": info.get("country"),
                "market_cap": info.get("marketCap"),
                "exchange": info.get("exchange"),
            }

        except Exception as e:
            logger.warning(f"yfinance metadata error for {ticker}: {e}")
            return None


# Global price service instance
price_service = PriceService()
