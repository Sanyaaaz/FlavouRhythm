from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..db.database import get_db
from ..db.models import User
from ..schemas.user import Token, UserCreate, UserLogin, UserRead
from ..core.security import create_access_token, decode_access_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")


def normalize_email(email: str) -> str:
  return email.strip().lower()


def build_token_response(user: User) -> Token:
  token = create_access_token(subject=user.email)
  return Token(access_token=token, user=UserRead.model_validate(user))


@router.post("/signup", response_model=Token, status_code=status.HTTP_201_CREATED)
def signup(payload: UserCreate, db: Session = Depends(get_db)) -> Token:
  email = normalize_email(str(payload.email))
  existing = db.query(User).filter(User.email == email).first()
  if existing:
    raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

  user = User(
    email=email,
    full_name=payload.full_name,
    hashed_password=hash_password(payload.password),
  )
  db.add(user)
  try:
    db.commit()
  except IntegrityError:
    db.rollback()
    raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered") from None
  db.refresh(user)

  return build_token_response(user)


@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)) -> Token:
  email = normalize_email(str(payload.email))
  user = db.query(User).filter(User.email == email).first()
  if not user or not verify_password(payload.password, user.hashed_password):
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Invalid email or password",
      headers={"WWW-Authenticate": "Bearer"},
    )

  return build_token_response(user)


@router.post("/token", response_model=Token)
def login_with_oauth2_form(
  form_data: OAuth2PasswordRequestForm = Depends(),
  db: Session = Depends(get_db),
) -> Token:
  # OAuth2 form uses "username" field; we treat it as email.
  email = normalize_email(form_data.username)
  user = db.query(User).filter(User.email == email).first()
  if not user or not verify_password(form_data.password, user.hashed_password):
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Invalid email or password",
      headers={"WWW-Authenticate": "Bearer"},
    )

  return build_token_response(user)


@router.get("/me", response_model=UserRead)
def me(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> UserRead:
  email = decode_access_token(token)
  if not email:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Invalid or expired token",
      headers={"WWW-Authenticate": "Bearer"},
    )

  user = db.query(User).filter(User.email == email).first()
  if not user:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

  return UserRead.model_validate(user)
