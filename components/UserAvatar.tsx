type UserAvatarProps = {
  name?: string | null;
  email?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function UserAvatar({ name, email, size = "md", className = "" }: UserAvatarProps) {
  const displayName = name?.trim() || email?.split("@")[0] || "User";

  // Compute initials (up to 2 characters)
  const parts = displayName.split(/\s+/).filter(Boolean);
  let initials = "";
  if (parts.length >= 2) {
    initials = `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  } else if (displayName.length > 0) {
    initials = displayName.slice(0, 2).toUpperCase();
  } else {
    initials = "U";
  }

  const sizeClasses = {
    sm: "h-7 w-7 text-xs",
    md: "h-9 w-9 text-xs",
    lg: "h-12 w-12 text-sm",
  }[size];

  return (
    <div
      aria-hidden="true"
      className={`inline-flex shrink-0 select-none items-center justify-center rounded-full border border-[var(--color-line)] bg-gradient-to-br from-[var(--color-paper)] to-[var(--color-surface)] font-medium text-[var(--color-ink)] shadow-xs transition-transform ${sizeClasses} ${className}`}
    >
      <span>{initials}</span>
    </div>
  );
}
