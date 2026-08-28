export default function ShopLoading() {
  return (
    <section className="section-y-sm">
      <div className="shell">
        <div className="mx-auto mb-10 max-w-xl text-center">
          <div className="skeleton mx-auto mb-3 h-4 w-32" />
          <div className="skeleton mx-auto mb-3 h-10 w-64" />
          <div className="skeleton mx-auto h-4 w-80 max-w-full" />
        </div>

        <div className="skeleton mb-8 h-44 rounded-[26px]" />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-[26px] bg-white shadow-[var(--shadow-soft)]">
              <div className="skeleton aspect-[4/5] rounded-none" />
              <div className="space-y-3 p-5">
                <div className="skeleton h-5 w-2/3" />
                <div className="skeleton h-4 w-1/2" />
                <div className="skeleton h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
