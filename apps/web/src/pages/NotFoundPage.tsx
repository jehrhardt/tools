import { A } from "@solidjs/router";
import { AppShell } from "../components/AppShell";

export function NotFoundMessage(props: { toolId?: string }) {
  return (
    <section class="mx-auto flex min-h-[60vh] w-full max-w-xl items-center justify-center px-4 py-12 sm:px-6">
      <div
        role="alert"
        class="alert alert-info alert-soft flex-col items-start gap-5 sm:flex-row sm:items-center"
      >
        <span class="text-3xl" aria-hidden="true">
          ✦
        </span>
        <div class="flex-1">
          <h1 class="text-xl font-bold">Tool not found</h1>
          <p class="mt-1 text-base-content/70">
            {props.toolId
              ? `There is no tool called “${props.toolId}”.`
              : "That page does not exist."}
          </p>
        </div>
        <A href="/" class="btn btn-sm">
          Back home
        </A>
      </div>
    </section>
  );
}

export default function NotFoundPage() {
  return (
    <AppShell>
      <NotFoundMessage />
    </AppShell>
  );
}
