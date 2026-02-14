from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
  database_url: str
  jwt_secret_key: str
  jwt_algorithm: str = "HS256"
  access_token_expire_minutes: int = 60
  app_name: str = "flavour-rhythm-api"
  cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
  foodoscope_api_key: str
  foodoscope_base_url: str = "https://api.foodoscope.com"
  foodoscope_timeout_seconds: float = 20.0

  model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

  @property
  def cors_origins_list(self) -> list[str]:
    return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
