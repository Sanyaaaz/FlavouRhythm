# FlavouRhythm

FlavouRhythm is a PCOS-aware recipe intelligence app. It accepts free-text food intent (dish/cuisine/craving), optional pantry and nutrition constraints, and profile context (deficiencies, diet preferences), then returns a recipe plan designed to preserve flavor while improving metabolic suitability.

## Product Idea

Core user journey:
1. User signs up and saves profile (PCOS concerns, deficiencies, allergies, dietary preference).
2. User enters what they want to eat (for example: `pizza`, `sweet snack`, `south indian breakfast`).
3. System searches RecipeDB via backend wrappers and ranks matches by:
   - title/keyword intent,
   - pantry compatibility,
   - optional calorie/protein constraints,
   - symptom mode focus (insulin spikes, bloating, fatigue, etc.),
   - deficiency-aware micronutrient support.
4. System enriches result with nutrition, micronutrition, instructions, glycemic-load badge, and flavor-preserving swap suggestions from FlavorDB pair signals.
5. User can review:
   - adapted recipe,
   - what changed,
   - refinement chat suggestions,
   - craving assistant,
   - micro meal plan.

## Technical Background

Architecture:

```text
React (Vite + TS)
  -> FastAPI backend
     -> PostgreSQL (auth + user profile)
     -> RecipeDB wrappers (/recipe2-api/*)
     -> FlavorDB wrappers (/flavordb/*)
```

Important design decision:
- Frontend never directly calls RecipeDB/FlavorDB.
- All external calls go through FastAPI proxy routes for auth handling, input normalization, fallback mapping, and error control.

## Tech Stack

- Frontend: React 19, TypeScript, Vite, Tailwind CSS
- Backend: FastAPI, SQLAlchemy, Pydantic Settings, JWT auth (`python-jose`), `httpx`
- DB: PostgreSQL with `psycopg`

## Repository Structure

```text
FlavouRhythm/
  src/
    components/
    screens/
    lib/
  backend/
    app/
      core/
      db/
      routes/
      schemas/
      services/
```

## Prerequisites

- Node.js 20+
- npm 10+
- Python 3.12+
- PostgreSQL 14+

## Environment Variables

Frontend (`.env.local` in repo root):

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Backend (`backend/.env`), starting from `backend/.env.example`:

```env
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/flavour_rhythm
JWT_SECRET_KEY=replace_with_a_long_random_secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

RDB2_API_KEY=replace_with_your_rdb2_api_key
RDB2_BASE_URL=http://cosylab.iiitd.edu.in:6969
RDB2_TIMEOUT_SECONDS=20

FLAVORDB_AUTH_TOKEN=replace_with_your_flavordb_auth_token
FLAVORDB_BASE_URL=http://cosylab.iiitd.edu.in:6969/flavordb
FLAVORDB_TIMEOUT_SECONDS=20
```

## Local Run

Backend:

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Frontend:

```powershell
cd ..
npm install
npm run dev
```

Useful URLs:
- Frontend: `http://127.0.0.1:5173`
- Backend Swagger: `http://127.0.0.1:8000/docs`
- Backend OpenAPI: `http://127.0.0.1:8000/openapi.json`

## Backend API Endpoints

Health:
- `GET /health`

