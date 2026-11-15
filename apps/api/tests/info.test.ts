import { infoResponseSchema } from "@tools/shared";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app";

describe("API routes", () => {
  it("GET /info responds with the info payload", async () => {
    const response = await createApp().request("/info");

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");
    expect(infoResponseSchema.parse(await response.json())).toEqual({ status: "OK" });
  });

  it("returns 404 for unknown routes", async () => {
    const response = await createApp().request("/unknown");

    expect(response.status).toBe(404);
  });
});
