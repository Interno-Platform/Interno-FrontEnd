const Pagination = ({ page, totalPages, setPage }) => (
  <div className="mt-4 flex items-center justify-end gap-2">
    <button
      className="rounded-xl border border-border bg-card px-3 py-1.5 text-sm font-medium transition-all duration-200 hover:bg-muted/60 disabled:opacity-40"
      onClick={() => setPage(page - 1)}
      disabled={page <= 1}
    >
      Prev
    </button>
    <span className="text-sm text-muted-foreground">
      {page} / {totalPages || 1}
    </span>
    <button
      className="rounded-xl border border-border bg-card px-3 py-1.5 text-sm font-medium transition-all duration-200 hover:bg-muted/60 disabled:opacity-40"
      onClick={() => setPage(page + 1)}
      disabled={page >= totalPages}
    >
      Next
    </button>
  </div>
);

export default Pagination;
