import { infoResponseSchema, type InfoResponse } from "@tools/shared";
import { Hono } from "hono";

export function createApp() {
  return new Hono().get("/info", (c) => {
    const info: InfoResponse = infoResponseSchema.parse({ status: "OK" });
    return c.json(info);
  });
}

export type AppType = ReturnType<typeof createApp>;
