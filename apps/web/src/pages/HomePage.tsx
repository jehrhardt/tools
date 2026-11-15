import { A } from "@solidjs/router";
import { For } from "solid-js";
import { AppShell } from "../components/AppShell";
import { tools } from "../tools";

export default function HomePage() {
  return (
    <AppShell>
      <div class="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <section class="hero overflow-hidden rounded-box border border-base-300 bg-base-100 shadow-sm">
          <div class="hero-content w-full items-start justify-between gap-8 py-12 sm:py-16">
            <div class="max-w-2xl">
              <p class="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                A small collection of useful things
              </p>
              <h1 class="text-4xl font-black tracking-tight sm:text-6xl">
                Make room for <span class="text-primary">what matters.</span>
              </h1>
              <p class="mt-5 max-w-xl text-lg leading-relaxed text-base-content/70">
                Tools is a calm, local-first workspace. Pick a tool, keep your data close, and let
                Automerge sync it when you are ready.
              </p>
            </div>
            <div class="hidden rounded-box bg-base-200 p-6 text-center sm:block" aria-hidden="true">
              <div class="text-5xl">✦</div>
              <div class="mt-3 text-sm font-medium text-base-content/60">Your workspace</div>
            </div>
          </div>
        </section>

        <section class="mt-12" aria-labelledby="tools-heading">
          <div class="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 id="tools-heading" class="text-2xl font-bold tracking-tight">
                Your tools
              </h2>
              <p class="mt-1 text-base-content/60">Simple spaces for everyday tasks.</p>
            </div>
            <span class="badge badge-ghost">{tools.length} available</span>
          </div>

          <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <For each={tools}>
              {(tool) => (
                <A
                  href={`/${tool.id}`}
                  class="card card-border bg-base-100 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
                >
                  <div class="card-body gap-5">
                    <div class="flex items-start justify-between gap-4">
                      <span class="grid size-12 place-items-center rounded-box bg-base-200 text-2xl">
                        {tool.icon}
                      </span>
                      <span class="text-xl text-base-content/40" aria-hidden="true">
                        →
                      </span>
                    </div>
                    <div>
                      <h3 class="card-title text-xl">{tool.name}</h3>
                      <p class="mt-2 leading-relaxed text-base-content/65">{tool.description}</p>
                    </div>
                    <div class="card-actions justify-start">
                      <span class="link link-hover text-sm font-semibold">Open tool</span>
                    </div>
                  </div>
                </A>
              )}
            </For>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
