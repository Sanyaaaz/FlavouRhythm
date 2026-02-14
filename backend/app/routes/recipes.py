from __future__ import annotations

from typing import Any

import httpx
from fastapi import APIRouter, Body, HTTPException, Query, status

from ..services.recipedb import RecipeDbClient

router = APIRouter(prefix="/recipe2-api", tags=["recipes"])
recipedb_client = RecipeDbClient()


def _clean_query_params(values: dict[str, Any]) -> dict[str, Any]:
  return {key: value for key, value in values.items() if value not in (None, "", [])}


async def _proxy_get(endpoint: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
  try:
    return await recipedb_client.get(endpoint=endpoint, params=params)
  except httpx.HTTPStatusError as error:
    detail: str | dict[str, Any]
    try:
      detail = error.response.json()
    except ValueError:
      detail = error.response.text or "RecipeDB request failed"
    raise HTTPException(status_code=error.response.status_code, detail=detail) from None
  except httpx.HTTPError:
    raise HTTPException(
      status_code=status.HTTP_502_BAD_GATEWAY,
      detail="Unable to connect to RecipeDB",
    ) from None


async def _proxy_post(endpoint: str, payload: dict[str, Any]) -> dict[str, Any]:
  try:
    return await recipedb_client.post(endpoint=endpoint, payload=payload)
  except httpx.HTTPStatusError as error:
    detail: str | dict[str, Any]
    try:
      detail = error.response.json()
    except ValueError:
      detail = error.response.text or "RecipeDB request failed"
    raise HTTPException(status_code=error.response.status_code, detail=detail) from None
  except httpx.HTTPError:
    raise HTTPException(
      status_code=status.HTTP_502_BAD_GATEWAY,
      detail="Unable to connect to RecipeDB",
    ) from None


@router.get("/recipe/recipeofday")
async def recipe_of_day() -> dict[str, Any]:
  return await _proxy_get("/recipe2-api/recipe/recipeofday")


@router.get("/recipe/recipebytitle")
async def recipe_by_title(title: str = Query(..., min_length=1)) -> dict[str, Any]:
  return await _proxy_get("/recipe2-api/recipe/recipebytitle", params={"title": title})


@router.get("/recipe/recipebyingredientsflavor")
async def recipe_by_ingredients_flavor(
  ingredients: str | None = Query(default=None, description="Comma separated ingredients"),
  flavor: str | None = Query(default=None),
) -> dict[str, Any]:
  params = _clean_query_params({"ingredients": ingredients, "flavor": flavor})
  return await _proxy_get("/recipe2-api/recipe/recipebyingredientsflavor", params=params)


@router.get("/recipe/recipebyregiondiet")
async def recipe_by_region_diet(region_diet: str = Query(..., min_length=1)) -> dict[str, Any]:
  return await _proxy_get("/recipe2-api/recipe/recipebyregiondiet", params={"region_diet": region_diet})


@router.get("/recipe/recipebyrecipediet")
async def recipe_by_recipe_diet(recipe_diet: str = Query(..., min_length=1)) -> dict[str, Any]:
  return await _proxy_get("/recipe2-api/recipe/recipebyrecipediet", params={"recipe_diet": recipe_diet})


@router.get("/recipe/recipebycalories")
async def recipe_by_calories(
  min_calories: int | None = Query(default=None, ge=0),
  max_calories: int | None = Query(default=None, ge=0),
) -> dict[str, Any]:
  params = _clean_query_params({"min_calories": min_calories, "max_calories": max_calories})
  return await _proxy_get("/recipe2-api/recipe/recipebycalories", params=params)


@router.get("/recipe/recipebycarbs")
async def recipe_by_carbs(
  min_carbs: float | None = Query(default=None, ge=0),
  max_carbs: float | None = Query(default=None, ge=0),
) -> dict[str, Any]:
  params = _clean_query_params({"min_carbs": min_carbs, "max_carbs": max_carbs})
  return await _proxy_get("/recipe2-api/recipe/recipebycarbs", params=params)


@router.get("/recipe/recipebyproteinrange")
async def recipe_by_protein_range(
  min_protein: float | None = Query(default=None, ge=0),
  max_protein: float | None = Query(default=None, ge=0),
) -> dict[str, Any]:
  params = _clean_query_params({"min_protein": min_protein, "max_protein": max_protein})
  return await _proxy_get("/recipe2-api/recipe/recipebyproteinrange", params=params)


@router.get("/recipe/recipebyid")
async def recipe_by_id(recipe_id: int = Query(..., ge=1)) -> dict[str, Any]:
  return await _proxy_get("/recipe2-api/recipe/recipebyid", params={"id": recipe_id})


@router.get("/recipe/recipeinstructions")
async def recipe_instructions(recipe_id: int = Query(..., ge=1)) -> dict[str, Any]:
  return await _proxy_get("/recipe2-api/recipe/recipeinstructions", params={"id": recipe_id})


@router.get("/recipe/recipenutritioninfo")
async def recipe_nutrition(recipe_id: int = Query(..., ge=1)) -> dict[str, Any]:
  return await _proxy_get("/recipe2-api/recipe/recipenutritioninfo", params={"id": recipe_id})


@router.get("/recipe/recipemicronutritioninfo")
async def recipe_micro_nutrition(recipe_id: int = Query(..., ge=1)) -> dict[str, Any]:
  return await _proxy_get("/recipe2-api/recipe/recipemicronutritioninfo", params={"id": recipe_id})


@router.post("/recipe/recipemealplan")
async def create_recipe_meal_plan(payload: dict[str, Any] = Body(default_factory=dict)) -> dict[str, Any]:
  return await _proxy_post("/recipe2-api/recipe/recipemealplan", payload=payload)
