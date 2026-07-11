import { createFileRoute, redirect } from "@tanstack/react-router";

// The TanStack Router file-based plugin expects only `Route` to be exported
// from a route file. A stray module-level export like `entered` triggers
// plugin warnings and is dead code — the redirect below fires before any
// consumer could read it. Removed.
export const Route = createFileRoute("/directory")({
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
  component: () => null,
});
