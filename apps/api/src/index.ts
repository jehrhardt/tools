import { startServer } from "./server";

const port = Number(process.env.PORT ?? "8787");
const dataDir = process.env.TOOLS_DATA_DIR ?? "./automerge-repo-data";
const server = await startServer({ port, dataDir });

console.log(`Tools API listening on http://127.0.0.1:${server.port}`);

let shuttingDown = false;
const shutdown = async () => {
  if (shuttingDown) return;
  shuttingDown = true;
  await server.close();
  process.exit(0);
};

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
