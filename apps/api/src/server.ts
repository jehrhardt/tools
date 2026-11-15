import { serve } from "@hono/node-server";
import { Repo } from "@automerge/automerge-repo";
import { WebSocketServerAdapter } from "@automerge/automerge-repo-network-websocket";
import { NodeFSStorageAdapter } from "@automerge/automerge-repo-storage-nodefs";
import { WebSocketServer } from "ws";
import { createApp } from "./app";

export async function startServer(
  options: {
    port?: number;
    hostname?: string;
    dataDir?: string;
  } = {},
): Promise<{
  port: number;
  repo: Repo;
  close(): Promise<void>;
}> {
  const port = options.port ?? 8787;
  const hostname = options.hostname;
  const dataDir = options.dataDir ?? "./automerge-repo-data";
  const wss = new WebSocketServer({ noServer: true });
  const repo = new Repo({
    storage: new NodeFSStorageAdapter(dataDir),
    network: [new WebSocketServerAdapter(wss)],
  });
  const app = createApp();

  return new Promise((resolve, reject) => {
    const server = serve(
      {
        fetch: app.fetch,
        port,
        hostname,
        websocket: { server: wss },
      },
      (info) => {
        resolve({
          port: info.port,
          repo,
          close: async () => {
            await repo.shutdown();
            await new Promise<void>((closeResolve, closeReject) => {
              server.close((error) => {
                if (error) {
                  closeReject(error);
                } else {
                  closeResolve();
                }
              });
            });
          },
        });
      },
    );

    server.once("error", reject);
  });
}
