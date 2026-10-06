const variants = {
  error: {
    wrapper:
      "border-zwey-error/30 bg-zwey-error/10 text-zwey-text",
    icon: "text-zwey-error",
  },
  warning: {
    wrapper:
      "border-zwey-warning/30 bg-zwey-warning/10 text-zwey-text",
    icon: "text-zwey-warning",
  },
  success: {
    wrapper:
      "border-zwey-success/30 bg-zwey-success/10 text-zwey-text",
    icon: "text-zwey-success",
  },
  info: {
    wrapper:
      "border-zwey-violet/30 bg-zwey-violet/10 text-zwey-text",
    icon: "text-zwey-violetBright",
  },
};

export default function Alert({
  title,
  children,
  variant = "info",
  className = "",
}) {
  const styles = variants[variant];

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={[
        "rounded-xl border p-4",
        styles.wrapper,
        className,
      ].join(" ")}
    >
      <div className="flex gap-3">
        <span
          aria-hidden="true"
          className={`mt-0.5 text-sm font-bold ${styles.icon}`}
        >
          •
        </span>

        <div className="min-w-0">
          {title ? (
            <p className="text-sm font-semibold">{title}</p>
          ) : null}

          {children ? (
            <div className="mt-1 text-sm text-zwey-muted">
              {children}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
