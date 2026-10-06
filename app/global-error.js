"use client";

import { useEffect } from "react";

import ErrorState from "../components/ui/ErrorState";
import { logZweyError } from "../lib/errors";

export default function GlobalError({
  error,
  reset,
}) {
  useEffect(() => {
    logZweyError("global-runtime", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-zwey-bg text-zwey-text">
        <ErrorState
          title="Zwey needs a restart"
          message="We couldn't load Zwey correctly. Try again to continue."
          onAction={reset}
        />
      </body>
    </html>
  );
}
