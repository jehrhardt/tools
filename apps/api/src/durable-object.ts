import { DurableObject } from "cloudflare:workers";
import { createApp } from "./app";
import type { Env } from "./env";

export class ToolsDurableObject extends DurableObject<Env> {
  private readonly app = createApp();

  fetch(request: Request): Response | Promise<Response> {
    return this.app.fetch(request);
  }
}
