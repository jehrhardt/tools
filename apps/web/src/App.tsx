import type { AppType } from "@tools/api/rpc";
import { infoResponseSchema, type InfoResponse } from "@tools/shared";
import { hc } from "hono/client";
import { createSignal, onCleanup, onMount, Show } from "solid-js";

type InfoState =
  | { kind: "loading" }
  | { kind: "loaded"; info: InfoResponse }
  | { kind: "error"; message: string };

const client = hc<AppType>("/");

function App() {
  const [state, setState] = createSignal<InfoState>({ kind: "loading" });

  const loading = () => state().kind === "loading";
  const info = () => {
    const current = state();
    return current.kind === "loaded" ? current.info : undefined;
  };
  const errorMessage = () => {
    const current = state();
    return current.kind === "error" ? current.message : undefined;
  };

  onMount(() => {
    const controller = new AbortController();

    client.info
      .$get({}, { init: { signal: controller.signal } })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        return infoResponseSchema.parse(await response.json());
      })
      .then((loadedInfo) => setState({ kind: "loaded", info: loadedInfo }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }
        setState({
          kind: "error",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      });

    onCleanup(() => controller.abort());
  });

  return (
    <main class="hero min-h-svh bg-base-200">
      <div class="hero-content w-full max-w-md">
        <section class="card w-full bg-base-100 shadow-xl">
          <div class="card-body items-center gap-4 text-center">
            <h1 class="card-title text-3xl">Hello, world!</h1>
            <p class="text-base-content/70">Status reported by the tools API:</p>
            <Show when={loading()}>
              <span class="loading loading-spinner loading-lg" aria-label="Loading status" />
            </Show>
            <Show when={info()}>
              {(loadedInfo) => (
                <span class="badge badge-success badge-lg">{loadedInfo().status}</span>
              )}
            </Show>
            <Show when={errorMessage()}>
              {(message) => (
                <div role="alert" class="alert alert-error alert-soft w-full">
                  <span>{message()}</span>
                </div>
              )}
            </Show>
          </div>
        </section>
      </div>
    </main>
  );
}

export default App;
