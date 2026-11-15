import { infoResponseSchema } from "@tools/shared";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app";
import worker from "../src/index";
import type { Env } from "../src/env";

function createTestEnv(): Env {
  const app = createApp();

  const stub = {
    fetch: (request: Request) => app.fetch(request),
  };

  return {
    TOOLS_DURABLE_OBJECT: {
      idFromName: () => "tools",
      get: () => stub,
    } as unknown as Env["TOOLS_DURABLE_OBJECT"],
  };
}

describe("GET /info", () => {
  it("responds with the info payload", async () => {
    const response = await createApp().request("/info");

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");
    expect(infoResponseSchema.parse(await response.json())).toEqual({ status: "OK" });
  });

  it("returns 404 for unknown routes", async () => {
    const response = await createApp().request("/unknown");

    expect(response.status).toBe(404);
  });

  it("is served through the worker entry point", async () => {
    const response = await worker.fetch(new Request("https://tools.test/info"), createTestEnv());

    expect(response.status).toBe(200);
    expect(infoResponseSchema.parse(await response.json())).toEqual({ status: "OK" });
  });
});
