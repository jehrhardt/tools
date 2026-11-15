import { useEffect, useState } from "react";

type Info = {
  status: string;
};

type InfoState =
  | { kind: "loading" }
  | { kind: "loaded"; info: Info }
  | { kind: "error"; message: string };

function App() {
  const [state, setState] = useState<InfoState>({ kind: "loading" });

  useEffect(() => {
    const controller = new AbortController();

    fetch("/info", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        return response.json() as Promise<Info>;
      })
      .then((info) => setState({ kind: "loaded", info }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }
        setState({
          kind: "error",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      });

    return () => controller.abort();
  }, []);

  return (
    <main className="hero min-h-svh bg-base-200">
      <div className="hero-content w-full max-w-md">
        <section className="card w-full bg-base-100 shadow-xl">
          <div className="card-body items-center gap-4 text-center">
            <h1 className="card-title text-3xl">Hello, world!</h1>
            <p className="text-base-content/70">Status reported by the tools API:</p>
            {state.kind === "loading" && (
              <span className="loading loading-spinner loading-lg" aria-label="Loading status" />
            )}
            {state.kind === "loaded" && (
              <span className="badge badge-success badge-lg">{state.info.status}</span>
            )}
            {state.kind === "error" && (
              <div role="alert" className="alert alert-error alert-soft w-full">
                <span>{state.message}</span>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default App;
