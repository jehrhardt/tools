import { spawn, type ChildProcess } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
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
    if ((error as NodeJS.ErrnoException).code !== "ESRCH") {
      throw error;
    }
  }
}

async function stopApi(child: ChildProcess): Promise<void> {
  if (child.pid === undefined || child.exitCode !== null) {
    return;
  }

  const exited = new Promise<void>((resolve) => child.once("exit", () => resolve()));
  const isWindows = process.platform === "win32";

  if (isWindows) {
    child.kill("SIGTERM");
  } else {
    signalGroup(child.pid, "SIGTERM");
  }

  await Promise.race([exited, delay(10_000)]);
  if (!isWindows && child.exitCode === null) {
    signalGroup(child.pid, "SIGKILL");
  }
}

export default async function setup() {
  const dataDir = await mkdtemp(join(tmpdir(), "tools-web-test-"));
  const environment: NodeJS.ProcessEnv = {
    ...process.env,
    CI: process.env.CI ?? "1",
    TOOLS_DATA_DIR: dataDir,
  };
  const child = spawn("pnpm", ["--filter", "@tools/api", "dev"], {
    cwd: fileURLToPath(new URL("..", import.meta.url)),
    env: environment,
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
      await rm(dataDir, { recursive: true, force: true });
      throw new Error(`The API exited before it became ready:\n${logs.join("")}`);
    }

    if (await isApiUp()) {
      return async () => {
        await stopApi(child);
        await rm(dataDir, { recursive: true, force: true });
      };
    }

    await delay(500);
  }

  await stopApi(child);
  await rm(dataDir, { recursive: true, force: true });
  throw new Error(
    `The API did not become ready at ${infoUrl} within ${startTimeoutMs}ms:\n${logs.join("")}`,
  );
}
