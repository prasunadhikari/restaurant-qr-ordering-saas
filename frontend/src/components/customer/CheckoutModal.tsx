import { useMemo, useState } from "react";

import type { CartItem } from "./Cart";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import type { CustomerFulfillmentType } from "../../services/customerService";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  tableNumber: string;
  restaurantOpen: boolean;
  fulfillmentType: CustomerFulfillmentType;
  onFulfillmentTypeChange: (type: CustomerFulfillmentType) => void;
  submitting: boolean;
  error: string;
  onPlaceOrder: (orderNote: string) => void;
}

function CheckoutModal({
  isOpen,
  onClose,
  items,
  tableNumber,
  restaurantOpen,
  fulfillmentType,
  onFulfillmentTypeChange,
  submitting,
  error,
  onPlaceOrder,
}: CheckoutModalProps) {
  const [orderNote, setOrderNote] = useState("");

  const itemCount = useMemo(
    () =>
      items.reduce(
        (total, cartItem) => total + cartItem.quantity,
        0,
      ),
    [items],
  );

  const subtotal = useMemo(
    () =>
      items.reduce(
        (total, cartItem) =>
          total + cartItem.item.price * cartItem.quantity,
        0,
      ),
    [items],
  );

  const handleClose = () => {
    if (submitting) return;
    setOrderNote("");
    onClose();
  };

  const handlePlaceOrder = () => {
    onPlaceOrder(orderNote.trim());
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Review your order"
      size="lg"
    >
      <div className="max-h-[calc(100dvh-9rem)] space-y-5 overflow-y-auto pr-1">
        {/* Table information */}
        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-slate-800">How would you like your order?</legend>
          <div className="grid grid-cols-2 gap-3">
            {([
              { type: "dine_in", title: "Dine in", description: `Enjoy at Table ${tableNumber}`, icon: "🪑" },
              { type: "takeaway", title: "Take away", description: "Pack to take with you", icon: "🥡" },
            ] as const).map((option) => (
              <label
                key={option.type}
                className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
                  fulfillmentType === option.type
                    ? "border-[#173b32] bg-[#f1f5ef] ring-2 ring-[#173b32]/10"
                    : "border-[#e9e4d9] bg-white hover:border-[#b6c8bb]"
                }`}
              >
                <input
                  type="radio"
                  name="fulfillment-type"
                  value={option.type}
                  checked={fulfillmentType === option.type}
                  onChange={() => onFulfillmentTypeChange(option.type)}
                  className="mt-1 accent-[#173b32]"
                />
                <span>
                  <span className="block text-lg" aria-hidden="true">{option.icon}</span>
                  <span className="mt-1 block text-sm font-bold text-[#173b32]">{option.title}</span>
                  <span className="mt-1 block text-xs leading-4 text-slate-500">{option.description}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Order items */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Your items
            </h3>

            <span className="text-xs text-slate-500">
              {itemCount}{" "}
              {itemCount === 1 ? "item" : "items"}
            </span>
          </div>

          <div className="divide-y divide-[#eee8dc] rounded-2xl border border-[#e9e4d9]">
            {items.map((cartItem) => (
              <div
                key={cartItem.lineId}
                className="flex gap-3 p-3"
              >
                {cartItem.item.image && (
                  <img
                    src={cartItem.item.image}
                    alt={cartItem.item.name}
                    className="h-16 w-16 shrink-0 rounded-xl object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="truncate font-serif text-sm font-semibold text-slate-900">
                        {cartItem.item.name}
                      </h4>

                      <p className="mt-1 text-xs text-slate-500">
                        NPR{" "}
                        {cartItem.item.price.toLocaleString()} ×{" "}
                        {cartItem.quantity}
                      </p>
                    </div>

                    <span className="shrink-0 text-sm font-bold text-slate-900">
                      NPR{" "}
                      {(
                        cartItem.item.price *
                        cartItem.quantity
                      ).toLocaleString()}
                    </span>
                  </div>

                  {cartItem.note && (
                    <p className="mt-2 text-xs text-slate-400">
                      Note: {cartItem.note}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="order-note"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Order note{" "}
              <span className="font-normal text-slate-400">
                (optional)
              </span>
            </label>

            <textarea
              id="order-note"
              value={orderNote}
              onChange={(event) =>
                setOrderNote(event.target.value)
              }
              placeholder="Anything the restaurant should know?"
              rows={3}
              className="w-full resize-none rounded-xl border border-[#e5dfd2] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#9b7540] focus:ring-4 focus:ring-[#b28a50]/10"
            />
          </div>
        </div>

        {/* Total */}
        <div className="rounded-2xl bg-[#f6f4ee] p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">
              Subtotal
            </span>

            <span className="text-sm font-semibold text-slate-900">
              NPR {subtotal.toLocaleString()}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-[#e5dfd2] pt-3">
            <span className="text-base font-bold text-slate-900">
              Total
            </span>

            <span className="text-xl font-bold text-[#173b32]">
              NPR {subtotal.toLocaleString()}
            </span>
          </div>
        </div>

        {!restaurantOpen && (
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            This restaurant is currently closed and cannot accept orders.
          </p>
        )}
        {error && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {/* Place order */}
        <Button
          type="button"
          size="lg"
          fullWidth
          className="bg-[#173b32] shadow-md shadow-[#173b32]/15 hover:bg-[#214d40] active:bg-[#102d25]"
          disabled={!restaurantOpen || submitting}
          onClick={handlePlaceOrder}
        >
          {submitting
            ? "Placing order…"
            : `Place order · NPR ${subtotal.toLocaleString()}`}
        </Button>

        <p className="text-center text-xs leading-5 text-slate-400">
          Your order will be sent to the restaurant for
          preparation.
        </p>
      </div>
    </Modal>
  );
}

export default CheckoutModal;