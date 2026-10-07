import { useState } from "react";
import type { MenuItem } from "../../types/menu";
import Button from "../ui/Button";
import Modal from "../ui/Modal";

interface FoodDetailsModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: MenuItem, quantity: number, note: string) => void;
}

function FoodDetailsModal({
  item,
  isOpen,
  onClose,
  onAdd,
}: FoodDetailsModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");

  if (!item) {
    return null;
  }

  const total = item.price * quantity;

  const handleClose = () => {
    setQuantity(1);
    setNote("");
    onClose();
  };

  const handleAdd = () => {
    onAdd(item, quantity, note.trim());
    setQuantity(1);
    setNote("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
      title={item.name}
    >
      <div className="space-y-5">
        <div className="overflow-hidden rounded-2xl bg-slate-100">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="h-56 w-full object-cover sm:h-72"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="flex h-56 items-center justify-center text-sm text-slate-500 sm:h-72">
              Actual dish photo coming soon
            </div>
          )}
        </div>

        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                {item.name}
              </h3>

              <p className="mt-1 text-lg font-bold text-emerald-600">
                NPR {item.price.toLocaleString()}
              </p>
            </div>

            <div className="flex flex-wrap justify-end gap-1.5">
              {item.vegetarian && (
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  Veg
                </span>
              )}

              {item.spicy && (
                <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                  Spicy
                </span>
              )}

              {item.popular && (
                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                  Popular
                </span>
              )}
            </div>
          </div>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            {item.description}
          </p>
        </div>

        <div>
          <label
            htmlFor="special-note"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Special instructions
            <span className="ml-1 font-normal text-slate-400">
              (optional)
            </span>
          </label>

          <textarea
            id="special-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="e.g. Less spicy, no onions..."
            rows={3}
            className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          />
        </div>

        <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-3">
          <span className="text-sm font-semibold text-slate-700">
            Quantity
          </span>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                setQuantity((current) => Math.max(1, current - 1))
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-lg font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
              aria-label="Decrease quantity"
            >
              −
            </button>

            <span className="min-w-6 text-center text-sm font-bold text-slate-900">
              {quantity}
            </span>

            <button
              type="button"
              onClick={() =>
                setQuantity((current) => current + 1)
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-lg font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>

        <Button
          type="button"
          size="lg"
          fullWidth
          onClick={handleAdd}
        >
          Add {quantity} · NPR {total.toLocaleString()}
        </Button>
      </div>
    </Modal>
  );
}

export default FoodDetailsModal;