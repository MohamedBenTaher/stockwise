from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import BaseModel
from app.services.stocks import stock_service

router = APIRouter()


class StockSearchResponse(BaseModel):
    value: str
    label: str
    sector: Optional[str] = None
    industry: Optional[str] = None
    market_cap: Optional[str] = None
    exchange: Optional[str] = None


class StockQuoteResponse(BaseModel):
    symbol: str
    price: float
    change: float
    change_percent: str
    volume: int
    latest_trading_day: str
    source: str


class DailyPerformanceResponse(BaseModel):
    performances: Dict[str, StockQuoteResponse]


@router.get("/popular", response_model=List[StockSearchResponse])
async def get_popular_stocks():
    """Get list of popular stocks with enhanced metadata."""
    try:
        stocks = await stock_service.get_popular_stocks()
        return [StockSearchResponse(**stock) for stock in stocks]
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch popular stocks: {str(e)}"
        )


@router.get("/search", response_model=List[StockSearchResponse])
async def search_stocks(
    q: str = Query(..., description="Search query for stock symbol or name"),
    limit: int = Query(10, ge=1, le=50, description="Maximum number of results"),
):
    """Search for stocks by symbol or name."""
    try:
        results = await stock_service.search_stocks(q, limit)
        return [StockSearchResponse(**stock) for stock in results]
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to search stocks: {str(e)}"
        )


@router.get("/quote/{ticker}", response_model=StockQuoteResponse)
async def get_stock_quote(ticker: str):
    """Get current quote for a specific ticker."""
    try:
        quote = await stock_service.get_stock_quote(ticker.upper())
        if not quote:
            raise HTTPException(
                status_code=404, detail=f"No data found for ticker: {ticker}"
            )

        return StockQuoteResponse(**quote)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch quote: {str(e)}")


@router.post("/performance", response_model=DailyPerformanceResponse)
async def get_daily_performance(tickers: List[str]):
    """Get daily performance for multiple tickers."""
    try:
        # Validate input
        if not tickers:
            raise HTTPException(
                status_code=400, detail="At least one ticker is required"
            )

        if len(tickers) > 50:
            raise HTTPException(status_code=400, detail="Maximum 50 tickers allowed")

        # Normalize tickers
        normalized_tickers = [ticker.upper() for ticker in tickers]

        performances = await stock_service.get_daily_performance(normalized_tickers)

        # Convert to response format
        response_data = {}
        for ticker, data in performances.items():
            if data:  # Only include tickers with data
                response_data[ticker] = StockQuoteResponse(**data)

        return DailyPerformanceResponse(performances=response_data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch performance data: {str(e)}"
        )


@router.get("/validate/{ticker}")
async def validate_ticker(ticker: str):
    """Validate if a ticker exists and is tradeable."""
    try:
        is_valid = await stock_service.validate_ticker(ticker.upper())
        return {
            "ticker": ticker.upper(),
            "valid": is_valid,
            "message": (
                "Ticker is valid" if is_valid else "Ticker not found or not tradeable"
            ),
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to validate ticker: {str(e)}"
        )


@router.get("/cache/stats")
async def get_cache_stats():
    """Get cache statistics (for debugging)."""
    try:
        redis_client = await stock_service._get_redis()
        if not redis_client:
            return {"status": "Redis not available"}

        info = await redis_client.info()
        return {
            "status": "connected",
            "connected_clients": info.get("connected_clients"),
            "used_memory_human": info.get("used_memory_human"),
            "total_commands_processed": info.get("total_commands_processed"),
            "keyspace_hits": info.get("keyspace_hits"),
            "keyspace_misses": info.get("keyspace_misses"),
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


@router.delete("/cache/clear")
async def clear_cache():
    """Clear all stock-related cache (for development)."""
    try:
        redis_client = await stock_service._get_redis()
        if not redis_client:
            return {"status": "Redis not available"}

        # Find all stock-related keys
        keys_to_delete = []
        async for key in redis_client.scan_iter(match="popular_stocks*"):
            keys_to_delete.append(key)
        async for key in redis_client.scan_iter(match="stock_quote:*"):
            keys_to_delete.append(key)
        async for key in redis_client.scan_iter(match="daily_performance:*"):
            keys_to_delete.append(key)

        if keys_to_delete:
            await redis_client.delete(*keys_to_delete)

        return {
            "status": "success",
            "cleared_keys": len(keys_to_delete),
            "message": f"Cleared {len(keys_to_delete)} cache entries",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to clear cache: {str(e)}")
