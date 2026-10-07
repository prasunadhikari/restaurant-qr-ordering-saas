import { MapPin, UtensilsCrossed } from "lucide-react";

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
    <header className="bg-[#f8f6f0]">
      <div className="relative h-56 w-full overflow-hidden bg-[#173b32] sm:h-72 lg:h-[340px]">
        {coverImage && (
          <img
            src={coverImage}
            alt={`${restaurantName} dining`}
            className="h-full w-full object-cover"
            fetchPriority="high"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#101d17]/90 via-[#101d17]/20 to-black/15" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/25 to-transparent" />
        <div className="absolute left-1/2 top-4 flex w-full max-w-6xl -translate-x-1/2 items-start justify-between px-4 sm:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/20 px-3 py-2 text-xs font-medium text-white shadow-sm backdrop-blur-md">
            <UtensilsCrossed size={14} />
            Aagan · Table {tableNumber}
          </span>
          <span
            className={`rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm backdrop-blur ${
              isOpen
                ? "border border-emerald-100/20 bg-emerald-700/80 text-white"
                : "border border-red-100/20 bg-red-700/80 text-white"
            }`}
          >
            {isOpen ? "Open now" : "Closed"}
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-4 pb-8 sm:px-8 sm:pb-10">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#e3c995]">
            {type || "Restaurant"}
          </p>
          <h1 className="max-w-3xl font-serif text-4xl font-semibold tracking-tight text-white drop-shadow sm:text-5xl lg:text-6xl">
            {restaurantName}
          </h1>
          {location && (
            <p className="mt-3 flex items-center gap-1.5 text-sm text-white/80">
              <MapPin size={15} />
              {location}
            </p>
          )}
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#e8e1d4] bg-white shadow-sm sm:h-16 sm:w-16">
            {logo ? (
              <img
                src={logo}
                alt={`${restaurantName} logo`}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="font-serif text-2xl font-semibold text-[#173b32]">
                {restaurantName.charAt(0)}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9b7540]">
              Welcome to your table
            </p>
            <p className="mt-1 truncate text-xs text-slate-500 sm:text-sm">
              {type || "Restaurant"}{location ? ` · ${location}` : ""}
            </p>
          </div>
        </div>
        <div className="hidden shrink-0 items-center gap-2 rounded-full border border-[#e5dfd2] bg-white px-4 py-2.5 text-xs font-semibold text-[#173b32] sm:flex">
          <span className={`h-2 w-2 rounded-full ${isOpen ? "bg-emerald-500" : "bg-amber-500"}`} />
          Table {tableNumber} · {isOpen ? "Ready to order" : "Browsing menu"}
        </div>
      </div>
    </header>
  );
}

export default RestaurantHeader;
