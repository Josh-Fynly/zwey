"use client";

import { useId } from "react";

export default function Input({
  label,
  hint,
  error,
  id,
  className = "",
  ...props
}) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;

  const describedBy = [
    error ? errorId : null,
    hint ? hintId : null,
  ]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <div className="space-y-2">
      {label ? (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-zwey-text"
        >
          {label}
        </label>
      ) : null}

      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={[
          "min-h-11 w-full rounded-xl border bg-zwey-surface px-4 text-sm text-zwey-text",
          "outline-none transition placeholder:text-zwey-muted",
          "focus:border-zwey-violet focus:ring-2 focus:ring-zwey-violet/20",
          error
            ? "border-zwey-error focus:border-zwey-error focus:ring-zwey-error/20"
            : "border-zwey-border",
          className,
        ].join(" ")}
        {...props}
      />

      {error ? (
        <p
          id={errorId}
          role="alert"
          className="text-sm text-zwey-error"
        >
          {error}
        </p>
      ) : null}

      {!error && hint ? (
        <p id={hintId} className="text-xs text-zwey-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
