import { useState } from "react";
import { Minus, Plus, UtensilsCrossed } from "lucide-react";
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
      <div className="max-h-[calc(100dvh-10rem)] space-y-5 overflow-y-auto">
        <div className="overflow-hidden rounded-2xl bg-[#eee9de]">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="h-52 w-full object-cover sm:h-72"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="flex h-52 flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_top,#f9f5e9,#ece7dc)] text-sm text-slate-500 sm:h-72">
              <UtensilsCrossed size={30} strokeWidth={1.3} className="text-[#b28a50]" />
              <span>Dish photo coming soon</span>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-serif text-2xl font-semibold text-[#242a24]">
                {item.name}
              </h3>

              <p className="mt-1 text-lg font-bold text-[#173b32]">
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

          <p className="mt-3 text-sm leading-6 text-slate-600">
            {item.description || "Freshly prepared with care. Ask our team if you have any questions about this dish."}
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
            className="w-full resize-none rounded-xl border border-[#e5dfd2] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#9b7540] focus:ring-4 focus:ring-[#b28a50]/10"
          />
        </div>

        <div className="flex items-center justify-between gap-4 rounded-xl bg-[#f6f4ee] p-3">
          <span className="text-sm font-semibold text-slate-700">
            Quantity
          </span>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                setQuantity((current) => Math.max(1, current - 1))
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e5dfd2] bg-white text-slate-700 transition hover:border-[#b28a50]"
              aria-label="Decrease quantity"
            >
              <Minus size={16} />
            </button>

            <span className="min-w-6 text-center text-sm font-bold text-slate-900">
              {quantity}
            </span>

            <button
              type="button"
              onClick={() =>
                setQuantity((current) => current + 1)
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e5dfd2] bg-white text-slate-700 transition hover:border-[#b28a50]"
              aria-label="Increase quantity"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        <Button
          type="button"
          size="lg"
          fullWidth
          className="bg-[#173b32] shadow-md shadow-[#173b32]/15 hover:bg-[#214d40] active:bg-[#102d25]"
          onClick={handleAdd}
        >
          Add {quantity} · NPR {total.toLocaleString()}
        </Button>
      </div>
    </Modal>
  );
}

export default FoodDetailsModal;