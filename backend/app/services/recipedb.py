from __future__ import annotations

from typing import Any

import httpx

from ..core.config import settings


class RecipeDbClient:
  def __init__(self) -> None:
    self.base_url = settings.foodoscope_base_url.rstrip("/")
    self.timeout = settings.foodoscope_timeout_seconds
    self.api_key = settings.foodoscope_api_key

  async def get(self, endpoint: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
    return await self._request("GET", endpoint, params=params)

  async def post(self, endpoint: str, payload: dict[str, Any]) -> dict[str, Any]:
    return await self._request("POST", endpoint, json=payload)

  async def _request(
    self,
    method: str,
    endpoint: str,
    params: dict[str, Any] | None = None,
    json: dict[str, Any] | None = None,
  ) -> dict[str, Any]:
    url = f"{self.base_url}/{endpoint.lstrip('/')}"
    headers = {
      "ApiKey": self.api_key,
      "apikey": self.api_key,
      "x-api-key": self.api_key,
      "Authorization": f"Bearer {self.api_key}",
    }
    request_params = dict(params or {})
    request_params.setdefault("apiKey", self.api_key)
    request_params.setdefault("ApiKey", self.api_key)
    request_params.setdefault("apikey", self.api_key)
    request_params.setdefault("api_key", self.api_key)

    async with httpx.AsyncClient(timeout=self.timeout) as client:
      response = await client.request(
        method=method,
        url=url,
        headers=headers,
        params=request_params,
        json=json,
      )

    response.raise_for_status()
    return response.json()
