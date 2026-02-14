# Flavour Rhythm Backend (FastAPI)

## Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and set values for PostgreSQL + JWT.
Use SQLAlchemy URL format: `postgresql+psycopg://username:password@host:5432/db_name`.
RecipeDB uses the Postman collection variables:
- `RDB2_BASE_URL` (default: `http://cosylab.iiitd.edu.in:6969`)
- `RDB2_API_KEY`
- `RDB2_TIMEOUT_SECONDS`

Auth forwarded upstream: `Authorization: Bearer <apiKey>`.

## Run

```bash
uvicorn app.main:app --reload --port 8000
```

## Auth APIs

- `POST /auth/signup`
  - Body: `{ "email": "user@example.com", "password": "strongpass", "full_name": "User" }`
- `POST /auth/login`
  - Body: `{ "email": "user@example.com", "password": "strongpass" }`
- `POST /auth/token`
  - OAuth2 form fields: `username=<email>`, `password=<password>` (used by Swagger Authorize)
- `GET /auth/me`
  - Header: `Authorization: Bearer <token>`

All auth responses return JWT bearer token and user details.

## Recipe APIs

- `GET /recipe2-api/recipe/recipeofday`
- `GET /recipe2-api/recipe/recipebytitle?title=<text>`
- `GET /recipe2-api/recipe/recipebyingredientsflavor?ingredients=<csv>&flavor=<text>`
- `GET /recipe2-api/recipe/recipebyregiondiet?region_diet=<diet>`
- `GET /recipe2-api/recipe/recipebyrecipediet?recipe_diet=<diet>`
- `GET /recipe2-api/recipe/recipebycalories?min_calories=<n>&max_calories=<n>`
- `GET /recipe2-api/recipe/recipebycarbs?min_carbs=<n>&max_carbs=<n>`
- `GET /recipe2-api/recipe/recipebyproteinrange?min_protein=<n>&max_protein=<n>`
- `GET /recipe2-api/recipe/recipebyid?recipe_id=<id>`
- `GET /recipe2-api/recipe/recipeinstructions?recipe_id=<id>`
- `GET /recipe2-api/recipe/recipenutritioninfo?recipe_id=<id>`
- `GET /recipe2-api/recipe/recipemicronutritioninfo?recipe_id=<id>`
- `POST /recipe2-api/recipe/recipemealplan`
