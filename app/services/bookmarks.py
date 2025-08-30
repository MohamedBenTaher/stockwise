from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, func
from sqlalchemy.exc import IntegrityError
from typing import List
from datetime import datetime

from app.models.bookmark import Bookmark
from app.schemas.bookmark import BookmarkCreate
from app.schemas.news import NewsArticle


class BookmarkService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_bookmarks(self, user_id: int) -> List[Bookmark]:
        """Get all bookmarks for a user."""
        query = (
            select(Bookmark)
            .where(Bookmark.user_id == user_id)
            .order_by(Bookmark.created_at.desc())
        )
        result = await self.db.execute(query)
        return result.scalars().all()

    async def is_bookmarked(self, user_id: int, article_id: str) -> bool:
        """Check if an article is bookmarked by user."""
        query = select(Bookmark).where(
            Bookmark.user_id == user_id, Bookmark.article_id == article_id
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none() is not None

    async def add_bookmark(self, user_id: int, article: NewsArticle) -> Bookmark:
        """Add a bookmark for a user."""
        try:
            # Check if already bookmarked first
            existing = await self.is_bookmarked(user_id, article.id)
            if existing:
                raise ValueError("Article already bookmarked")

            bookmark_data = BookmarkCreate(
                article_id=article.id,
                article_title=article.title,
                article_url=article.url,
                article_source=article.source,
                article_summary=article.summary,
                article_sentiment=article.sentiment,
                article_published_at=(
                    datetime.fromisoformat(article.published_at.replace("Z", "+00:00"))
                    if isinstance(article.published_at, str)
                    else article.published_at
                ),
            )

            bookmark = Bookmark(user_id=user_id, **bookmark_data.model_dump())

            self.db.add(bookmark)
            await self.db.commit()
            await self.db.refresh(bookmark)
            return bookmark

        except ValueError:
            # Don't rollback for ValueError as it's a business logic error
            raise
        except IntegrityError:
            await self.db.rollback()
            raise ValueError("Article already bookmarked")
        except Exception as e:
            await self.db.rollback()
            raise ValueError(f"Failed to add bookmark: {e}")

    async def remove_bookmark(self, user_id: int, article_id: str) -> bool:
        """Remove a bookmark for a user."""
        try:
            query = delete(Bookmark).where(
                Bookmark.user_id == user_id, Bookmark.article_id == article_id
            )
            result = await self.db.execute(query)
            await self.db.commit()
            return result.rowcount > 0
        except Exception as e:
            await self.db.rollback()
            raise ValueError(f"Failed to remove bookmark: {e}")

    async def toggle_bookmark(
        self, user_id: int, article: NewsArticle
    ) -> tuple[bool, Bookmark | None]:
        """Toggle bookmark status for an article."""
        is_currently_bookmarked = await self.is_bookmarked(user_id, article.id)

        if is_currently_bookmarked:
            await self.remove_bookmark(user_id, article.id)
            return False, None
        else:
            bookmark = await self.add_bookmark(user_id, article)
            return True, bookmark

    async def get_bookmark_count(self, user_id: int) -> int:
        """Get total bookmark count for a user efficiently."""
        query = select(func.count(Bookmark.id)).where(Bookmark.user_id == user_id)
        result = await self.db.execute(query)
        return result.scalar() or 0

    async def get_bookmark_by_id(
        self, user_id: int, article_id: str
    ) -> Bookmark | None:
        """Get a specific bookmark by user and article ID."""
        query = select(Bookmark).where(
            Bookmark.user_id == user_id, Bookmark.article_id == article_id
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
