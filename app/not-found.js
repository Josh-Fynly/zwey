import Button from "../components/ui/Button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zwey-bg px-6 text-zwey-text">
      <div className="w-full max-w-md text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zwey-violetBright">
          404
        </p>

        <h1 className="mt-4 text-2xl font-semibold">
          Page not found
        </h1>

        <p className="mt-3 text-sm leading-6 text-zwey-muted">
          The page you requested doesn't exist or may have moved.
        </p>

        <a href="/dashboard" className="mt-6 inline-block">
          <Button>Back to Zwey</Button>
        </a>
      </div>
    </main>
  );
}
