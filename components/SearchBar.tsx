"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState, useEffect } from "react";

// SRCH-001 — the query lives in the URL so results are shareable and refreshable.
export function SearchBar({ defaultValue = "" }: { defaultValue?: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  function onChange(val: string) {
    setValue(val);
    const next = new URLSearchParams(params.toString());
    if (val.trim()) next.set("q", val.trim());
    else next.delete("q");
    startTransition(() => router.replace(`/dashboard?${next.toString()}`));
  }

  function onClear() {
    onChange("");
  }

  return (
    <div className="relative">
      <label htmlFor="search" className="sr-only">
        Search your notes
      </label>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--color-muted)]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4"
        >
          <path
            fillRule="evenodd"
            d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      <input
        id="search"
        type="search"
        value={value}
        placeholder="Search titles, tags, and content…"
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] py-2.5 pl-10 pr-10 text-sm shadow-2xs transition-all focus:border-[var(--color-moss)] focus:shadow-xs"
      />

      {value ? (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--color-muted)] hover:text-[var(--color-ink)]"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-paper)] text-xs font-semibold">
            ×
          </span>
        </button>
      ) : (
        pending && (
          <span className="absolute right-3.5 top-2.5 text-xs text-[var(--color-muted)]">
            Searching…
          </span>
        )
      )}
    </div>
  );
}
