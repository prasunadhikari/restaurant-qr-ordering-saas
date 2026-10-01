import { useMemo, useState } from "react";

import type { CartItem } from "./Cart";
import Button from "../ui/Button";
import Modal from "../ui/Modal";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  tableNumber: string;
  onPlaceOrder: (
    customerName: string,
    orderNote: string,
  ) => void;
}

function CheckoutModal({
  isOpen,
  onClose,
  items,
  tableNumber,
  onPlaceOrder,
}: CheckoutModalProps) {
  const [customerName, setCustomerName] = useState("");
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
    setCustomerName("");
    setOrderNote("");
    onClose();
  };

  const handlePlaceOrder = () => {
    onPlaceOrder(
      customerName.trim(),
      orderNote.trim(),
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Review your order"
      size="lg"
    >
      <div className="space-y-5">
        {/* Table information */}
        <div className="flex items-center justify-between gap-4 rounded-2xl bg-emerald-50 p-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">
              Dine-in order
            </p>

            <p className="mt-1 text-base font-bold text-slate-900">
              Table {tableNumber}
            </p>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
            🪑
          </div>
        </div>

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

          <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200">
            {items.map((cartItem) => (
              <div
                key={cartItem.item.id}
                className="flex gap-3 p-3"
              >
                <img
                  src={cartItem.item.image}
                  alt={cartItem.item.name}
                  className="h-16 w-16 shrink-0 rounded-xl object-cover"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="truncate text-sm font-semibold text-slate-900">
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

        {/* Customer details */}
        <div className="space-y-4">
          <div>
            <label
              htmlFor="customer-name"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Your name{" "}
              <span className="font-normal text-slate-400">
                (optional)
              </span>
            </label>

            <input
              id="customer-name"
              type="text"
              value={customerName}
              onChange={(event) =>
                setCustomerName(event.target.value)
              }
              placeholder="e.g. Prasun"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>

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
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>
        </div>

        {/* Total */}
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">
              Subtotal
            </span>

            <span className="text-sm font-semibold text-slate-900">
              NPR {subtotal.toLocaleString()}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
            <span className="text-base font-bold text-slate-900">
              Total
            </span>

            <span className="text-xl font-bold text-emerald-600">
              NPR {subtotal.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Place order */}
        <Button
          type="button"
          size="lg"
          fullWidth
          onClick={handlePlaceOrder}
        >
          Place order · NPR {subtotal.toLocaleString()}
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