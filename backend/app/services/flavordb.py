from __future__ import annotations

from typing import Any

import httpx

from ..core.config import settings


class FlavorDbClient:
  def __init__(self) -> None:
    self.base_url = settings.flavordb_base_url.rstrip("/")
    self.timeout = settings.flavordb_timeout_seconds
    self.auth_token = settings.flavordb_auth_token

  async def get(self, endpoint: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
    return await self._request("GET", endpoint, params=params)

  async def _request(self, method: str, endpoint: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
    url = f"{self.base_url}/{endpoint.lstrip('/')}"
    headers = {"Authorization": f"Bearer {self.auth_token}"}

    async with httpx.AsyncClient(timeout=self.timeout) as client:
      response = await client.request(method=method, url=url, headers=headers, params=params)

    response.raise_for_status()
    return response.json()
