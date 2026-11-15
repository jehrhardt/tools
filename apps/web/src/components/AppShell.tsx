import { A } from "@solidjs/router";
import { useRepo } from "@automerge/automerge-repo-solid-primitives";
import { createSignal, onCleanup, onMount, type ParentProps } from "solid-js";

export function AppShell(props: ParentProps) {
  const repo = useRepo();
  const [peerCount, setPeerCount] = createSignal(repo.peers.length);

  onMount(() => {
    const updatePeerCount = () => setPeerCount(repo.peers.length);
    updatePeerCount();
    const interval = window.setInterval(updatePeerCount, 1_000);
    onCleanup(() => window.clearInterval(interval));
  });

  return (
    <div class="flex min-h-svh flex-col bg-base-200">
      <header class="navbar border-b border-base-300 bg-base-100 px-4 sm:px-6">
        <div class="navbar-start">
          <A href="/" class="flex items-center gap-3" aria-label="Tools home">
            <span class="grid size-10 place-items-center rounded-box bg-primary text-xl text-primary-content shadow-sm">
              ✦
            </span>
            <span class="text-lg font-bold tracking-tight">Tools</span>
          </A>
        </div>
        <div class="navbar-end gap-3">
          <output
            class="badge badge-soft gap-2"
            classList={{ "badge-success": peerCount() > 0, "badge-ghost": peerCount() === 0 }}
            aria-live="polite"
            aria-label={peerCount() > 0 ? "Connected to sync" : "Local only; sync unavailable"}
          >
            <span
              class="status status-xs"
              classList={{ "status-success": peerCount() > 0, "status-neutral": peerCount() === 0 }}
              aria-hidden="true"
            />
            {peerCount() > 0 ? "Synced" : "Local only"}
          </output>
          <label class="swap swap-rotate" title="Toggle dark theme">
            <input type="checkbox" value="dark" class="theme-controller" aria-label="Dark theme" />
            <span class="swap-off text-xl" aria-hidden="true">
              ☼
            </span>
            <span class="swap-on text-xl" aria-hidden="true">
              ☾
            </span>
          </label>
        </div>
      </header>

      <main class="flex-1">{props.children}</main>

      <footer class="footer footer-center border-t border-base-300 bg-base-100 p-6 text-base-content/60">
        <aside>
          <p>
            Built for focused work <span aria-hidden="true">·</span> local-first and ready to sync.
          </p>
        </aside>
      </footer>
    </div>
  );
}
