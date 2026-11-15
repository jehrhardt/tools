import type { AutomergeUrl, Repo } from "@automerge/automerge-repo/slim";
import { isValidAutomergeUrl } from "@automerge/automerge-repo/slim";
import type { Component } from "solid-js";

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  component: Component;
}

export function defineTool(tool: ToolDefinition): ToolDefinition {
  return tool;
}

export function ensureToolDocument<T extends object>(
  repo: Repo,
  toolId: string,
  initialValue: T,
): AutomergeUrl {
  const storageKey = `tools:document:${toolId}`;
  const persist = (url: AutomergeUrl) => {
    window.localStorage.setItem(storageKey, url);
    return url;
  };

  const queryDoc = new URL(window.location.href).searchParams.get("doc");
  if (queryDoc && isValidAutomergeUrl(queryDoc)) {
    return persist(queryDoc);
  }

  const storedDoc = window.localStorage.getItem(storageKey);
  if (storedDoc && isValidAutomergeUrl(storedDoc)) {
    return storedDoc;
  }

  return persist(repo.create(initialValue).url);
}
