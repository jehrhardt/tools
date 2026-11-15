import { upgradeWebSocket } from "@hono/node-server";
import { Hono } from "hono";
import { infoResponseSchema, type InfoResponse } from "@tools/shared";

export function createApp() {
  return new Hono()
    .get("/info", (c) => {
      const info: InfoResponse = infoResponseSchema.parse({ status: "OK" });
      return c.json(info);
    })
    .get(
      "/sync",
      upgradeWebSocket(() => ({})),
    );
}

export type AppType = ReturnType<typeof createApp>;
