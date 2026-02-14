from __future__ import annotations

from typing import Any

import httpx
from fastapi import APIRouter, Body, HTTPException, Query, status

from ..services.recipedb import RecipeDbClient

router = APIRouter(prefix="/recipe2-api", tags=["recipes"])
recipedb_client = RecipeDbClient()


def _clean_query_params(values: dict[str, Any]) -> dict[str, Any]:
  return {key: value for key, value in values.items() if value not in (None, "", [])}


def _extract_data_list(payload: dict[str, Any]) -> list[dict[str, Any]]:
  root_payload = payload.get("payload")
  if isinstance(root_payload, dict):
    data = root_payload.get("data")
    if isinstance(data, list):
      return [item for item in data if isinstance(item, dict)]
    if isinstance(data, dict):
      return [data]
  data = payload.get("data")
  if isinstance(data, list):
    return [item for item in data if isinstance(item, dict)]
  return []


def _contains_title_words(recipe_title: str, query: str) -> bool:
  normalized_title = " ".join(recipe_title.lower().replace("-", " ").split())
  normalized_query = " ".join(query.lower().replace("-", " ").split())
  if not normalized_title or not normalized_query:
    return False
  query_words = [word for word in normalized_query.split(" ") if len(word) >= 3]
  if not query_words:
    return normalized_query in normalized_title
  return all(word in normalized_title for word in query_words)


def _filter_by_title_words(data: list[dict[str, Any]], query: str) -> list[dict[str, Any]]:
  matches: list[dict[str, Any]] = []
  for item in data:
    title = item.get("Recipe_title") or item.get("recipe_title") or item.get("title")
    if isinstance(title, str) and _contains_title_words(title, query):
      matches.append(item)
  return matches


def _empty_search_response(message: str = "No matching recipes found.") -> dict[str, Any]:
  return {"success": True, "message": message, "payload": {"data": []}}


def _extract_error_detail(error: httpx.HTTPStatusError) -> str | dict[str, Any]:
  response = error.response
  raw_text = (response.text or "").strip()
  lowered = raw_text.lower()

  def _is_html_route_error(value: str) -> bool:
    lowered_value = value.lower()
    return "<!doctype html" in lowered_value or "<html" in lowered_value or "cannot get " in lowered_value

  try:
    payload = response.json()
  except ValueError:
    if _is_html_route_error(raw_text):
      return {
        "message": "RecipeDB endpoint mapping failed",
        "upstream_status": response.status_code,
      }
    return raw_text or "RecipeDB request failed"

  if isinstance(payload, dict):
    nested_detail = payload.get("detail")
    if isinstance(nested_detail, str) and _is_html_route_error(nested_detail):
      return {
        "message": "RecipeDB endpoint mapping failed",
        "upstream_status": response.status_code,
      }
    if "error" in payload and isinstance(payload["error"], str):
      return payload
    return payload

  if isinstance(payload, str) and _is_html_route_error(payload):
    return {
      "message": "RecipeDB endpoint mapping failed",
      "upstream_status": response.status_code,
    }
  return raw_text or "RecipeDB request failed"


def _can_try_next_endpoint(error: httpx.HTTPStatusError) -> bool:
  text = (error.response.text or "").lower()
  if "cannot get " in text:
    return True
  return error.response.status_code == status.HTTP_404_NOT_FOUND


async def _proxy_get(endpoint: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
  try:
    return await recipedb_client.get(endpoint=endpoint, params=params)
  except httpx.HTTPStatusError as error:
    detail = _extract_error_detail(error)
    raise HTTPException(status_code=error.response.status_code, detail=detail) from None
  except httpx.HTTPError:
    raise HTTPException(
      status_code=status.HTTP_502_BAD_GATEWAY,
      detail="Unable to connect to RecipeDB",
    ) from None


async def _proxy_get_any(endpoints: list[str], params: dict[str, Any] | None = None) -> dict[str, Any]:
  if not endpoints:
    raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="No RecipeDB endpoint configured")

  last_error: httpx.HTTPStatusError | None = None
  for index, endpoint in enumerate(endpoints):
    try:
      return await recipedb_client.get(endpoint=endpoint, params=params)
    except httpx.HTTPStatusError as error:
      last_error = error
      is_last = index == len(endpoints) - 1
      if not is_last and _can_try_next_endpoint(error):
        continue
      detail = _extract_error_detail(error)
      raise HTTPException(status_code=error.response.status_code, detail=detail) from None
    except httpx.HTTPError:
      raise HTTPException(
        status_code=status.HTTP_502_BAD_GATEWAY,
        detail="Unable to connect to RecipeDB",
      ) from None

  if last_error is not None:
    detail = _extract_error_detail(last_error)
    raise HTTPException(status_code=last_error.response.status_code, detail=detail)
  raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Unable to connect to RecipeDB")


