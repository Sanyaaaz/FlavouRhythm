from __future__ import annotations

from typing import Any

import httpx
from fastapi import APIRouter, HTTPException, Query, status

from ..services.flavordb import FlavorDbClient

router = APIRouter(prefix="/flavordb", tags=["flavordb"])
flavordb_client = FlavorDbClient()


def _clean_query_params(values: dict[str, Any]) -> dict[str, Any]:
  return {key: value for key, value in values.items() if value not in (None, "", [])}


async def _proxy_get(endpoint: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
  try:
    return await flavordb_client.get(endpoint=endpoint, params=params)
  except httpx.HTTPStatusError as error:
    detail: str | dict[str, Any]
    try:
      detail = error.response.json()
    except ValueError:
      detail = error.response.text or "FlavorDB request failed"
    raise HTTPException(status_code=error.response.status_code, detail=detail) from None
  except httpx.HTTPError:
    raise HTTPException(
      status_code=status.HTTP_502_BAD_GATEWAY,
      detail="Unable to connect to FlavorDB",
    ) from None


@router.get("/food/by-alias")
async def food_pairings_by_ingredient(food_pair: str = Query(..., min_length=1)) -> dict[str, Any]:
  return await _proxy_get("/food/by-alias", params={"food_pair": food_pair})


@router.get("/entities/by-natural-source")
async def entities_by_natural_source(
  natural_source: str = Query(..., alias="naturalSource", min_length=1),
  page: int = Query(default=0, ge=0),
  size: int = Query(default=20, ge=1),
) -> dict[str, Any]:
  return await _proxy_get(
    "/entities/by-natural-source",
    params={"naturalSource": natural_source, "page": page, "size": size},
  )


@router.get("/entities/by-name-and-category")
async def entities_by_name_and_category(
  name: str = Query(..., min_length=1),
  category: str = Query(..., min_length=1),
  page: int = Query(default=0, ge=0),
  size: int = Query(default=20, ge=1),
) -> dict[str, Any]:
  return await _proxy_get(
    "/entities/by-name-and-category",
    params={"name": name, "category": category, "page": page, "size": size},
  )


@router.get("/entities/by-readable-name")
async def entities_by_readable_name(
  alias_readable: str = Query(..., alias="aliasReadable", min_length=1),
  page: int = Query(default=0, ge=0),
  size: int = Query(default=20, ge=1),
) -> dict[str, Any]:
  return await _proxy_get(
    "/entities/by-entity-alias-readable",
    params={"aliasReadable": alias_readable, "page": page, "size": size},
  )


@router.get("/molecules/by-flavor-profile")
async def molecules_by_flavor_profile(
  flavor_profile: str = Query(..., alias="flavorProfile", min_length=1),
  page: int = Query(default=0, ge=0),
  size: int = Query(default=20, ge=1),
) -> dict[str, Any]:
  return await _proxy_get(
    "/molecules_data/by-flavorProfile",
    params={"flavorProfile": flavor_profile, "page": page, "size": size},
  )


@router.get("/molecules/by-common-name")
async def molecules_by_common_name(
  common_name: str = Query(..., alias="commonName", min_length=1),
  page: int = Query(default=0, ge=0),
  size: int = Query(default=20, ge=1),
) -> dict[str, Any]:
  return await _proxy_get(
    "/molecules_data/by-commonName",
    params={"commonName": common_name, "page": page, "size": size},
  )


@router.get("/molecules/by-functional-groups")
async def molecules_by_functional_groups(
  functional_groups: str = Query(..., min_length=1),
  page: int = Query(default=0, ge=0),
  size: int = Query(default=20, ge=1),
) -> dict[str, Any]:
  return await _proxy_get(
    "/molecules_data/by-functionalGroups",
    params={"functional_groups": functional_groups, "page": page, "size": size},
  )


@router.get("/properties/by-description")
async def properties_by_description(
  description: str = Query(..., min_length=1),
  page: int = Query(default=0, ge=0),
  size: int = Query(default=20, ge=1),
) -> dict[str, Any]:
  return await _proxy_get(
    "/properties/by-description",
    params={"description": description, "page": page, "size": size},
  )


@router.get("/properties/taste-threshold")
async def properties_by_taste_threshold(
  values: str = Query(..., min_length=1),
  page: int = Query(default=0, ge=0),
  size: int = Query(default=20, ge=1),
) -> dict[str, Any]:
  params = _clean_query_params({"values": values, "page": page, "size": size})
  return await _proxy_get("/properties/taste-threshold", params=params)
