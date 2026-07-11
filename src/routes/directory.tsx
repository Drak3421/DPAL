import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { AudioToggle } from "../components/AudioPlayer";

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

function Directory() {
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState(false);
  const [veilGone, setVeilGone] = useState(false);

  useEffect(() => {
    if (entered.value) {
      setAllowed(true);
      const t = setTimeout(() => setVeilGone(true), 950);
      return () => clearTimeout(t);
    }
    navigate({ to: "/", replace: true });
  }, [navigate]);

  if (!allowed) return null;

  return (
    <>
      <iframe
        src="/dpal/index.html"
        title="DPAL"
        className="dir-reveal"
        style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", border: 0 }}
      />
      {!veilGone && <div className="dir-veil" aria-hidden="true" />}
      <AudioToggle />
    </>
  );
}