async def _proxy_post(endpoint: str, payload: dict[str, Any]) -> dict[str, Any]:
  try:
    return await recipedb_client.post(endpoint=endpoint, payload=payload)
  except httpx.HTTPStatusError as error:
    detail = _extract_error_detail(error)
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
  primary: dict[str, Any] = {"success": True, "message": "No direct title match.", "payload": {"data": []}}
  try:
    primary = await _proxy_get("/recipe2-api/recipe-bytitle/recipeByTitle",
      params={"title": title},
    )
  except HTTPException as error:
    # Do not fail fast on upstream 404/route mismatch; continue keyword fallbacks.
    if error.status_code not in (status.HTTP_404_NOT_FOUND, status.HTTP_400_BAD_REQUEST):
      raise

  primary_data = _extract_data_list(primary)
  primary_matches = _filter_by_title_words(primary_data, title)
  if primary_matches:
    if isinstance(primary.get("payload"), dict):
      payload_obj = dict(primary["payload"])
      payload_obj["data"] = primary_matches
      result = dict(primary)
      result["payload"] = payload_obj
      return result
    return {"success": True, "message": "Recipes fetched successfully.", "payload": {"data": primary_matches}}

  keyword_matches: list[dict[str, Any]] = []
  for page in range(1, 6):
    try:
      keyword_batch = await _proxy_get(
        "/recipe2-api/recipebyingredient/by-ingredients-categories-title",
        params={"title": title, "page": page, "limit": 25},
      )
    except HTTPException:
      continue

    keyword_data = _extract_data_list(keyword_batch)
    keyword_matches.extend(_filter_by_title_words(keyword_data, title))
    if len(keyword_matches) >= 20:
      break

  if keyword_matches:
    return {
      "success": True,
      "message": "Recipes fetched by keyword title search.",
      "payload": {"data": keyword_matches[:20]},
    }

  keyword_matches = []
  for page in range(1, 7):
    try:
      batch = await _proxy_get(
        "/recipe2-api/recipes/range",
        params={"field": "total_time", "min": 0, "max": 600, "page": page, "limit": 50},
      )
    except HTTPException:
      continue

    batch_data = _extract_data_list(batch)
    keyword_matches.extend(_filter_by_title_words(batch_data, title))
    if len(keyword_matches) >= 20:
      break

  if keyword_matches:
    return {
      "success": True,
      "message": "Recipes fetched by title keyword match.",
      "payload": {"data": keyword_matches[:20]},
    }

  return _empty_search_response("No matching recipes found for the given title.")


@router.get("/recipe/recipebyingredientsflavor")
async def recipe_by_ingredients_flavor(
  ingredients: str | None = Query(default=None, description="Comma separated ingredients"),
  flavor: str | None = Query(default=None),
) -> dict[str, Any]:
  if ingredients:
    params = _clean_query_params(
      {
        "includeIngredients": ingredients,
        "title": flavor,
        "page": 1,
        "limit": 20,
      }
    )
    try:
      return await _proxy_get("/recipe2-api/recipebyingredient/by-ingredients-categories-title", params=params)
    except HTTPException as error:
      if error.status_code in (status.HTTP_404_NOT_FOUND, status.HTTP_400_BAD_REQUEST):
        return _empty_search_response("No ingredient-based match found.")
      raise

  if flavor:
    # Free-text cravings like "pizza" should behave as keyword/title search too.
    try:
      return await _proxy_get_any(
        [
          "/recipe2-api/recipebyingredient/by-ingredients-categories-title",
          "/recipe2-api/recipe-bytitle/recipeByTitle",
          f"/recipe2-api/ingredients/flavor/{flavor}",
        ],
        params={"title": flavor, "page": 1, "limit": 20},
      )
    except HTTPException as error:
      if error.status_code in (status.HTTP_404_NOT_FOUND, status.HTTP_400_BAD_REQUEST):
        return _empty_search_response("No flavor/keyword match found.")
      raise

  raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Provide ingredients or flavor")


