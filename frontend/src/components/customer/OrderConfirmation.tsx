import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Check,
  CircleCheck,
  CircleX,
  CreditCard,
  QrCode,
} from "lucide-react";
import type {
  CustomerOrder,
  CustomerPaymentMethod,
  PublicRestaurant,
} from "../../services/customerService";

interface OrderConfirmationProps {
  order: CustomerOrder;
  itemCount: number;
  paymentSettings: PublicRestaurant["paymentSettings"];
  paymentBusy: boolean;
  paymentError: string;
  onUpdatePayment: (
    method: CustomerPaymentMethod,
    action: "select" | "submit",
  ) => Promise<boolean>;
  onContinueBrowsing: () => void;
}

const orderStages = [
  { status: "pending", label: "Pending" },
  { status: "accepted", label: "Accepted" },
  { status: "preparing", label: "Preparing" },
  { status: "ready", label: "Ready" },
  { status: "served", label: "Served" },
] as const;

type PaymentScreen = "order" | "choose" | "online" | "cash" | "qr" | "submitted";

const methodLabel: Record<CustomerPaymentMethod, string> = {
  cash: "Cash",
  esewa: "eSewa",
  khalti: "Khalti",
  bank_qr: "Bank QR",
};

function OrderConfirmation({
  order,
  itemCount,
  paymentSettings,
  paymentBusy,
  paymentError,
  onUpdatePayment,
  onContinueBrowsing,
}: OrderConfirmationProps) {
  const [screen, setScreen] = useState<PaymentScreen>("order");
  const [selectedMethod, setSelectedMethod] =
    useState<CustomerPaymentMethod | null>(null);
  const [qrImageError, setQrImageError] = useState(false);
  const currentIndex = orderStages.findIndex(
    (stage) => stage.status === order.status.toLowerCase(),
  );
  const currentStage = orderStages[Math.max(0, currentIndex)];
  const isCancelled = order.status.toLowerCase() === "cancelled";
  const availableOnlineMethods: Array<{
    method: Exclude<CustomerPaymentMethod, "cash">;
    label: string;
  }> = [];
  if (paymentSettings.esewa) {
    availableOnlineMethods.push({ method: "esewa", label: "eSewa" });
  }
  if (paymentSettings.khalti) {
    availableOnlineMethods.push({ method: "khalti", label: "Khalti" });
  }
  if (paymentSettings.bank) {
    availableOnlineMethods.push({ method: "bank_qr", label: "Bank QR" });
  }
  const paymentStatus = order.paymentStatus ?? "unpaid";
  const selectedQr =
    selectedMethod === "esewa"
      ? paymentSettings.esewa
      : selectedMethod === "khalti"
        ? paymentSettings.khalti
        : selectedMethod === "bank_qr"
          ? paymentSettings.bank
          : null;
  const statusLabel =
    paymentStatus === "pending_verification"
      ? "Pending verification"
      : paymentStatus === "paid"
        ? "Paid"
        : paymentStatus === "rejected"
          ? "Payment needs attention"
          : paymentStatus === "pending"
            ? "Pending"
            : "Not selected";
  const canPay = paymentStatus !== "paid" && paymentStatus !== "pending_verification";

  const chooseMethod = async (method: CustomerPaymentMethod) => {
    const updated = await onUpdatePayment(method, "select");
    if (updated) {
      setSelectedMethod(method);
      setQrImageError(false);
      setScreen(method === "cash" ? "cash" : "qr");
    }
  };

  const submitPayment = async () => {
    if (!selectedMethod || selectedMethod === "cash") return;
    if (await onUpdatePayment(selectedMethod, "submit")) {
      setScreen("submitted");
    }
  };

  const goBack = () => {
    setScreen(
      screen === "online" || screen === "cash" || screen === "qr"
        ? "choose"
        : "order",
    );
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-confirmation-title"
        className="w-full max-w-md overflow-hidden rounded-3xl border border-white/50 bg-[#fffefa] shadow-2xl"
      >
        {(screen === "order" || isCancelled) && (
          <>
            <div className={`relative overflow-hidden px-6 pb-8 pt-9 text-center text-white ${isCancelled ? "bg-red-900" : "bg-[#173b32]"}`}>
              <div className="absolute -right-8 -top-10 h-40 w-40 rounded-full border border-white/10" />
              <div className="absolute -right-2 -top-4 h-28 w-28 rounded-full border border-white/10" />
              <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/10 text-2xl shadow-inner">
                {isCancelled ? <CircleX size={27} /> : "✓"}
              </div>
              <h1 id="order-confirmation-title" className="relative mt-4 font-serif text-3xl font-semibold">
              {isCancelled ? "Order cancelled" : "Order placed"}
              </h1>
              <p className="relative mt-2 text-sm text-white/75">
              {isCancelled
                ? "The restaurant could not proceed with this order."
                : `${order.restaurantName} · Table ${order.tableNumber}`}
              </p>
            </div>

            <div className="space-y-5 p-6">
              <div className="rounded-2xl border border-[#e9e4d9] bg-[#f8f6f0] p-4 text-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Order number
                </p>
                <p className="mt-1 font-serif text-2xl font-bold tracking-wide text-[#173b32]">
                  {order.orderNumber}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  {itemCount} {itemCount === 1 ? "item" : "items"} · NPR{" "}
                  {order.total.toLocaleString()}
                </p>
              </div>

              {isCancelled ? (
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm leading-6 text-red-900">
                  <p className="font-bold">This order has been cancelled by the restaurant.</p>
                  <p className="mt-1">{order.declineReason || "Please contact restaurant staff if you need more information."}</p>
                </div>
              ) : <div className="flex items-center justify-between gap-3 rounded-xl border border-[#e9e4d9] px-4 py-3">
                <div>
                  <p className="text-xs font-medium text-slate-500">Payment</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {order.paymentMethod
                      ? methodLabel[order.paymentMethod]
                      : "Choose how to pay"}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    paymentStatus === "paid"
                      ? "bg-emerald-50 text-emerald-800"
                      : paymentStatus === "pending_verification"
                        ? "bg-amber-50 text-amber-800"
                        : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {statusLabel}
                </span>
              </div>}

              {!isCancelled && paymentStatus === "pending_verification" && (
                <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm leading-5 text-amber-900">
                  Your payment is waiting for restaurant confirmation.
                </p>
              )}

              {!isCancelled && (
                <div id="order-progress">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-sm font-bold text-slate-900">Track your order</h2>
                    <span className="rounded-full bg-[#edf3ec] px-3 py-1 text-xs font-semibold capitalize text-[#315b40]">
                      {currentStage.label}
                    </span>
                  </div>
                  <ol className="mt-4 grid grid-cols-5 gap-1" aria-label="Order progress">
                    {orderStages.map((stage, index) => {
                      const complete = index < currentIndex;
                      const current = index === currentIndex;
                      return (
                        <li key={stage.status} className="text-center">
                          <div
                            className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                              complete || current
                                ? "bg-[#173b32] text-white shadow-sm shadow-[#173b32]/20"
                                : "bg-slate-100 text-slate-400"
                            }`}
                            aria-current={current ? "step" : undefined}
                          >
                            {complete ? <Check size={15} /> : index + 1}
                          </div>
                          <span
                            className={`mt-2 block text-[10px] leading-4 ${
                              complete || current ? "font-semibold text-slate-800" : "text-slate-400"
                            }`}
                          >
                            {stage.label}
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                  <p className="mt-3 text-center text-xs text-slate-500">
                    This page updates as the restaurant moves your order along.
                  </p>
                </div>
              )}

              {!isCancelled && paymentError && (
                <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  {paymentError}
                </p>
              )}

              {isCancelled ? (
                <button
                  type="button"
                  onClick={onContinueBrowsing}
                  className="w-full rounded-xl bg-[#173b32] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#245747]"
                >
                  Okay · Order again
                </button>
              ) : <div className="grid grid-cols-2 gap-3">
                {canPay ? (
                  <button
                    type="button"
                    onClick={() => setScreen("choose")}
                    className="rounded-xl bg-[#173b32] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#245747]"
                  >
                    Pay now
                  </button>
                ) : (
                  <span className="flex items-center justify-center rounded-xl bg-[#edf3ec] px-3 py-3.5 text-center text-xs font-semibold text-[#315b40]">
                    {paymentStatus === "paid" ? "Payment confirmed" : "Payment submitted"}
                  </span>
                )}
                <button
                  type="button"
                  onClick={onContinueBrowsing}
                  className="rounded-xl border border-[#e5dfd2] px-4 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-[#f8f6f0]"
                >
                  Continue browsing
                </button>
              </div>}
            </div>
          </>
        )}

        {screen !== "order" && !isCancelled && (
          <>
            <div className="flex items-center gap-3 border-b border-[#eee8dc] px-5 py-4">
              <button
                type="button"
                onClick={goBack}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f3f1eb] text-slate-600 hover:bg-[#e9e5db]"
                aria-label="Go back"
              >
                <ArrowLeft size={17} />
              </button>
              <div>
                <h1 id="order-confirmation-title" className="font-serif text-xl font-semibold text-[#173b32]">
                  {screen === "choose"
                    ? "Payment"
                    : screen === "online"
                      ? "Pay online"
                      : screen === "cash"
                        ? "Cash payment"
                        : screen === "submitted"
                          ? "Payment submitted"
                          : `Pay with ${selectedMethod ? methodLabel[selectedMethod] : ""}`}
                </h1>
                <p className="mt-0.5 text-xs text-slate-500">
                  Order #{order.orderNumber} · Table {order.tableNumber}
                </p>
              </div>
            </div>

            <div className="max-h-[75dvh] space-y-5 overflow-y-auto p-5 sm:p-6">
              <div className="rounded-2xl bg-[#f8f6f0] px-4 py-4 text-center">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                  Amount due
                </p>
                <p className="mt-1 font-serif text-3xl font-bold text-[#173b32]">
                  NPR {order.total.toLocaleString()}
                </p>
              </div>

              {screen === "choose" && (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-slate-800">Choose payment method</p>
                  {paymentSettings.cashEnabled && (
                    <button
                      type="button"
                      disabled={paymentBusy}
                      onClick={() => void chooseMethod("cash")}
                      className="flex min-h-14 w-full items-center gap-3 rounded-xl border border-[#e9e4d9] bg-white px-4 text-left font-semibold text-slate-800 transition hover:border-[#b28a50] hover:bg-[#fffdf8] disabled:opacity-60"
                    >
                      <Banknote size={19} className="text-[#173b32]" />
                      Cash at restaurant
                      <ArrowRight size={17} className="ml-auto text-slate-400" />
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={!availableOnlineMethods.length || paymentBusy}
                    onClick={() => setScreen("online")}
                    className="flex min-h-14 w-full items-center gap-3 rounded-xl border border-[#e9e4d9] bg-white px-4 text-left font-semibold text-slate-800 transition hover:border-[#b28a50] hover:bg-[#fffdf8] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <CreditCard size={19} className="text-[#173b32]" />
                    Online payment
                    <ArrowRight size={17} className="ml-auto text-slate-400" />
                  </button>
                  {!paymentSettings.cashEnabled && !availableOnlineMethods.length && (
                    <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
                      Please ask restaurant staff for payment instructions.
                    </p>
                  )}
                  {paymentError && (
                    <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                      {paymentError}
                    </p>
                  )}
                </div>
              )}

              {screen === "online" && (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-slate-800">Choose an available payment app</p>
                  {availableOnlineMethods.map((method) => (
                    <button
                      key={method.method}
                      type="button"
                      disabled={paymentBusy}
                      onClick={() => void chooseMethod(method.method)}
                      className="flex min-h-14 w-full items-center gap-3 rounded-xl border border-[#e9e4d9] bg-white px-4 text-left font-semibold text-slate-800 transition hover:border-[#b28a50] hover:bg-[#fffdf8] disabled:opacity-60"
                    >
                      <QrCode size={19} className="text-[#173b32]" />
                      {method.label}
                      <ArrowRight size={17} className="ml-auto text-slate-400" />
                    </button>
                  ))}
                  {paymentError && (
                    <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                      {paymentError}
                    </p>
                  )}
                </div>
              )}

              {screen === "cash" && (
                <div className="space-y-4 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#edf3ec] text-[#315b40]">
                    <Banknote size={25} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Please pay at the restaurant counter.</p>
                    <p className="mt-2 text-sm leading-5 text-slate-500">
                      Show this order screen to the counter staff if needed. Cash payment stays pending until restaurant staff confirms it.
                    </p>
                  </div>
                  <div className="rounded-xl border border-[#e9e4d9] px-4 py-3 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500">Method</span><span className="font-semibold">Cash</span></div>
                    <div className="mt-2 flex justify-between"><span className="text-slate-500">Status</span><span className="font-semibold text-amber-700">Pending</span></div>
                  </div>
                  <button
                    type="button"
                    onClick={onContinueBrowsing}
                    className="w-full rounded-xl bg-[#173b32] px-4 py-3.5 text-sm font-semibold text-white hover:bg-[#245747]"
                  >
                    Done · Continue browsing
                  </button>
                </div>
              )}

              {screen === "qr" && selectedMethod && selectedQr && (
                <div className="space-y-4 text-center">
                  {qrImageError ? (
                    <p role="alert" className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
                      This restaurant&apos;s QR image could not be loaded. Please ask staff for payment instructions.
                    </p>
                  ) : (
                    <div className="mx-auto flex h-56 w-56 items-center justify-center overflow-hidden rounded-2xl border border-[#e9e4d9] bg-white p-3 shadow-sm">
                      <img
                        src={selectedQr.qrImage}
                        alt={`${methodLabel[selectedMethod]} payment QR code`}
                        className="h-full w-full object-contain"
                        onError={() => setQrImageError(true)}
                      />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-slate-900">Open your payment app and scan this QR.</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Pay NPR {order.total.toLocaleString()} to the restaurant.
                    </p>
                  </div>
                  {selectedMethod === "bank_qr" && paymentSettings.bank && (
                    <div className="space-y-1 rounded-xl bg-[#f8f6f0] px-4 py-3 text-left text-sm">
                      {paymentSettings.bank.bankName && <p><span className="text-slate-500">Bank:</span> {paymentSettings.bank.bankName}</p>}
                      {paymentSettings.bank.accountName && <p><span className="text-slate-500">Account name:</span> {paymentSettings.bank.accountName}</p>}
                      {paymentSettings.bank.accountNumber && <p><span className="text-slate-500">Account number:</span> {paymentSettings.bank.accountNumber}</p>}
                    </div>
                  )}
                  {paymentError && (
                    <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                      {paymentError}
                    </p>
                  )}
                  <button
                    type="button"
                    disabled={paymentBusy || qrImageError}
                    onClick={() => void submitPayment()}
                    className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#173b32] px-4 py-3 text-sm font-semibold text-white hover:bg-[#245747] disabled:opacity-60"
                  >
                    <CircleCheck size={17} />
                    {paymentBusy ? "Submitting…" : "I've completed payment"}
                  </button>
                  <p className="text-xs leading-5 text-slate-400">
                    Your payment will remain pending until the restaurant verifies it.
                  </p>
                </div>
              )}

              {screen === "submitted" && (
                <div className="space-y-4 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-800">
                    <Check size={27} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Payment submitted</p>
                    <p className="mt-2 text-sm leading-5 text-slate-500">
                      Your payment is waiting for restaurant confirmation. It has not been marked as paid.
                    </p>
                  </div>
                  <div className="rounded-xl border border-[#e9e4d9] px-4 py-3 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500">Payment</span><span className="font-semibold">NPR {order.total.toLocaleString()}</span></div>
                    <div className="mt-2 flex justify-between"><span className="text-slate-500">Method</span><span className="font-semibold">{selectedMethod ? methodLabel[selectedMethod] : ""}</span></div>
                    <div className="mt-2 flex justify-between"><span className="text-slate-500">Status</span><span className="font-semibold text-amber-800">Pending verification</span></div>
                    <div className="mt-2 flex justify-between"><span className="text-slate-500">Order</span><span className="font-semibold">#{order.orderNumber}</span></div>
                  </div>
                  <button
                    type="button"
                    onClick={onContinueBrowsing}
                    className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#173b32] px-4 py-3 text-sm font-semibold text-white hover:bg-[#245747]"
                  >
                    Continue browsing <ArrowRight size={17} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setScreen("order")}
                    className="text-sm font-semibold text-[#315b40] hover:underline"
                  >
                    Track order
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default OrderConfirmation;
