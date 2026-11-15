import { ensureToolDocument } from "@tools/toolkit";
import { useDocument, useRepo } from "@automerge/automerge-repo-solid-primitives";
import { createMemo, createSignal, For, Show } from "solid-js";
import { initialTodoDocument, type TodoDocument, type TodoItem } from "./document";

type TodoFilter = "all" | "active" | "completed";

const filters: Array<{ value: TodoFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
];

export function TodoTool() {
  const repo = useRepo();
  const [url] = createSignal(ensureToolDocument(repo, "todo", initialTodoDocument));
  const [doc, handle] = useDocument<TodoDocument>(() => url());
  const [newTask, setNewTask] = createSignal("");
  const [filter, setFilter] = createSignal<TodoFilter>("all");
  const [copyStatus, setCopyStatus] = createSignal<string>();

  const items = createMemo(() => doc()?.items ?? []);
  const remainingCount = createMemo(() => items().filter((item) => !item.completed).length);
  const completedCount = createMemo(() => items().filter((item) => item.completed).length);
  const visibleItems = createMemo(() => {
    const currentFilter = filter();
    return items().filter((item) => {
      if (currentFilter === "active") {
        return !item.completed;
      }
      if (currentFilter === "completed") {
        return item.completed;
      }
      return true;
    });
  });

  const addTask = (event: SubmitEvent) => {
    event.preventDefault();
    const title = newTask().trim();
    if (!title) {
      return;
    }

    handle()?.change((draft) => {
      draft.items.push({
        id: crypto.randomUUID(),
        title,
        completed: false,
        createdAt: new Date().toISOString(),
      });
    });
    setNewTask("");
  };

  const toggleTask = (id: string) => {
    handle()?.change((draft) => {
      const item = draft.items.find((candidate) => candidate.id === id);
      if (item) {
        item.completed = !item.completed;
      }
    });
  };

  const deleteTask = (id: string) => {
    handle()?.change((draft) => {
      const index = draft.items.findIndex((item) => item.id === id);
      if (index >= 0) {
        draft.items.splice(index, 1);
      }
    });
  };

  const clearCompleted = () => {
    handle()?.change((draft) => {
      for (let index = draft.items.length - 1; index >= 0; index -= 1) {
        if (draft.items[index]?.completed) {
          draft.items.splice(index, 1);
        }
      }
    });
  };

  const shareLink = () => {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set("doc", url());
    return currentUrl.toString();
  };

  const copyLink = async () => {
    const link = shareLink();
    try {
      await navigator.clipboard.writeText(link);
      setCopyStatus("Share link copied to your clipboard.");
    } catch {
      setCopyStatus(`Copy this share link: ${link}`);
    }
  };

  return (
    <section class="card card-border w-full bg-base-100 shadow-sm">
      <div class="card-body gap-6 p-5 sm:p-8">
        <header class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div class="mb-2 flex items-center gap-2">
              <span class="status status-success" aria-hidden="true" />
              <span class="text-sm font-medium text-base-content/60">Local-first list</span>
            </div>
            <h1 class="card-title text-2xl sm:text-3xl">Your tasks</h1>
            <p class="mt-1 max-w-xl text-base-content/65">
              Capture what matters. Your list stays available offline and syncs when you reconnect.
            </p>
          </div>
          <button class="btn btn-ghost btn-sm shrink-0" type="button" onClick={copyLink}>
            <span aria-hidden="true">🔗</span>
            Copy share link
          </button>
        </header>

        <Show
          when={doc()}
          fallback={
            <div class="space-y-4" aria-busy="true" aria-label="Loading tasks">
              <div class="skeleton h-12 w-full" />
              <div class="space-y-3 rounded-box border border-base-300 p-4">
                <div class="skeleton h-6 w-3/4" />
                <div class="skeleton h-6 w-1/2" />
                <div class="skeleton h-6 w-2/3" />
              </div>
            </div>
          }
        >
          <form class="w-full" onSubmit={addTask}>
            <fieldset class="fieldset">
              <legend class="fieldset-legend text-base">Add a task</legend>
              <div class="join w-full">
                <input
                  class="input join-item min-w-0 flex-1"
                  type="text"
                  name="task"
                  value={newTask()}
                  onInput={(event) => setNewTask(event.currentTarget.value)}
                  placeholder="What needs to be done?"
                  aria-label="New task"
                />
                <button class="btn btn-primary join-item" type="submit">
                  Add task
                </button>
              </div>
            </fieldset>
          </form>

          <div class="flex flex-col gap-4 border-b border-base-300 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div
              role="tablist"
              class="tabs tabs-box w-fit gap-1 rounded-box bg-base-200 p-1"
              aria-label="Filter tasks"
            >
              <For each={filters}>
                {(option) => (
                  <button
                    role="tab"
                    class="tab rounded-box px-3 py-2"
                    class:tab-active={filter() === option.value}
                    class:bg-base-100={filter() === option.value}
                    class:shadow-sm={filter() === option.value}
                    type="button"
                    aria-selected={filter() === option.value}
                    onClick={() => setFilter(option.value)}
                  >
                    {option.label}
                  </button>
                )}
              </For>
            </div>
            <div class="flex flex-wrap items-center gap-2 text-sm text-base-content/70">
              <span class="badge badge-soft badge-info">{remainingCount()} remaining</span>
              <span class="badge badge-soft badge-success">{completedCount()} completed</span>
            </div>
          </div>

          <Show
            when={items().length > 0}
            fallback={
              <div role="alert" class="alert alert-info alert-soft">
                <span aria-hidden="true">✨</span>
                <div>
                  <h2 class="font-semibold">A clean slate</h2>
                  <p>Add your first task above to get started.</p>
                </div>
              </div>
            }
          >
            <Show
              when={visibleItems().length > 0}
              fallback={
                <div role="alert" class="alert alert-info alert-soft">
                  <span>No {filter()} tasks right now.</span>
                </div>
              }
            >
              <ul class="list gap-2" aria-label="Tasks">
                <For each={visibleItems()}>
                  {(item: TodoItem) => (
                    <li class="list-row items-center gap-3 rounded-box border border-base-300 bg-base-100 px-3 py-3 transition-colors hover:bg-base-200/60 sm:px-4">
                      <label class="flex min-w-0 flex-1 items-center gap-3">
                        <input
                          class="checkbox checkbox-primary"
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => toggleTask(item.id)}
                          aria-label={`${item.completed ? "Mark incomplete" : "Mark complete"}: ${item.title}`}
                        />
                        <span
                          class="min-w-0 truncate text-base"
                          classList={{
                            "text-base-content/45 line-through": item.completed,
                          }}
                        >
                          {item.title}
                        </span>
                      </label>
                      <button
                        class="btn btn-ghost btn-sm btn-square text-base-content/55 hover:text-error"
                        type="button"
                        onClick={() => deleteTask(item.id)}
                        aria-label={`Delete task: ${item.title}`}
                        title="Delete task"
                      >
                        <span aria-hidden="true">×</span>
                      </button>
                    </li>
                  )}
                </For>
              </ul>
            </Show>
          </Show>

          <footer class="flex flex-col gap-3 border-t border-base-300 pt-4 text-sm sm:flex-row sm:items-center sm:justify-between">
            <span class="text-base-content/60">
              {items().length === 0
                ? "No tasks yet"
                : `${items().length} ${items().length === 1 ? "task" : "tasks"} in this list`}
            </span>
            <button
              class="btn btn-ghost btn-sm self-start sm:self-auto"
              type="button"
              onClick={clearCompleted}
              disabled={completedCount() === 0}
            >
              Clear completed
            </button>
          </footer>

          <Show when={copyStatus()}>
            {(status) => (
              <div role="alert" class="alert alert-success alert-soft text-sm">
                <span>{status()}</span>
              </div>
            )}
          </Show>
        </Show>
      </div>
    </section>
  );
}
