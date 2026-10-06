import Button from "./Button";

export default function EmptyState({
  title,
  message,
  actionLabel,
  onAction,
  className = "",
}) {
  return (
    <div
      className={[
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-zwey-border bg-zwey-surface px-6 py-12 text-center",
        className,
      ].join(" ")}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zwey-elevated text-lg text-zwey-violetBright">
        +
      </div>

      <h2 className="mt-4 text-base font-semibold text-zwey-text">
        {title}
      </h2>

      {message ? (
        <p className="mt-2 max-w-md text-sm leading-6 text-zwey-muted">
          {message}
        </p>
      ) : null}

      {actionLabel && onAction ? (
        <Button
          className="mt-5"
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
        }
