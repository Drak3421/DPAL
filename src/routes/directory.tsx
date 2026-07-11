import { createFileRoute, redirect } from "@tanstack/react-router";

export const entered = { value: true };

export const Route = createFileRoute("/directory")({
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
  component: () => null,
});
