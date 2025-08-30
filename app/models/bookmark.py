from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    Text,
    ForeignKey,
    UniqueConstraint,
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db import Base


class Bookmark(Base):
    __tablename__ = "bookmarks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    article_id = Column(String, nullable=False, index=True)
    article_title = Column(String, nullable=False)
    article_url = Column(String, nullable=False)
    article_source = Column(String, nullable=True)
    article_summary = Column(Text, nullable=True)
    article_sentiment = Column(String, nullable=True)
    article_published_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    user = relationship("User", back_populates="bookmarks")

    # Unique constraint to prevent duplicate bookmarks
    __table_args__ = (
        UniqueConstraint("user_id", "article_id", name="unique_user_article"),
        {"sqlite_autoincrement": True},
    )

    def __repr__(self):
        return f"<Bookmark(user_id={self.user_id}, article_id='{self.article_id}')>"
