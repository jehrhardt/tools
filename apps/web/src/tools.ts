import { todoTool } from "@tools/todo";
import type { ToolDefinition } from "@tools/toolkit";

export const tools: ToolDefinition[] = [todoTool];

export function findTool(id: string): ToolDefinition | undefined {
  return tools.find((tool) => tool.id === id);
}
