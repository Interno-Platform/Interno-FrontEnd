import { Link, useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <main className="relative isolate mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-5xl items-center justify-center overflow-hidden px-6 py-16">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid-soft opacity-60" />
      <div className="pointer-events-none absolute -left-20 top-10 -z-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 right-0 -z-10 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl dark:bg-emerald-500/10" />

      <section className="relative w-full rounded-[2rem] border border-border/70 bg-card/90 p-8 shadow-xl backdrop-blur-md sm:p-12">
        <span className="float-slow pointer-events-none absolute -right-6 -top-8 hidden rounded-2xl border border-border/80 bg-card/95 px-4 py-2 text-sm font-semibold text-muted-foreground shadow-sm md:block">
          /unknown-route
        </span>

        <p className="soft-label text-primary">Error 404</p>

        <div className="mt-4 flex items-end gap-2">
          <span className="bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-6xl font-extrabold leading-none tracking-tight text-transparent sm:text-7xl">
            404
          </span>
          <span className="mb-2 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Not Found
          </span>
        </div>

        <h1 className="mt-6 max-w-2xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          This page is outside our map.
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          The link may be outdated, the address could be mistyped, or the page
          may have moved. Use one of the actions below to continue.
        </p>

        <div className="mt-9 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <Link
            className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90"
            to="/"
          >
            Go To Homepage
          </Link>

          <button
            className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-all duration-200 hover:-translate-y-0.5 hover:bg-muted"
            onClick={() => navigate(-1)}
            type="button"
          >
            Go Back
          </button>
        </div>
      </section>
    </main>
  );
};

export default NotFoundPage;
