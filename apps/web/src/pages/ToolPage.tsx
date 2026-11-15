import { A, useParams } from "@solidjs/router";
import { Dynamic } from "solid-js/web";
import { AppShell } from "../components/AppShell";
import { findTool } from "../tools";
import { NotFoundMessage } from "./NotFoundPage";

export default function ToolPage() {
  const params = useParams();
  const tool = () => findTool(params.toolId ?? "");

  return (
    <AppShell>
      <div class="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <A href="/" class="link link-hover inline-flex items-center gap-2 text-sm font-semibold">
          <span aria-hidden="true">←</span>
          All tools
        </A>

        <div class="mt-8">
          {tool() ? (
            <>
              <header class="mb-8 flex flex-col gap-4 border-b border-base-300 pb-8 sm:flex-row sm:items-center">
                <span class="grid size-16 shrink-0 place-items-center rounded-box bg-base-100 text-4xl shadow-sm ring-1 ring-base-300">
                  {tool()?.icon}
                </span>
                <div>
                  <h1 class="text-3xl font-black tracking-tight sm:text-4xl">{tool()?.name}</h1>
                  <p class="mt-2 text-base-content/65">{tool()?.description}</p>
                </div>
              </header>
              <Dynamic component={tool()?.component} />
            </>
          ) : (
            <NotFoundMessage toolId={params.toolId} />
          )}
        </div>
      </div>
    </AppShell>
  );
}
