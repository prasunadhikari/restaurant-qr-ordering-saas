import type { MenuItem } from "../../types/menu";
import { Plus, UtensilsCrossed } from "lucide-react";

interface MenuItemCardProps {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
}

function MenuItemCard({ item, onAdd }: MenuItemCardProps) {
  return (
    <article className="group flex overflow-hidden rounded-2xl border border-[#e9e4d9] bg-white shadow-[0_5px_18px_rgba(32,38,32,0.04)] transition duration-300 hover:-translate-y-0.5 hover:border-[#d8c9a8] hover:shadow-[0_14px_32px_rgba(32,38,32,0.1)]">
      <div className="relative aspect-square w-[122px] shrink-0 overflow-hidden bg-[#eee9de] sm:w-[148px]">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="relative z-10 h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(event) => {
              event.currentTarget.style.visibility = "hidden";
            }}
            onLoad={(event) => {
              event.currentTarget.style.visibility = "visible";
            }}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 bg-[radial-gradient(circle_at_top,#f9f5e9,#ece7dc)] px-3 text-center text-xs font-medium text-slate-500">
            <UtensilsCrossed size={20} strokeWidth={1.4} className="text-[#b28a50]" />
            <span>Photo coming soon</span>
          </div>
        )}

        <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
          {item.popular && (
            <span className="rounded-full bg-[#f6e9ca] px-2 py-1 text-[9px] font-bold text-[#795a20]">Popular</span>
          )}

          {item.vegetarian && (
            <span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-800">Veg</span>
          )}

          {item.spicy && (
            <span className="rounded-full bg-red-50 px-2 py-1 text-[9px] font-bold text-red-700">Spicy</span>
          )}
        </div>

        {!item.available && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/50 p-2">
            <span className="rounded-full bg-white px-3 py-2 text-center text-xs font-semibold text-slate-700">
              Currently unavailable
            </span>
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between p-3.5 sm:p-4">
        <div>
          <h3 className="font-serif text-base font-semibold leading-snug text-[#242a24] sm:text-lg">
            {item.name}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-xs leading-[1.45rem] text-slate-500 sm:text-sm">
            {item.description || "A guest favourite, freshly prepared to order."}
          </p>
        </div>
        <div className="mt-3 flex items-end justify-between gap-2">
          <span className="text-sm font-bold text-[#173b32] sm:text-base">
            NPR {item.price.toLocaleString()}
          </span>
          <button
            type="button"
            disabled={!item.available}
            onClick={() => onAdd(item)}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-[#dce5dc] bg-[#f3f6f1] px-3 text-xs font-bold text-[#173b32] transition hover:border-[#173b32] hover:bg-[#173b32] hover:text-white disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
            aria-label={item.available ? `Add ${item.name} to order` : `${item.name} unavailable`}
          >
            <Plus size={15} />
            {item.available ? "Add" : "Unavailable"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default MenuItemCard;