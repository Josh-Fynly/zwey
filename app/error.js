"use client";

import { useEffect } from "react";

import ErrorState from "../components/ui/ErrorState";
import { logZweyError } from "../lib/errors";

export default function Error({
  error,
  reset,
}) {
  useEffect(() => {
    logZweyError("runtime", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-zwey-bg text-zwey-text">
      <ErrorState
        title="Zwey hit an unexpected problem"
        message="Something went wrong while loading this part of Zwey. You can try again."
        onAction={reset}
      />
    </main>
  );
}
