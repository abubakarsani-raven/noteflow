import Link from "next/link";
import { UserMenu } from "@/components/UserMenu";

type NavbarProps = {
  user: {
    name?: string | null;
    email?: string | null;
  };
};

export function Navbar({ user }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-line)] bg-[var(--color-surface)]/90 backdrop-blur-xs">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3.5">
        <Link
          href="/dashboard"
          className="display flex items-center gap-2 text-xl font-medium tracking-tight text-[var(--color-ink)] transition-opacity hover:opacity-85"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-ink)] text-xs text-[var(--color-surface)]">
            N
          </span>
          NoteFlow
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/notes/new"
            className="hidden items-center gap-1.5 rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium text-[var(--color-ink)] shadow-2xs transition-all hover:bg-[var(--color-paper)] hover:border-[var(--color-muted)] sm:inline-flex"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-3.5 w-3.5 text-[var(--color-muted)]"
            >
              <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
            </svg>
            New note
          </Link>

          <UserMenu user={user} />
        </div>
      </div>
    </header>
  );
}