Auth:
- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/token` (OAuth2 username/password form)
- `GET /auth/me`

Profile:
- `GET /profile/me`
- `POST /profile/me`
- `PUT /profile/me`

RecipeDB wrappers:
- `GET /recipe2-api/recipe/recipeofday`
- `GET /recipe2-api/recipe/recipebytitle?title=<text>`
- `GET /recipe2-api/recipe/recipebyingredientsflavor?ingredients=<csv>&flavor=<text>`
- `GET /recipe2-api/recipe/recipebyregiondiet?region_diet=<text>&diet=<text>`
- `GET /recipe2-api/recipe/recipebyrecipediet?recipe_diet=<text>`
- `GET /recipe2-api/recipe/recipebycalories?min_calories=<n>&max_calories=<n>`
- `GET /recipe2-api/recipe/recipebycarbs?min_carbs=<n>&max_carbs=<n>`
- `GET /recipe2-api/recipe/recipebyproteinrange?min_protein=<n>&max_protein=<n>`
- `GET /recipe2-api/recipe/recipebyid?recipe_id=<id>`
- `GET /recipe2-api/recipe/recipeinstructions?recipe_id=<id>`
- `GET /recipe2-api/recipe/recipenutritioninfo?recipe_id=<id>`
- `GET /recipe2-api/recipe/recipemicronutritioninfo?recipe_id=<id>`
- `POST /recipe2-api/recipe/recipemealplan`

FlavorDB wrappers:
- `GET /flavordb/food/by-alias?food_pair=<text>`
- `GET /flavordb/entities/by-natural-source?naturalSource=<text>&page=<n>&size=<n>`
- `GET /flavordb/entities/by-name-and-category?name=<text>&category=<text>&page=<n>&size=<n>`
- `GET /flavordb/entities/by-readable-name?aliasReadable=<text>&page=<n>&size=<n>`
- `GET /flavordb/molecules/by-flavor-profile?flavorProfile=<text>&page=<n>&size=<n>`
- `GET /flavordb/molecules/by-common-name?commonName=<text>&page=<n>&size=<n>`
- `GET /flavordb/molecules/by-functional-groups?functional_groups=<text>&page=<n>&size=<n>`
- `GET /flavordb/properties/by-description?description=<text>&page=<n>&size=<n>`
- `GET /flavordb/properties/taste-threshold?values=<text>&page=<n>&size=<n>`

## Endpoints Actively Used by Frontend Logic

Main recipe/adaptation flow (`src/lib/recipePlannerApi.ts`):
- `/recipe2-api/recipe/recipebyingredientsflavor`
- `/recipe2-api/recipe/recipebytitle`
- `/recipe2-api/recipe/recipebyregiondiet`
- `/recipe2-api/recipe/recipebyrecipediet`
- `/recipe2-api/recipe/recipebycarbs`
- `/recipe2-api/recipe/recipebycalories`
- `/recipe2-api/recipe/recipebyproteinrange`
- `/recipe2-api/recipe/recipeofday`
- `/recipe2-api/recipe/recipebyid`
- `/recipe2-api/recipe/recipenutritioninfo`
- `/recipe2-api/recipe/recipeinstructions`
- `/recipe2-api/recipe/recipemicronutritioninfo`
- `/recipe2-api/recipe/recipemealplan`
- `/flavordb/food/by-alias`

Craving assistant flow (`src/lib/cravingAssistantApi.ts`):
- `/recipe2-api/recipe/recipebyingredientsflavor`
- `/recipe2-api/recipe/recipebytitle`
- `/recipe2-api/recipe/recipebyregiondiet`
- `/flavordb/food/by-alias`
- `/flavordb/entities/by-readable-name`

## Security and Data Notes

- Passwords are hashed before storage.
- JWT tokens are issued on signup/login and used via Bearer auth.
- SQLAlchemy auto-creates schema at startup (`Base.metadata.create_all(bind=engine)`).
- Upstream API credentials stay in backend env, never in frontend.

## Troubleshooting

- `ApiKey is not provided` (RecipeDB):
  - Check `RDB2_API_KEY` in `backend/.env`
  - Restart backend after env edits.
- `Not enough tokens` (FlavorDB):
  - Set a valid `FLAVORDB_AUTH_TOKEN`.
- `Cannot GET ...` in provider response:
  - Usually upstream route mismatch.
  - Keep frontend pointed to backend wrappers only.

## Build

Frontend:

```powershell
npm run build
```

Backend quick check:

```powershell
cd backend
python -m compileall app
```
