import { RepoContext } from "@automerge/automerge-repo-solid-primitives";
import { Router } from "@solidjs/router";
import { render } from "solid-js/web";
import { expect, test } from "vitest";
import App from "../src/App";
import { repo } from "../src/repo";

test("lists tools and opens the Todo tool", async () => {
  localStorage.clear();
  window.history.replaceState({}, "", "/");

  const container = document.createElement("div");
  document.body.append(container);

  const dispose = render(
    () => (
      <RepoContext.Provider value={repo}>
        <Router>
          <App />
        </Router>
      </RepoContext.Provider>
    ),
    container,
  );

  try {
    await expect.poll(() => container.querySelector("h2")?.textContent).toBe("Your tools");
    const todoLink = container.querySelector('a[href="/todo"]');
    expect(todoLink?.textContent).toContain("Todo");
    (todoLink as HTMLAnchorElement).click();

    await expect.poll(() => window.location.pathname).toBe("/todo");
    await expect.poll(() => container.textContent).toContain("Your tasks");
    await expect.poll(() => container.textContent, { timeout: 10_000 }).toContain("Synced");
    expect(container.querySelector('input[aria-label="New task"]')).not.toBeNull();
  } finally {
    dispose();
    await repo.shutdown();
    container.remove();
    window.history.replaceState({}, "", "/");
    localStorage.clear();
  }
});
