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
