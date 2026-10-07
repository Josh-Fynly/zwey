import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-zwey-bg text-zwey-text">
      <header className="zwey-safe-x border-b border-zwey-border">
        <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between gap-4">
          <Link
            href="/"
            className="shrink-0 text-lg font-semibold tracking-tight text-zwey-text"
          >
            Zwey
          </Link>

          <nav className="flex min-w-0 items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="rounded-xl px-3 py-2 text-sm font-medium text-zwey-muted transition hover:bg-zwey-surface hover:text-zwey-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zwey-violetBright sm:px-4"
            >
              Sign in
            </Link>

            <Link
              href="/signup"
              className="rounded-xl bg-zwey-violet px-3 py-2 text-sm font-semibold text-white shadow-zwey-accent transition hover:bg-zwey-violetDeep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zwey-violetBright sm:px-4"
            >
              Create account
            </Link>
          </nav>
        </div>
      </header>

      <section className="zwey-safe-x">
        <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-6xl items-center py-16 sm:py-20 lg:py-24">
          <div className="w-full max-w-3xl">
            <div className="mb-6 inline-flex max-w-full items-center rounded-full border border-zwey-border bg-zwey-surface px-3 py-1.5 text-xs font-medium text-zwey-muted">
              <span className="zwey-break">
                A social hub for upcoming artists
              </span>
            </div>

            <h1 className="zwey-break max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-7xl">
              Make your music discoverable.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-zwey-muted sm:text-lg sm:leading-8">
              Build your artist identity, connect your music platforms,
              publish your work, discover other creators, and find
              opportunities to collaborate.
            </p>

            <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-zwey-violet px-6 py-3 text-sm font-semibold text-white shadow-zwey-accent transition hover:bg-zwey-violetDeep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zwey-violetBright sm:w-auto"
              >
                Create your artist profile
              </Link>

              <Link
                href="/login"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-zwey-border bg-zwey-surface px-6 py-3 text-sm font-semibold text-zwey-text transition hover:bg-zwey-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zwey-violetBright sm:w-auto"
              >
                Sign in
              </Link>
            </div>

            <div className="mt-12 grid w-full gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-zwey-border bg-zwey-surface p-4">
                <p className="text-sm font-semibold text-zwey-text">
                  Build your identity
                </p>
                <p className="mt-2 text-sm leading-6 text-zwey-muted">
                  Create a public artist profile that represents you.
                </p>
              </div>

              <div className="rounded-2xl border border-zwey-border bg-zwey-surface p-4">
                <p className="text-sm font-semibold text-zwey-text">
                  Share your music
                </p>
                <p className="mt-2 text-sm leading-6 text-zwey-muted">
                  Connect the platforms where people already find your work.
                </p>
              </div>

              <div className="rounded-2xl border border-zwey-border bg-zwey-surface p-4">
                <p className="text-sm font-semibold text-zwey-text">
                  Find your network
                </p>
                <p className="mt-2 text-sm leading-6 text-zwey-muted">
                  Discover artists, producers, fans, and potential
                  collaborators.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
                }
