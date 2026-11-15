import { Repo, type DocHandle } from "@automerge/automerge-repo";
import { WebSocketClientAdapter } from "@automerge/automerge-repo-network-websocket";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { startServer } from "../src/server";

interface SyncDocument {
  value: string;
}

const waitFor = async (
  condition: () => boolean | Promise<boolean>,
  timeout = 10_000,
): Promise<void> => {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await condition()) return;
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  throw new Error("Timed out waiting for condition");
};

describe("WebSocket sync", () => {
  let dataDir: string | undefined;

  afterEach(async () => {
    if (dataDir) {
      await rm(dataDir, { recursive: true, force: true });
      dataDir = undefined;
    }
  });

  it("syncs documents in both directions with a real client", async () => {
    dataDir = await mkdtemp(join(tmpdir(), "tools-api-sync-"));
    const server = await startServer({ port: 0, dataDir });
    const clientAdapter = new WebSocketClientAdapter(`ws://127.0.0.1:${server.port}/sync`, 100);
    const clientRepo = new Repo({ network: [clientAdapter] });

    try {
      await waitFor(() => clientRepo.peers.length > 0);

      const clientHandle = clientRepo.create<SyncDocument>({ value: "client-created" });
      let serverHandle: DocHandle<SyncDocument> | undefined;
      await waitFor(async () => {
        try {
          serverHandle = await server.repo.find<SyncDocument>(clientHandle.url);
          return true;
        } catch {
          return false;
        }
      });

      expect(serverHandle?.doc()).toEqual({ value: "client-created" });

      clientHandle.change((doc) => {
        doc.value = "client-updated";
      });
      await waitFor(() => serverHandle?.doc()?.value === "client-updated");

      serverHandle?.change((doc) => {
        doc.value = "server-updated";
      });
      await waitFor(() => clientHandle.doc()?.value === "server-updated");

      expect(clientHandle.doc()).toEqual({ value: "server-updated" });
    } finally {
      await clientRepo.shutdown();
      await server.close();
    }
  }, 30_000);
});
