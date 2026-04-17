import { Link } from "react-router-dom";

const NotFoundPage = () => (
  <main className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-4xl items-center justify-center px-6 py-16">
    <section className="w-full rounded-3xl border border-border/70 bg-card/90 p-8 text-center shadow-sm backdrop-blur-sm sm:p-12">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
        Error 404
      </p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
        Page Not Found
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
        The page you are looking for does not exist, has been moved, or the URL
        might be incorrect.
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary/90"
          to="/"
        >
          Back To Home
        </Link>
      </div>
    </section>
  </main>
);

export default NotFoundPage;
