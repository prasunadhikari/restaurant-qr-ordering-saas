function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
      <div className="text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.25em] text-emerald-400">
          Restaurant SaaS
        </p>

        <h1 className="text-4xl font-bold text-white sm:text-5xl">
          Restaurant QR Ordering
        </h1>

        <p className="mx-auto mt-4 max-w-xl text-slate-400">
          Digital menus, QR table ordering, live order management, and
          restaurant management in one platform.
        </p>
      </div>
    </div>
  );
}

export default HomePage;