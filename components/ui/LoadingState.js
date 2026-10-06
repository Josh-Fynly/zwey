export default function LoadingState({
  label = "Loading Zwey...",
  className = "",
}) {
  return (
    <div
      className={[
        "flex min-h-[40vh] flex-col items-center justify-center gap-4 px-6",
        className,
      ].join(" ")}
      role="status"
      aria-live="polite"
    >
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-zwey-border border-t-zwey-violet" />
      <p className="text-sm text-zwey-muted">{label}</p>
    </div>
  );
}
