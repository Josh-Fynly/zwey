import Button from "./Button";

export default function ErrorState({
  title = "Something went wrong",
  message = "We couldn't complete that action. Please try again.",
  actionLabel = "Try again",
  onAction,
  className = "",
}) {
  return (
    <div
      className={[
        "flex min-h-[40vh] flex-col items-center justify-center px-6 text-center",
        className,
      ].join(" ")}
    >
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-zwey-error/30 bg-zwey-error/10 text-zwey-error">
        !
      </div>

      <h1 className="text-lg font-semibold text-zwey-text">
        {title}
      </h1>

      <p className="mt-2 max-w-md text-sm leading-6 text-zwey-muted">
        {message}
      </p>

      {onAction ? (
        <Button
          className="mt-6"
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
