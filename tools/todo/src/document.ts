export interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export interface TodoDocument {
  items: TodoItem[];
}

export const initialTodoDocument: TodoDocument = { items: [] };
