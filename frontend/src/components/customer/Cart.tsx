import type { MenuItem } from "../../types/menu";
import Button from "../ui/Button";

export interface CartItem {
  item: MenuItem;
  quantity: number;
  note?: string;
}

interface CartProps {
  items: CartItem[];
  onIncrease: (itemId: string) => void;
  onDecrease: (itemId: string) => void;
  onRemove: (itemId: string) => void;
  onCheckout: () => void;
}

function Cart({
  items,
  onIncrease,
  onDecrease,
  onRemove,
  onCheckout,
}: CartProps) {
  const itemCount = items.reduce(
    (total, cartItem) => total + cartItem.quantity,
    0,
  );

  const subtotal = items.reduce(
    (total, cartItem) =>
      total + cartItem.item.price * cartItem.quantity,
    0,
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40">
      <div className="mx-auto max-w-4xl px-3 pb-3 sm:px-6">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between gap-4 p-3 sm:p-4">
            <div>
              <p className="text-sm font-bold text-slate-900">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </p>

              <p className="mt-0.5 text-xs text-slate-500">
                Subtotal · NPR {subtotal.toLocaleString()}
              </p>
            </div>

            <Button
              type="button"
              onClick={onCheckout}
              size="md"
            >
              View order
            </Button>
          </div>

          <div className="max-h-[55vh] overflow-y-auto border-t border-slate-100 px-3 py-2 sm:px-4">
            {items.map((cartItem) => (
              <div
                key={cartItem.item.id}
                className="flex gap-3 border-b border-slate-100 py-3 last:border-b-0"
              >
                <img
                  src={cartItem.item.image}
                  alt={cartItem.item.name}
                  className="h-16 w-16 shrink-0 rounded-xl object-cover"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="truncate text-sm font-semibold text-slate-900">
                        {cartItem.item.name}
                      </h4>

                      <p className="mt-0.5 text-xs text-slate-500">
                        NPR {cartItem.item.price.toLocaleString()} each
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemove(cartItem.item.id)}
                      className="shrink-0 text-xs font-medium text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>

                  {cartItem.note && (
                    <p className="mt-1 text-xs text-slate-400">
                      Note: {cartItem.note}
                    </p>
                  )}

                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onDecrease(cartItem.item.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-base font-semibold text-slate-700 hover:bg-slate-50"
                        aria-label={`Decrease ${cartItem.item.name}`}
                      >
                        −
                      </button>

                      <span className="min-w-5 text-center text-sm font-bold text-slate-900">
                        {cartItem.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() => onIncrease(cartItem.item.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-base font-semibold text-slate-700 hover:bg-slate-50"
                        aria-label={`Increase ${cartItem.item.name}`}
                      >
                        +
                      </button>
                    </div>

                    <span className="text-sm font-bold text-slate-900">
                      NPR{" "}
                      {(
                        cartItem.item.price * cartItem.quantity
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">
                Total
              </span>

              <span className="text-lg font-bold text-slate-900">
                NPR {subtotal.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;