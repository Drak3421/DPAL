import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

// Shared flag used by the landing page to detect direct navigation
export const entered = { value: false };

export const Route = createFileRoute("/directory")({
  component: Directory,
  head: () => ({
    meta: [
      { title: "DPAL | Directory" },
      { name: "description", content: "DPAL - The ultimate piracy and media discovery app." },
    ],
  }),
});

// If a user hits /directory directly (no transition state), send them to the
// landing page — the persistent iframe lives there and drives the whole flow.
function Directory() {
  const navigate = useNavigate();
  useEffect(() => {
    if (!entered.value) navigate({ to: "/", replace: true });
  }, [navigate]);
  return null;
}
