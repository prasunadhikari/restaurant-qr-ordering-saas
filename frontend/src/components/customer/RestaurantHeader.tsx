interface RestaurantHeaderProps {
  restaurantName: string;
  location: string;
  type: string;
  tableNumber: string;
  isOpen: boolean;
  coverImage: string;
  logo?: string;
}

function RestaurantHeader({
  restaurantName,
  location,
  type,
  tableNumber,
  isOpen,
  coverImage,
  logo,
}: RestaurantHeaderProps) {
  return (
    <header className="bg-white">
      {/* Cover */}
      <div className="relative h-48 w-full overflow-hidden bg-[#213d32] sm:h-64">
        {coverImage && (
          <img
            src={coverImage}
            alt={`${restaurantName} dining`}
            className="h-full w-full object-cover"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

        <div className="absolute right-4 top-4">
          <span
            className={`rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm backdrop-blur ${
              isOpen
                ? "bg-emerald-500/90 text-white"
                : "bg-red-500/90 text-white"
            }`}
          >
            {isOpen ? "Open now" : "Closed"}
          </span>
        </div>
      </div>

      {/* Restaurant information */}
      <div className="relative mx-auto max-w-4xl px-4 pb-5 sm:px-6">
        <div className="-mt-10 flex items-end gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-slate-100 shadow-lg">
            {logo ? (
              <img
                src={logo}
                alt={`${restaurantName} logo`}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-emerald-600">
                {restaurantName.charAt(0)}
              </span>
            )}
          </div>
        </div>

        <div className="mt-3">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              {restaurantName}
            </h1>
          </div>

          {(type || location) && (
            <p className="mt-1 text-sm text-slate-500">
              {type}
              {type && location ? " · " : ""}
              {location}
            </p>
          )}

          <div className="mt-4 flex items-center gap-2">
            <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              Table {tableNumber}
            </span>

            <span className="text-xs text-slate-400">
              Scan. Order. Enjoy.
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default RestaurantHeader;