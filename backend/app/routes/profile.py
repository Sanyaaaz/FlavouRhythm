from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from ..core.security import decode_access_token
from ..db.database import get_db
from ..db.models import User, UserProfile
from ..schemas.profile import UserProfileCreate, UserProfileRead, UserProfileUpdate

router = APIRouter(prefix="/profile", tags=["profile"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
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
  return user


@router.get("/me", response_model=UserProfileRead)
def read_profile(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> UserProfileRead:
  profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
  if not profile:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
  return UserProfileRead.model_validate(profile)


@router.post("/me", response_model=UserProfileRead, status_code=status.HTTP_201_CREATED)
def create_profile(
  payload: UserProfileCreate,
  user: User = Depends(get_current_user),
  db: Session = Depends(get_db),
) -> UserProfileRead:
  existing = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
  if existing:
    raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Profile already exists")

  profile = UserProfile(
    user_id=user.id,
    age=payload.age,
    height=payload.height,
    weight=payload.weight,
    activity_level=payload.activity_level,
    pcos_concerns=payload.pcos_concerns,
    goal=payload.goal,
    allergies=payload.allergies,
    custom_allergy=payload.custom_allergy,
    deficiencies=payload.deficiencies,
    custom_deficiency=payload.custom_deficiency,
    dietary_preferences=payload.dietary_preferences,
    preferred_cuisines=payload.preferred_cuisines,
    disliked_ingredients=payload.disliked_ingredients,
    protein_focus=payload.protein_focus,
    carb_sensitivity=payload.carb_sensitivity,
    meal_style=payload.meal_style,
  )
  db.add(profile)
  db.commit()
  db.refresh(profile)
  return UserProfileRead.model_validate(profile)


@router.put("/me", response_model=UserProfileRead)
def update_profile(
  payload: UserProfileUpdate,
  user: User = Depends(get_current_user),
  db: Session = Depends(get_db),
) -> UserProfileRead:
  profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
  if not profile:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

  profile.age = payload.age
  profile.height = payload.height
  profile.weight = payload.weight
  profile.activity_level = payload.activity_level
  profile.pcos_concerns = payload.pcos_concerns
  profile.goal = payload.goal
  profile.allergies = payload.allergies
  profile.custom_allergy = payload.custom_allergy
  profile.deficiencies = payload.deficiencies
  profile.custom_deficiency = payload.custom_deficiency
  profile.dietary_preferences = payload.dietary_preferences
  profile.preferred_cuisines = payload.preferred_cuisines
  profile.disliked_ingredients = payload.disliked_ingredients
  profile.protein_focus = payload.protein_focus
  profile.carb_sensitivity = payload.carb_sensitivity
  profile.meal_style = payload.meal_style

  db.commit()
  db.refresh(profile)
  return UserProfileRead.model_validate(profile)
