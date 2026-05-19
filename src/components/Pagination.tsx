import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

export default function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  loading = false,
}: PaginationProps) {
  if (totalPages <= 0) return null;

  const from = Math.min((page - 1) * pageSize + 1, total);
  const to = Math.min(page * pageSize, total);

  // Build the page number window: always show first, last, current ±1, with ellipsis
  const getPages = (): (number | "...")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | "...")[] = [1];
    if (page > 3) pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
      {/* Info */}
      <p className="text-sm text-muted-foreground">
        {loading ? (
          <span className="inline-block w-32 h-4 rounded bg-muted animate-pulse" />
        ) : (
          <>
            Showing <span className="font-medium text-foreground">{from}–{to}</span> of{" "}
            <span className="font-medium text-foreground">{total}</span> results
          </>
        )}
      </p>

      {/* Controls */}
      <div className="flex items-center gap-1">
        {/* Prev */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1 || loading}
          aria-label="Previous page"
          className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-border bg-background
                     hover:bg-accent/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Prev
        </button>

        {/* Page numbers */}
        {getPages().map((p, i) =>
          p === "..." ? (
            <span
              key={`ellipsis-${i}`}
              className="px-2 py-1.5 text-sm text-muted-foreground select-none"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              disabled={loading}
              aria-label={`Page ${p}`}
              aria-current={p === page ? "page" : undefined}
              className={`min-w-[34px] px-2.5 py-1.5 text-sm rounded-lg border transition-colors
                ${
                  p === page
                    ? "bg-primary text-primary-foreground border-primary font-semibold"
                    : "border-border bg-background hover:bg-accent/50 text-foreground disabled:opacity-40"
                }`}
            >
              {p}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages || loading}
          aria-label="Next page"
          className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-border bg-background
                     hover:bg-accent/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
