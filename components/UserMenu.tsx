"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { UserAvatar } from "@/components/UserAvatar";
import { logoutAction } from "@/lib/actions/auth-actions";

type UserMenuProps = {
  user: {
    name?: string | null;
    email?: string | null;
  };
};

export function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const displayName = user.name || "User";
  const displayEmail = user.email || "";

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="User account menu"
        className="group flex items-center gap-2.5 rounded-full p-0.5 text-sm transition-all focus-visible:outline-2 focus-visible:outline-[var(--color-moss)]"
      >
        <UserAvatar
          name={user.name}
          email={user.email}
          size="md"
          className="ring-2 ring-transparent transition-all group-hover:ring-[var(--color-line)] group-hover:shadow-sm"
        />
        <span className="hidden text-sm font-medium text-[var(--color-ink)] sm:inline">
          {displayName}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`h-4 w-4 text-[var(--color-muted)] transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[var(--color-ink)]" : ""
          }`}
        >
          <path
            fillRule="evenodd"
            d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-64 origin-top-right rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-2 shadow-lg ring-1 ring-black/5 animate-in fade-in-0 zoom-in-95 duration-150"
        >
          {/* User info card */}
          <div className="flex items-center gap-3 rounded-lg bg-[var(--color-paper)] p-3">
            <UserAvatar name={user.name} email={user.email} size="md" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[var(--color-ink)]">{displayName}</p>
              {displayEmail && (
                <p className="truncate text-xs text-[var(--color-muted)]">{displayEmail}</p>
              )}
            </div>
          </div>

          <div className="my-1.5 border-t border-[var(--color-line)]" />

          {/* Quick links */}
          <div className="space-y-0.5">
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[var(--color-ink)] transition-colors hover:bg-[var(--color-paper)]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4 text-[var(--color-muted)]"
              >
                <path d="M2 4.75A2.75 2.75 0 0 1 4.75 2h10.5A2.75 2.75 0 0 1 18 4.75v10.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25V4.75Zm4.25-.75a.75.75 0 0 0 0 1.5h7.5a.75.75 0 0 0 0-1.5h-7.5Zm0 4a.75.75 0 0 0 0 1.5h7.5a.75.75 0 0 0 0-1.5h-7.5ZM5.5 12a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5A.75.75 0 0 1 5.5 12Z" />
              </svg>
              All notes
            </Link>

            <Link
              href="/notes/new"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[var(--color-ink)] transition-colors hover:bg-[var(--color-paper)]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4 text-[var(--color-muted)]"
              >
                <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
              </svg>
              New note
            </Link>
          </div>

          <div className="my-1.5 border-t border-[var(--color-line)]" />

          {/* Logout */}
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-[var(--color-alert)] transition-colors hover:bg-red-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path
                  fillRule="evenodd"
                  d="M3 4.25A2.25 2.25 0 0 1 5.25 2h5.5A2.25 2.25 0 0 1 13 4.25v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 0 0 .75-.75v-2a.75.75 0 0 1 1.5 0v2A2.25 2.25 0 0 1 10.75 18h-5.5A2.25 2.25 0 0 1 3 15.75V4.25Z"
                  clipRule="evenodd"
                />
                <path
                  fillRule="evenodd"
                  d="M19 10a.75.75 0 0 0-.75-.75H8.5a.75.75 0 0 0 0 1.5h9.75A.75.75 0 0 0 19 10Z"
                  clipRule="evenodd"
                />
                <path
                  fillRule="evenodd"
                  d="M15.28 6.22a.75.75 0 0 1 0 1.06L12.56 10l2.72 2.72a.75.75 0 1 1-1.06 1.06l-3.25-3.25a.75.75 0 0 1 0-1.06l3.25-3.25a.75.75 0 0 1 1.06 0Z"
                  clipRule="evenodd"
                />
              </svg>
              Log out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
