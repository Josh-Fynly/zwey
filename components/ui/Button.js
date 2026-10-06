"use client";

const variants = {
  primary:
    "bg-zwey-violet text-white hover:bg-zwey-violetBright focus-visible:ring-zwey-violet",
  secondary:
    "border border-zwey-border bg-zwey-surface text-zwey-text hover:bg-zwey-elevated focus-visible:ring-zwey-violet",
  ghost:
    "text-zwey-muted hover:bg-zwey-surface hover:text-zwey-text focus-visible:ring-zwey-violet",
  danger:
    "bg-zwey-error text-white hover:opacity-90 focus-visible:ring-zwey-error",
};

const sizes = {
  sm: "min-h-9 px-3 text-sm",
  md: "min-h-11 px-4 text-sm",
  lg: "min-h-12 px-5 text-base",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  type = "button",
  disabled = false,
  className = "",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-zwey-bg",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
      {...props}
    >
      {loading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span>Working...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
