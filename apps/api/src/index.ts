import type { Env } from "./env";

export { ToolsDurableObject } from "./durable-object";
export type { AppType } from "./app";

export default {
  fetch(request, env) {
    const id = env.TOOLS_DURABLE_OBJECT.idFromName("tools");
    const stub = env.TOOLS_DURABLE_OBJECT.get(id);
    return stub.fetch(request);
  },
} satisfies ExportedHandler<Env>;
