import { render } from "solid-js/web";
import { expect, test } from "vitest";
import App from "../src/App";

test("shows the status reported by the API", async () => {
  const container = document.createElement("div");
  document.body.append(container);

  const dispose = render(() => <App />, container);

  try {
    expect(container.querySelector("h1")?.textContent).toBe("Hello, world!");
    await expect
      .poll(() => container.querySelector(".badge")?.textContent, { timeout: 5_000 })
      .toBe("OK");
  } finally {
    dispose();
    container.remove();
  }
});
