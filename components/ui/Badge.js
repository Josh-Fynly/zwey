const variants = {
  default:
    "border-zwey-border bg-zwey-surface text-zwey-muted",
  accent:
    "border-zwey-violet/30 bg-zwey-violet/10 text-zwey-violetBright",
  success:
    "border-zwey-success/30 bg-zwey-success/10 text-zwey-success",
  warning:
    "border-zwey-warning/30 bg-zwey-warning/10 text-zwey-warning",
  error:
    "border-zwey-error/30 bg-zwey-error/10 text-zwey-error",
};

export default function Badge({
  children,
  variant = "default",
  className = "",
}) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        variants[variant],
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}
