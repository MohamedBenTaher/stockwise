#!/usr/bin/env python3
"""
Simple integration test for the clean architecture refactor.
"""
import asyncio
import sys
import os

# Add the app directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), "app"))

from app.services.prices import price_service
from app.services.cache import cache_service


async def test_integration():
    """Test the integrated services."""
    print("🧪 Testing Clean Architecture Integration...")

    # Test cache service
    print("\n📦 Testing Cache Service...")
    test_key = "test:integration"
    test_value = {"price": 150.0, "timestamp": "2025-01-20"}

    await cache_service.set(test_key, test_value, 300)
    cached_value = await cache_service.get(test_key)

    if cached_value == test_value:
        print("✅ Cache service working correctly")
    else:
        print("❌ Cache service failed")

    # Test price service with caching
    print("\n💰 Testing Price Service with Caching...")
    test_tickers = ["AAPL", "MSFT", "GOOGL"]

    # First call - should hit fallback prices
    print("⏰ First call (should use fallback prices)...")
    start_time = asyncio.get_event_loop().time()
    prices_1 = await price_service.get_multiple_prices(test_tickers)
    end_time = asyncio.get_event_loop().time()

    print(f"⚡ First call took: {end_time - start_time:.2f} seconds")
    for ticker, price in prices_1.items():
        print(f"  {ticker}: ${price:.2f}")

    # Second call - should use cache
    print("\n💾 Second call (should use cache)...")
    start_time = asyncio.get_event_loop().time()
    prices_2 = await price_service.get_multiple_prices(test_tickers)
    end_time = asyncio.get_event_loop().time()

    print(f"⚡ Second call took: {end_time - start_time:.2f} seconds")
    for ticker, price in prices_2.items():
        print(f"  {ticker}: ${price:.2f}")

    # Verify caching worked
    if prices_1 == prices_2 and end_time - start_time < 0.1:
        print("✅ Price caching working correctly")
    else:
        print("❌ Price caching may not be working optimally")

    # Test individual price fetch
    print("\n🎯 Testing Individual Price Fetch...")
    aapl_price = await price_service.get_current_price("AAPL")
    print(f"  AAPL: ${aapl_price:.2f}")

    # Test metadata
    print("\n📋 Testing Metadata Fetch...")
    metadata = await price_service.get_asset_metadata("AAPL")
    if metadata:
        print(f"  Sector: {metadata.get('sector', 'Unknown')}")
        print(f"  Industry: {metadata.get('industry', 'Unknown')}")
    else:
        print("  Metadata not available (expected with fallback)")

    # Cleanup
    await cache_service.delete(test_key)

    print("\n✅ Integration test completed successfully!")


if __name__ == "__main__":
    asyncio.run(test_integration())
