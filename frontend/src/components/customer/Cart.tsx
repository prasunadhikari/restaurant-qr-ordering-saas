import { useState } from "react";
import { ArrowRight, Minus, Plus, ShoppingBag, X } from "lucide-react";
import type { MenuItem } from "../../types/menu";

export interface CartItem {
  lineId: string;
  item: MenuItem;
  quantity: number;
  note?: string;
}

interface CartProps {
  items: CartItem[];
  tableNumber: string;
  onIncrease: (lineId: string) => void;
  onDecrease: (lineId: string) => void;
  onRemove: (lineId: string) => void;
  onCheckout: () => void;
}

function Cart({
  items,
  tableNumber,
  onIncrease,
  onDecrease,
  onRemove,
  onCheckout,
}: CartProps) {
  const [isOpen, setIsOpen] = useState(false);
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce(
    (total, item) => total + item.item.price * item.quantity,
    0,
  );

  if (items.length === 0) return null;

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] sm:px-6">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="mx-auto flex min-h-[62px] w-full max-w-3xl items-center justify-between rounded-2xl bg-[#173b32] px-4 text-left text-white shadow-[0_12px_36px_rgba(23,59,50,0.32)] transition hover:bg-[#214d40] sm:px-6"
          aria-label={`View order, ${itemCount} items, NPR ${subtotal.toLocaleString()}`}
        >
          <span className="flex items-center gap-3">
            <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
              <ShoppingBag size={19} />
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e6c88f] px-1 text-[10px] font-bold text-[#263b30]">
                {itemCount}
              </span>
            </span>
            <span>
              <span className="block text-sm font-semibold">Your order</span>
              <span className="mt-0.5 block text-xs text-white/70">
                NPR {subtotal.toLocaleString()}
              </span>
            </span>
          </span>
          <span className="inline-flex items-center gap-2 text-sm font-semibold">
            View order <ArrowRight size={17} />
          </span>
        </button>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 backdrop-blur-[2px] sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
            className="flex max-h-[88dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl border border-white/70 bg-[#fffefa] shadow-2xl sm:rounded-3xl"
          >
            <div className="flex items-center justify-between border-b border-[#eee8dc] px-5 py-4 sm:px-6">
              <div>
                <h2 id="cart-title" className="font-serif text-xl font-semibold text-[#173b32]">
                  Your order
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {itemCount} {itemCount === 1 ? "item" : "items"} · Table {tableNumber}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f3f1eb] text-slate-600 transition hover:bg-[#e9e5db]"
                aria-label="Close cart"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto px-4 sm:px-6">
              {items.map((cartItem) => (
                <div
                  key={cartItem.lineId}
                  className="flex gap-3 border-b border-[#eee8dc] py-4 last:border-b-0"
                >
                  {cartItem.item.image && (
                    <img
                      src={cartItem.item.image}
                      alt={cartItem.item.name}
                      className="h-[72px] w-[72px] shrink-0 rounded-2xl object-cover"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate font-serif text-base font-semibold text-slate-900">
                          {cartItem.item.name}
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-500">
                          NPR {cartItem.item.price.toLocaleString()} each
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemove(cartItem.lineId)}
                        className="shrink-0 text-xs font-medium text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                    {cartItem.note && (
                      <p className="mt-1 text-xs text-slate-400">Note: {cartItem.note}</p>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2 rounded-xl border border-[#e9e4d9] bg-white p-1">
                        <button
                          type="button"
                          onClick={() => onDecrease(cartItem.lineId)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-700 hover:bg-[#f3f1eb]"
                          aria-label={`Decrease ${cartItem.item.name}`}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="min-w-5 text-center text-sm font-bold text-slate-900">
                          {cartItem.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onIncrease(cartItem.lineId)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-700 hover:bg-[#f3f1eb]"
                          aria-label={`Increase ${cartItem.item.name}`}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className="text-sm font-bold text-[#173b32]">
                        NPR {(cartItem.item.price * cartItem.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-[#eee8dc] bg-white px-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] pt-4 sm:px-6">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Subtotal</span>
                <span className="text-lg font-bold text-[#173b32]">
                  NPR {subtotal.toLocaleString()}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onCheckout();
                }}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#173b32] px-4 text-sm font-semibold text-white transition hover:bg-[#214d40]"
              >
                Review and checkout <ArrowRight size={17} />
              </button>
              <p className="mt-3 text-center text-[11px] text-slate-400">
                You can adjust quantities before placing your order.
              </p>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

export default Cart;
