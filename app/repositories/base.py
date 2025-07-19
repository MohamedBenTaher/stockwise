"""
Base repository classes following clean architecture principles.
"""

from abc import ABC, abstractmethod
from typing import Generic, TypeVar, Optional, List, Any, Dict
from sqlalchemy import select, delete
from sqlalchemy.orm import DeclarativeBase
from app.db import DatabaseTransactionManager, UnitOfWork
import logging

logger = logging.getLogger(__name__)

# Generic type for model entities
ModelType = TypeVar("ModelType", bound=DeclarativeBase)
CreateSchemaType = TypeVar("CreateSchemaType")
UpdateSchemaType = TypeVar("UpdateSchemaType")


class BaseRepository(ABC, Generic[ModelType]):
    """
    Abstract base repository class following clean architecture principles.
    Provides common CRUD operations with proper transaction management.
    """

    def __init__(self, model: type[ModelType]):
        self.model = model

    @abstractmethod
    async def create(
        self, tx: DatabaseTransactionManager, obj_in: CreateSchemaType
    ) -> ModelType:
        """Create a new entity."""
        pass

    @abstractmethod
    async def get_by_id(
        self, tx: DatabaseTransactionManager, entity_id: Any
    ) -> Optional[ModelType]:
        """Get entity by ID."""
        pass

    @abstractmethod
    async def get_multi(
        self,
        tx: DatabaseTransactionManager,
        skip: int = 0,
        limit: int = 100,
        filters: Optional[Dict[str, Any]] = None,
    ) -> List[ModelType]:
        """Get multiple entities with pagination and filtering."""
        pass

    @abstractmethod
    async def update(
        self,
        tx: DatabaseTransactionManager,
        db_obj: ModelType,
        obj_in: UpdateSchemaType,
    ) -> ModelType:
        """Update an existing entity."""
        pass

    @abstractmethod
    async def delete(self, tx: DatabaseTransactionManager, entity_id: Any) -> bool:
        """Delete an entity by ID."""
        pass


