#!/usr/bin/env python3
"""
Test script to verify database setup, transaction manager, and repository.
"""
import asyncio
from sqlalchemy import text
from app.db import get_db, UnitOfWork
from app.repositories import UserRepository, HoldingRepository


async def test_transaction_manager():
    """Test the transaction manager with repository pattern."""
    print("🧪 Testing Transaction Manager and Repository Pattern...")

    try:
        # Use UnitOfWork for transaction management
        async with UnitOfWork() as transaction_manager:
            # Initialize repositories
            user_repo = UserRepository(transaction_manager)
            holding_repo = HoldingRepository(transaction_manager)

            # Test user creation
            print("📝 Creating test user...")

            new_user = await user_repo.create(
                email="test@example.com",
                hashed_password="hashed_test123",
                full_name="Test User",
            )
            print(f"✅ Created user: {new_user.email} " f"(ID: {new_user.id})")

            # Test holding creation
            print("📈 Creating test holding...")
            from datetime import datetime

            new_holding = await holding_repo.create(
                user_id=new_user.id,
                ticker="AAPL",
                quantity=10.0,
                buy_price=150.50,
                buy_date=datetime(2024, 1, 15),
            )
            print(
                f"✅ Created holding: {new_holding.ticker} "
                f"x{new_holding.quantity} (ID: {new_holding.id})"
            )

            # Test retrieval
            print("🔍 Testing data retrieval...")
            retrieved_user = await user_repo.get_by_id(new_user.id)
            retrieved_holding = await holding_repo.get_by_id(new_holding.id)

            print(f"✅ Retrieved user: {retrieved_user.email}")
            print(f"✅ Retrieved holding: {retrieved_holding.ticker}")

            # Test relationship
            user_holdings = await holding_repo.get_by_user_id(new_user.id)
            print(f"✅ User has {len(user_holdings)} holdings")

            print("🎉 All tests passed! Transaction will be rolled back.")

            # Raise an exception to rollback the transaction for cleanup
            raise Exception("Test completed - rolling back transaction")

    except Exception as e:
        if "Test completed" in str(e):
            print("🧹 Test data cleaned up (transaction rolled back)")
        else:
            print(f"❌ Error occurred: {e}")
            raise


async def test_database_connection():
    """Test basic database connection."""
    print("🔌 Testing database connection...")

    try:
        async for session in get_db():
            # Simple query to test connection
            result = await session.execute(text("SELECT 1 as test"))
            row = result.fetchone()

            if row and row.test == 1:
                print("✅ Database connection successful!")
            else:
                print("❌ Database connection failed!")

            await session.close()
            break  # Exit the async generator

    except Exception as e:
        print(f"❌ Database connection error: {e}")
        raise


async def main():
    """Run all tests."""
    print("🚀 Starting StockWise Database Setup Tests")
    print("=" * 50)

    try:
        await test_database_connection()
        print()
        await test_transaction_manager()
        print()
        print("🎊 All tests completed successfully!")
        print("Alembic + SQLAlchemy + Transaction Manager setup is working!")

    except Exception as e:
        print(f"💥 Test failed: {e}")
        return 1

    return 0


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    exit(exit_code)
