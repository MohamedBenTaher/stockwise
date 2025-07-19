#!/usr/bin/env python3
"""
Test script to verify the transaction manager and repositories work correctly.
"""
import asyncio
from sqlalchemy import text
from app.db import get_transaction, async_engine
from app.repositories import UserRepository
from app.models.user import User


async def test_transaction_manager():
    """Test the DatabaseTransactionManager with repositories."""
    print("🧪 Testing DatabaseTransactionManager...")

    # Test 1: Basic transaction with raw SQL
    async with get_transaction() as tx:
        result = await tx.execute(text("SELECT current_database(), current_user"))
        row = result.fetchone()
        print(f"✅ Connected to database: {row[0]} as user: {row[1]}")

    # Test 2: Repository pattern with transaction
    async with get_transaction() as tx:
        user_repo = UserRepository(tx)

        # Create a test user
        test_user = User(
            email="test@example.com",
            full_name="Test User",
            hashed_password="hashed_password_here",
            is_active=True,
            is_verified=False,
        )

        # Add user using repository
        created_user = await user_repo.create(test_user)
        print(f"✅ Created user: {created_user.email} with ID: {created_user.id}")

        # Find user by email
        found_user = await user_repo.get_by_email("test@example.com")
        print(f"✅ Found user by email: {found_user.full_name}")

        # List all users
        all_users = await user_repo.get_all()
        print(f"✅ Total users in database: {len(all_users)}")

        # Clean up - delete the test user
        await user_repo.delete(created_user.id)
        print("✅ Test user deleted successfully")

    print("🎉 All transaction manager tests passed!")


async def test_connection_pool():
    """Test the database connection pool."""
    print("\n🔌 Testing connection pool...")

    # Test multiple concurrent connections
    async def test_connection():
        async with get_transaction() as tx:
            result = await tx.execute(text("SELECT pg_backend_pid()"))
            pid = result.scalar()
            return pid

    # Create multiple concurrent connections
    tasks = [test_connection() for _ in range(5)]
    pids = await asyncio.gather(*tasks)

    print(f"✅ Successfully created {len(pids)} concurrent connections")
    print(f"✅ Backend PIDs: {pids}")

    # Check pool stats
    pool = async_engine.pool
    print(f"✅ Pool size: {pool.size()}")
    print(f"✅ Checked out connections: {pool.checkedout()}")


if __name__ == "__main__":
    asyncio.run(test_transaction_manager())
    asyncio.run(test_connection_pool())
