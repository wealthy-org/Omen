export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-bg-main text-text-primary">
      <main className="w-full max-w-4xl p-8 rounded-2xl border border-border-subtle bg-card-surface shadow-sm text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-blue-soft text-primary-blue text-xs font-mono font-medium mb-6">
          OpenZeppelin Institutional Web3
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-accent-navy sm:text-5xl mb-4">
          Omen Prediction Market
        </h1>
        <p className="text-base text-text-muted max-w-xl mx-auto mb-8">
          Next.js and Tailwind CSS v4 configured with institutional theme tokens.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <div className="px-4 py-2 rounded-lg bg-primary-blue text-white font-medium hover:bg-primary-blue-hover transition-colors cursor-pointer">
            Explore Markets
          </div>
          <div className="px-4 py-2 rounded-lg border border-border-subtle text-text-primary font-medium hover:bg-bg-subtle transition-colors cursor-pointer">
            Connect Wallet
          </div>
        </div>
      </main>
    </div>
  );
}
