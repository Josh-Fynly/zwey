export default function Avatar({
  src,
  name = "Artist",
  alt,
  size = "md",
  className = "",
}) {
  const sizes = {
    sm: "h-9 w-9 text-xs",
    md: "h-12 w-12 text-sm",
    lg: "h-20 w-20 text-xl",
    xl: "h-28 w-28 text-3xl",
  };

  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "Z";

  return (
    <div
      className={[
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-zwey-border bg-zwey-elevated font-semibold text-zwey-violetBright",
        sizes[size],
        className,
      ].join(" ")}
    >
      {src ? (
        <img
          src={src}
          alt={alt || `${name} profile image`}
          className="h-full w-full object-cover"
        />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
    </div>
  );
            }