class SQLAlchemyRepository(BaseRepository[ModelType]):
    """
    Concrete implementation of repository pattern using SQLAlchemy.
    Follows clean code principles with separation of concerns.
    """

    def __init__(self, model: type[ModelType]):
        super().__init__(model)

    async def create(self, tx: DatabaseTransactionManager, **kwargs) -> ModelType:
        """Create a new entity."""
        try:
            db_obj = self.model(**kwargs)
            tx.add(db_obj)
            await tx.flush()
            await tx.refresh(db_obj)
            logger.debug(f"Created {self.model.__name__} with data: {kwargs}")
            return db_obj
        except Exception as e:
            logger.error(f"Error creating {self.model.__name__}: {e}")
            raise

    async def get_by_id(
        self, tx: DatabaseTransactionManager, entity_id: Any
    ) -> Optional[ModelType]:
        """Get entity by ID."""
        try:
            query = select(self.model).where(self.model.id == entity_id)
            result = await tx.scalar(query)
            logger.debug(f"Retrieved {self.model.__name__} with ID: {entity_id}")
            return result
        except Exception as e:
            logger.error(
                f"Error retrieving {self.model.__name__} " f"with ID {entity_id}: {e}"
            )
            raise

    async def get_multi(
        self,
        tx: DatabaseTransactionManager,
        skip: int = 0,
        limit: int = 100,
        filters: Optional[Dict[str, Any]] = None,
    ) -> List[ModelType]:
        """Get multiple entities with pagination and filtering."""
        try:
            query = select(self.model)

            # Apply filters if provided
            if filters:
                for field, value in filters.items():
                    if hasattr(self.model, field):
                        query = query.where(getattr(self.model, field) == value)

            # Apply pagination
            query = query.offset(skip).limit(limit)

            result = await tx.execute(query)
            entities = result.scalars().all()

            logger.debug(f"Retrieved {len(entities)} {self.model.__name__} entities")
            return list(entities)
        except Exception as e:
            logger.error(f"Error retrieving {self.model.__name__} entities: {e}")
            raise

    async def get_by_field(
        self, tx: DatabaseTransactionManager, field_name: str, field_value: Any
    ) -> Optional[ModelType]:
        """Get entity by a specific field."""
        try:
            if not hasattr(self.model, field_name):
                raise AttributeError(
                    f"{self.model.__name__} has no field '{field_name}'"
                )

            query = select(self.model).where(
                getattr(self.model, field_name) == field_value
            )
            result = await tx.scalar(query)

            logger.debug(
                f"Retrieved {self.model.__name__} by {field_name}: " f"{field_value}"
            )
            return result
        except Exception as e:
            logger.error(
                f"Error retrieving {self.model.__name__} by " f"{field_name}: {e}"
            )
            raise

    async def update(
        self, tx: DatabaseTransactionManager, db_obj: ModelType, **kwargs
    ) -> ModelType:
        """Update an existing entity."""
        try:
            for field, value in kwargs.items():
                if hasattr(db_obj, field):
                    setattr(db_obj, field, value)

            await tx.flush()
            await tx.refresh(db_obj)

            logger.debug(f"Updated {self.model.__name__} with ID: {db_obj.id}")
            return db_obj
        except Exception as e:
            logger.error(f"Error updating {self.model.__name__}: {e}")
            raise

    async def delete(self, tx: DatabaseTransactionManager, entity_id: Any) -> bool:
        """Delete an entity by ID."""
        try:
            db_obj = await self.get_by_id(tx, entity_id)
            if db_obj:
                await tx.delete(db_obj)
                logger.debug(f"Deleted {self.model.__name__} with ID: {entity_id}")
                return True
            return False
        except Exception as e:
            logger.error(
                f"Error deleting {self.model.__name__} " f"with ID {entity_id}: {e}"
            )
            raise

    async def delete_by_field(
        self, tx: DatabaseTransactionManager, field_name: str, field_value: Any
    ) -> int:
        """Delete entities by a specific field. Returns count of deleted."""
        try:
            if not hasattr(self.model, field_name):
                raise AttributeError(
                    f"{self.model.__name__} has no field '{field_name}'"
                )

            query = delete(self.model).where(
                getattr(self.model, field_name) == field_value
            )
            result = await tx.execute(query)

            logger.debug(
                f"Deleted {result.rowcount} {self.model.__name__} "
                f"entities by {field_name}: {field_value}"
            )
            return result.rowcount
        except Exception as e:
            logger.error(
                f"Error deleting {self.model.__name__} by " f"{field_name}: {e}"
            )
            raise

    async def count(
        self, tx: DatabaseTransactionManager, filters: Optional[Dict[str, Any]] = None
    ) -> int:
        """Count entities with optional filtering."""
        try:
            from sqlalchemy import func

            query = select(func.count(self.model.id))

            # Apply filters if provided
            if filters:
                for field, value in filters.items():
                    if hasattr(self.model, field):
                        query = query.where(getattr(self.model, field) == value)

            result = await tx.scalar(query)
            logger.debug(f"Counted {result} {self.model.__name__} entities")
            return result or 0
        except Exception as e:
            logger.error(f"Error counting {self.model.__name__}: {e}")
            raise

    async def exists(self, tx: DatabaseTransactionManager, entity_id: Any) -> bool:
        """Check if entity exists by ID."""
        try:
            from sqlalchemy import func

            query = select(func.count(self.model.id)).where(self.model.id == entity_id)
            result = await tx.scalar(query)
            exists = (result or 0) > 0

            logger.debug(
                f"{self.model.__name__} with ID {entity_id} " f"exists: {exists}"
            )
            return exists
        except Exception as e:
            logger.error(
                f"Error checking existence of {self.model.__name__} "
                f"with ID {entity_id}: {e}"
            )
            raise


class RepositoryManager:
    """
    Repository manager for handling multiple repositories with
    shared transaction management.
    """

    def __init__(self):
        self._repositories: Dict[str, BaseRepository] = {}

    def register_repository(self, name: str, repository: BaseRepository) -> None:
        """Register a repository."""
        self._repositories[name] = repository
        logger.debug(f"Registered repository: {name}")

    def get_repository(self, name: str) -> BaseRepository:
        """Get a registered repository."""
        if name not in self._repositories:
            raise ValueError(f"Repository '{name}' not found")
        return self._repositories[name]

    async def with_transaction(self, operation):
        """
        Execute an operation with automatic transaction management.

        Usage:
            async def create_user_and_profile(repo_manager):
                async with repo_manager.with_transaction() as tx:
                    user_repo = repo_manager.get_repository('user')
                    profile_repo = repo_manager.get_repository('profile')

                    user = await user_repo.create(tx, email="test@example.com")
                    profile = await profile_repo.create(
                        tx, user_id=user.id, name="Test User"
                    )
                    await tx.commit()
                    return user, profile
        """
        return UnitOfWork()