@router.get("/recipe/recipebyregiondiet")
async def recipe_by_region_diet(
  region_diet: str = Query(..., min_length=1),
  diet: str = Query(default="pescetarian", min_length=1),
) -> dict[str, Any]:
  try:
    return await _proxy_get_any(
      [
        "/recipe2-api/recipe/region-diet/region-diet",
        "/recipe2-api/recipe/recipebyregiondiet",
      ],
      params={"region": region_diet, "diet": diet, "limit": 20},
    )
  except HTTPException as error:
    if error.status_code in (status.HTTP_404_NOT_FOUND, status.HTTP_400_BAD_REQUEST):
      return _empty_search_response("No region/diet match found.")
    raise


@router.get("/recipe/recipebyrecipediet")
async def recipe_by_recipe_diet(recipe_diet: str = Query(..., min_length=1)) -> dict[str, Any]:
  return await _proxy_get("/recipe2-api/recipe-diet/recipe-diet", params={"diet": recipe_diet, "limit": 20})


@router.get("/recipe/recipebycalories")
async def recipe_by_calories(
  min_calories: int | None = Query(default=None, ge=0),
  max_calories: int | None = Query(default=None, ge=0),
) -> dict[str, Any]:
  params = _clean_query_params({"minCalories": min_calories, "maxCalories": max_calories, "limit": 20})
  return await _proxy_get("/recipe2-api/recipes-calories/calories", params=params)


@router.get("/recipe/recipebycarbs")
async def recipe_by_carbs(
  min_carbs: float | None = Query(default=None, ge=0),
  max_carbs: float | None = Query(default=None, ge=0),
) -> dict[str, Any]:
  params = _clean_query_params({"minCarbs": min_carbs, "maxCarbs": max_carbs, "limit": 20})
  return await _proxy_get("/recipe2-api/recipe-carbo/recipes-by-carbs", params=params)


@router.get("/recipe/recipebyproteinrange")
async def recipe_by_protein_range(
  min_protein: float | None = Query(default=None, ge=0),
  max_protein: float | None = Query(default=None, ge=0),
) -> dict[str, Any]:
  params = _clean_query_params({"min": min_protein, "max": max_protein, "page": 1, "limit": 20})
  return await _proxy_get("/recipe2-api/protein/protein-range", params=params)


@router.get("/recipe/recipebyid")
async def recipe_by_id(recipe_id: int = Query(..., ge=1)) -> dict[str, Any]:
  return await _proxy_get(f"/recipe2-api/search-recipe/{recipe_id}")


@router.get("/recipe/recipeinstructions")
async def recipe_instructions(recipe_id: int = Query(..., ge=1)) -> dict[str, Any]:
  return await _proxy_get(f"/recipe2-api/instructions/{recipe_id}")


@router.get("/recipe/recipenutritioninfo")
async def recipe_nutrition(recipe_id: int = Query(..., ge=1)) -> dict[str, Any]:
  return await _proxy_get("/recipe2-api/recipe-nutri/nutritioninfo", params={"page": 1, "limit": 20, "recipe_id": recipe_id})


@router.get("/recipe/recipemicronutritioninfo")
async def recipe_micro_nutrition(recipe_id: int = Query(..., ge=1)) -> dict[str, Any]:
  return await _proxy_get(
    "/recipe2-api/recipe-micronutri/micronutritioninfo",
    params={"page": 1, "limit": 20, "recipe_id": recipe_id},
  )


@router.post("/recipe/recipemealplan")
async def create_recipe_meal_plan(payload: dict[str, Any] = Body(default_factory=dict)) -> dict[str, Any]:
  return await _proxy_post("/recipe2-api/mealplan/meal-plan", payload=payload)
