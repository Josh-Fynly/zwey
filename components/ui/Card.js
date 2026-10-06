export default function Card({
  children,
  className = "",
  interactive = false,
  ...props
}) {
  return (
    <div
      className={[
        "rounded-2xl border border-zwey-border bg-zwey-surface",
        interactive
          ? "transition hover:border-zwey-violet/40 hover:bg-zwey-elevated"
          : "",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
