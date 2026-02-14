from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, JSON, String
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


class User(Base):
  __tablename__ = "users"

  id: Mapped[int] = mapped_column(primary_key=True, index=True)
  email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
  full_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
  hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
  created_at: Mapped[datetime] = mapped_column(
    DateTime(timezone=True),
    default=lambda: datetime.now(timezone.utc),
    nullable=False,
  )


class UserProfile(Base):
  __tablename__ = "user_profiles"

  id: Mapped[int] = mapped_column(primary_key=True, index=True)
  user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True)

  age: Mapped[int] = mapped_column(nullable=False)
  height: Mapped[float | None] = mapped_column(nullable=True)
  weight: Mapped[float | None] = mapped_column(nullable=True)
  activity_level: Mapped[str] = mapped_column(String(32), nullable=False)

  pcos_concerns: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
  goal: Mapped[str] = mapped_column(String(64), nullable=False)

  allergies: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
  custom_allergy: Mapped[str | None] = mapped_column(String(255), nullable=True)

  deficiencies: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
  custom_deficiency: Mapped[str | None] = mapped_column(String(255), nullable=True)

  dietary_preferences: Mapped[str] = mapped_column(String(64), nullable=False)
  preferred_cuisines: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
  disliked_ingredients: Mapped[str | None] = mapped_column(String(255), nullable=True)

  protein_focus: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
  carb_sensitivity: Mapped[str] = mapped_column(String(32), nullable=False)
  meal_style: Mapped[str] = mapped_column(String(64), nullable=False)

  created_at: Mapped[datetime] = mapped_column(
    DateTime(timezone=True),
    default=lambda: datetime.now(timezone.utc),
    nullable=False,
  )
  updated_at: Mapped[datetime] = mapped_column(
    DateTime(timezone=True),
    default=lambda: datetime.now(timezone.utc),
    onupdate=lambda: datetime.now(timezone.utc),
    nullable=False,
  )
