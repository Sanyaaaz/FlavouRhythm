from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.config import settings
from .db.database import Base, engine
from .routes.auth import router as auth_router
from .routes.flavordb import router as flavordb_router
from .routes.profile import router as profile_router
from .routes.recipes import router as recipes_router

app = FastAPI(title=settings.app_name)

app.add_middleware(
  CORSMiddleware,
  allow_origins=settings.cors_origins_list,
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
  Base.metadata.create_all(bind=engine)


@app.get("/health")
def healthcheck() -> dict[str, str]:
  return {"status": "ok"}


app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(recipes_router)
app.include_router(flavordb_router)
