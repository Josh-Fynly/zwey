"use client";

import { useId } from "react";

export default function Select({
  label,
  hint,
  error,
  id,
  children,
  className = "",
  ...props
}) {
  const generatedId = useId();
  const selectId = id || generatedId;
  const hintId = `${selectId}-hint`;
  const errorId = `${selectId}-error`;

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
          htmlFor={selectId}
          className="block text-sm font-medium text-zwey-text"
        >
          {label}
        </label>
      ) : null}

      <select
        id={selectId}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={[
          "min-h-11 w-full rounded-xl border bg-zwey-surface px-4 text-sm text-zwey-text",
          "outline-none transition",
          "focus:border-zwey-violet focus:ring-2 focus:ring-zwey-violet/20",
          error
            ? "border-zwey-error focus:border-zwey-error focus:ring-zwey-error/20"
            : "border-zwey-border",
          className,
        ].join(" ")}
        {...props}
      >
        {children}
      </select>

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
