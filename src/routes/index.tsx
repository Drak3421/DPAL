import { createFileRoute, redirect } from "@tanstack/react-router";
import { entered } from "./directory";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    entered.value = true;
    throw redirect({ to: "/directory" });
  },
  component: () => null,
});
