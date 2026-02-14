from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
  database_url: str
  jwt_secret_key: str
  jwt_algorithm: str = "HS256"
  access_token_expire_minutes: int = 60
  app_name: str = "flavour-rhythm-api"
  cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
  rdb2_api_key: str = Field(validation_alias=AliasChoices("RDB2_API_KEY", "FOODOSCOPE_API_KEY"))
  rdb2_base_url: str = Field(
    default="http://cosylab.iiitd.edu.in:6969",
    validation_alias=AliasChoices("RDB2_BASE_URL", "FOODOSCOPE_BASE_URL"),
  )
  rdb2_timeout_seconds: float = Field(
    default=20.0,
    validation_alias=AliasChoices("RDB2_TIMEOUT_SECONDS", "FOODOSCOPE_TIMEOUT_SECONDS"),
  )

  model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

  @property
  def cors_origins_list(self) -> list[str]:
    return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()