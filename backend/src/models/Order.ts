import mongoose, { Document, Schema } from "mongoose";

export type OrderStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "ready"
  | "served"
  | "New"
  | "Preparing"
  | "Ready"
  | "Served"
  | "cancelled";

export type OrderPaymentMethod = "cash" | "esewa" | "khalti" | "bank_qr";
export type OrderPaymentStatus =
  | "unpaid"
  | "pending"
  | "pending_verification"
  | "paid"
  | "rejected";

export interface IOrder extends Document {
  restaurantId: mongoose.Types.ObjectId;
  tableId: mongoose.Types.ObjectId;
  orderNumber: string;
  trackingToken: string;
  status: OrderStatus;
  paymentMethod?: OrderPaymentMethod;
  paymentStatus: OrderPaymentStatus;
  declineReason?: string;
  items: Array<{
    menuItemId?: mongoose.Types.ObjectId;
    name: string;
    quantity: number;
    unitPrice: number;
    specialInstructions?: string;
  }>;
  specialInstructions?: string;
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    tableId: {
      type: Schema.Types.ObjectId,
      ref: "RestaurantTable",
      required: true,
      index: true,
    },
    orderNumber: { type: String, required: true, trim: true },
    trackingToken: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "preparing",
        "ready",
        "served",
        "New",
        "Preparing",
        "Ready",
        "Served",
        "cancelled",
      ],
      default: "pending",
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "esewa", "khalti", "bank_qr"],
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "pending", "pending_verification", "paid", "rejected"],
      default: "unpaid",
      index: true,
    },
    declineReason: { type: String, default: "", trim: true, maxlength: 500 },
    items: [
      {
        _id: false,
        menuItemId: { type: Schema.Types.ObjectId, ref: "MenuItem" },
        name: { type: String, required: true, trim: true },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true, min: 0 },
        specialInstructions: { type: String, default: "", trim: true },
      },
    ],
    specialInstructions: { type: String, default: "", trim: true },
    total: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);

orderSchema.index({ restaurantId: 1, createdAt: -1 });
orderSchema.index({ restaurantId: 1, orderNumber: 1 }, { unique: true });

export default mongoose.model<IOrder>("Order", orderSchema);
