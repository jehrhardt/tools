import { Repo } from "@automerge/automerge-repo";
import { WebSocketClientAdapter } from "@automerge/automerge-repo-network-websocket";
import { IndexedDBStorageAdapter } from "@automerge/automerge-repo-storage-indexeddb";

const websocketProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
const websocketUrl = `${websocketProtocol}//${window.location.host}/sync`;

export const repo = new Repo({
  storage: new IndexedDBStorageAdapter("tools", "documents"),
  network: [new WebSocketClientAdapter(websocketUrl)],
});
