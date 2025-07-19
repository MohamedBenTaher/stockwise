from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_db
from app.schemas.user import User, UserCreate, Token
from app.services.auth import AuthService, get_current_user

router = APIRouter()


@router.post("/register", response_model=User)
async def register(user: UserCreate, db: AsyncSession = Depends(get_db)):
    """Register a new user."""
    auth_service = AuthService(db)

    # Check if user already exists
    existing_user = await auth_service.get_user_by_email(user.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )

    return await auth_service.create_user(user)


@router.post("/login", response_model=Token)
async def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):
    """Login and get access token."""
    auth_service = AuthService(db)
    user = await auth_service.authenticate_user(form_data.username, form_data.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = auth_service.create_access_token(data={"sub": user.email})

    # Set JWT token as HTTP-only cookie
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        max_age=1800,  # 30 minutes
        expires=1800,
        samesite="lax",
        secure=False,  # Set to True in production with HTTPS
    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    """Get current user info."""
    return current_user


@router.post("/refresh", response_model=Token)
async def refresh_token(
    response: Response,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Refresh access token."""
    auth_service = AuthService(db)
    access_token = auth_service.create_access_token(data={"sub": current_user.email})

    # Update cookie with new token
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        max_age=1800,  # 30 minutes
        expires=1800,
        samesite="lax",
        secure=False,  # Set to True in production with HTTPS
    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/logout")
async def logout(response: Response):
    """Logout user by clearing the access token cookie."""
    response.delete_cookie(key="access_token")
    return {"message": "Successfully logged out"}
