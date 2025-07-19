from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db import get_db
from app.models.user import User as UserModel
from app.schemas.user import User, UserCreate, TokenData
from app.config import settings

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_token_from_cookie_or_header(request: Request) -> Optional[str]:
    """Extract token from cookie or Authorization header."""
    # First try to get token from cookie
    token = request.cookies.get("access_token")
    if token:
        # Remove 'Bearer ' prefix if present
        if token.startswith("Bearer "):
            token = token[7:]
        return token

    # Fallback to Authorization header
    authorization = request.headers.get("Authorization")
    if authorization and authorization.startswith("Bearer "):
        return authorization[7:]

    return None


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash."""
        return pwd_context.verify(plain_password, hashed_password)

    def get_password_hash(self, password: str) -> str:
        """Generate password hash."""
        return pwd_context.hash(password)

    async def get_user_by_email(self, email: str) -> Optional[UserModel]:
        """Get user by email."""
        result = await self.db.execute(
            select(UserModel).where(UserModel.email == email)
        )
        return result.scalar_one_or_none()

    async def authenticate_user(self, email: str, password: str) -> Optional[UserModel]:
        """Authenticate user with email and password."""
        user = await self.get_user_by_email(email)
        if not user:
            return None
        if not self.verify_password(password, user.hashed_password):
            return None
        return user

    async def create_user(self, user: UserCreate) -> UserModel:
        """Create a new user."""
        hashed_password = self.get_password_hash(user.password)
        db_user = UserModel(
            email=user.email,
            hashed_password=hashed_password,
            full_name=user.full_name,
        )
        self.db.add(db_user)
        await self.db.commit()
        await self.db.refresh(db_user)
        return db_user

    def create_access_token(
        self, data: dict, expires_delta: Optional[timedelta] = None
    ):
        """Create JWT access token."""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(
                minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
            )
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(
            to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
        )
        return encoded_jwt


async def get_current_user(
    request: Request, db: AsyncSession = Depends(get_db)
) -> User:
    """Get current authenticated user from cookie or header."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Get token from cookie or header
    token = get_token_from_cookie_or_header(request)

    if not token:
        raise credentials_exception

    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception

    auth_service = AuthService(db)
    user = await auth_service.get_user_by_email(email=token_data.username)
    if user is None:
        raise credentials_exception

    return user
