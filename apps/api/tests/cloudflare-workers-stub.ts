/**
 * Minimal stand-in for the `cloudflare:workers` module, which is only
 * available inside the Workers runtime. It lets the API be tested with Vitest
 * on Node; the durable object itself is not exercised by these tests.
 */
export class DurableObject<Env = unknown> {
  protected readonly ctx: unknown;
  protected readonly env: Env;

  constructor(ctx?: unknown, env?: Env) {
    this.ctx = ctx;
    this.env = env as Env;
  }
}
