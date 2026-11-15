import { defineTool } from "@tools/toolkit";
import { TodoTool } from "./TodoTool";

export { TodoTool } from "./TodoTool";
export { initialTodoDocument, type TodoDocument, type TodoItem } from "./document";

export const todoTool = defineTool({
  id: "todo",
  name: "Todo",
  description: "A local-first task list that syncs through Automerge.",
  icon: "✅",
  component: TodoTool,
});

export default todoTool;
