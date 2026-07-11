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

  useEffect(() => {
    if (entered.value) {
      setAllowed(true);
    } else {
      navigate({ to: "/", replace: true });
    }
  }, [navigate]);

  if (!allowed) return null;

  return (
    <>
      <iframe
        src="/dpal/index.html"
        title="DPAL"
        className="dir-enter"
        style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", border: 0 }}
      />
      <div className="blackhole-stage-reverse" aria-hidden="true">
        <div className="blackhole-disk" />
        <div className="blackhole-core" />
      </div>
      <AudioToggle />
    </>
  );
}
