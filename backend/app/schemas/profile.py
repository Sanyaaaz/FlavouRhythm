from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class UserProfileBase(BaseModel):
  age: int = Field(ge=12, le=90)
  height: float | None = Field(default=None, ge=0)
  weight: float | None = Field(default=None, ge=0)
  activity_level: str

  pcos_concerns: list[str] = Field(min_length=1)
  goal: str

  allergies: list[str] = Field(min_length=1)
  custom_allergy: str | None = Field(default=None, max_length=255)

  deficiencies: list[str] = Field(min_length=1)
  custom_deficiency: str | None = Field(default=None, max_length=255)

  dietary_preferences: str
  preferred_cuisines: list[str] = Field(min_length=1)
  disliked_ingredients: str | None = Field(default=None, max_length=255)

  protein_focus: bool
  carb_sensitivity: str
  meal_style: str


class UserProfileCreate(UserProfileBase):
  pass


class UserProfileUpdate(UserProfileBase):
  pass


class UserProfileRead(UserProfileBase):
  model_config = ConfigDict(from_attributes=True)

  id: int
  user_id: int
  created_at: datetime
  updated_at: datetime
