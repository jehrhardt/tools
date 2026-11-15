import { spawn, type ChildProcess } from "node:child_process";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";

const apiUrl = process.env.TOOLS_API_URL ?? "http://127.0.0.1:8787";
const infoUrl = new URL("/info", apiUrl).href;
const startTimeoutMs = 60_000;

async function isApiUp(): Promise<boolean> {
  try {
    const response = await fetch(infoUrl, { signal: AbortSignal.timeout(1_000) });
    return response.ok;
  } catch {
    return false;
  }
}

function signalGroup(pid: number, signal: NodeJS.Signals): void {
  try {
    process.kill(-pid, signal);
  } catch (error) {
    // The process group may already be gone (ESRCH) when teardown runs.
    if ((error as NodeJS.ErrnoException).code !== "ESRCH") {
      throw error;
    }
  }
}

function stopApi(child: ChildProcess): Promise<void> {
  if (child.pid === undefined || child.exitCode !== null) {
    return Promise.resolve();
  }

  const exited = new Promise<void>((resolve) => child.once("exit", () => resolve()));
  const isWindows = process.platform === "win32";

  if (isWindows) {
    child.kill("SIGTERM");
  } else {
    // pnpm spawns `wrangler dev` as a child, so signal the whole process group.
    signalGroup(child.pid, "SIGTERM");
  }

  return Promise.race([exited, delay(10_000)]).then(() => {
    if (!isWindows && child.exitCode === null) {
      signalGroup(child.pid!, "SIGKILL");
    }
  });
}

/**
 * Starts the API with `wrangler dev` when it is not already reachable, so the
 * browser tests can exercise the real request/response cycle against it.
 */
export default async function setup() {
  if (await isApiUp()) {
    return;
  }

  const child = spawn("pnpm", ["--filter", "@tools/api", "dev"], {
    cwd: fileURLToPath(new URL("..", import.meta.url)),
    env: {
      ...process.env,
      CI: process.env.CI ?? "1",
      WRANGLER_SEND_METRICS: "false",
    },
    detached: process.platform !== "win32",
    stdio: ["ignore", "pipe", "pipe"],
  });

  const logs: string[] = [];
  child.stdout?.on("data", (chunk: Buffer) => logs.push(String(chunk)));
  child.stderr?.on("data", (chunk: Buffer) => logs.push(String(chunk)));

  let exited = false;
  child.once("exit", () => {
    exited = true;
  });

  const deadline = Date.now() + startTimeoutMs;

  while (Date.now() < deadline) {
    if (exited) {
      throw new Error(`The API exited before it became ready:\n${logs.join("")}`);
    }

    if (await isApiUp()) {
      return () => stopApi(child);
    }

    await delay(500);
  }

  await stopApi(child);
  throw new Error(
    `The API did not become ready at ${infoUrl} within ${startTimeoutMs}ms:\n${logs.join("")}`,
  );
}
