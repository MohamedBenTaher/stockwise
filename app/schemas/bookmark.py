from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class BookmarkBase(BaseModel):
    article_id: str
    article_title: str
    article_url: str
    article_source: Optional[str] = None
    article_summary: Optional[str] = None
    article_sentiment: Optional[str] = None
    article_published_at: Optional[datetime] = None


class BookmarkCreate(BookmarkBase):
    pass


class BookmarkUpdate(BaseModel):
    article_title: Optional[str] = None
    article_url: Optional[str] = None
    article_source: Optional[str] = None
    article_summary: Optional[str] = None
    article_sentiment: Optional[str] = None
    article_published_at: Optional[datetime] = None


class BookmarkInDB(BookmarkBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Bookmark(BookmarkInDB):
    pass


class BookmarkToggleRequest(BaseModel):
    bookmarked: bool


class BookmarkToggleResponse(BaseModel):
    success: bool
    article_id: str
    bookmarked: bool
    message: str
    total_bookmarks: int
