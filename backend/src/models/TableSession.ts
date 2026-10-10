import mongoose, { Document, Schema } from "mongoose";
import { randomUUID } from "node:crypto";

export type TableSessionStatus = "active" | "closed";
export type TableBillPaymentStatus =
  | "unpaid"
  | "pending"
  | "pending_verification"
  | "paid"
  | "rejected";

export interface ITableBillItem {
  name: string;
  quantity: number;
  unitPrice: number;
  specialInstructions: string;
  orderNumbers: string[];
}

export interface ITableBill {
  orderIds: mongoose.Types.ObjectId[];
  items: ITableBillItem[];
  total: number;
  paidAmount: number;
  paymentAmount: number;
  paymentMethod?: "cash" | "esewa" | "khalti" | "bank_qr";
  paymentStatus: TableBillPaymentStatus;
}

export interface ITableSession extends Document {
  restaurantId: mongoose.Types.ObjectId;
  tableId: mongoose.Types.ObjectId;
  tableNumber: string;
  sessionToken: string;
  status: TableSessionStatus;
  bill?: ITableBill;
  startedAt: Date;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const tableSessionSchema = new Schema<ITableSession>(
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
    tableNumber: { type: String, required: true, trim: true },
    sessionToken: {
      type: String,
      required: true,
      unique: true,
      default: () => randomUUID(),
    },
    status: {
      type: String,
      enum: ["active", "closed"],
      default: "active",
      index: true,
    },
    bill: {
      type: new Schema<ITableBill>(
        {
          orderIds: [{ type: Schema.Types.ObjectId, ref: "Order" }],
          items: [
            {
              _id: false,
              name: { type: String, required: true },
              quantity: { type: Number, required: true, min: 1 },
              unitPrice: { type: Number, required: true, min: 0 },
              specialInstructions: { type: String, default: "" },
              orderNumbers: [{ type: String }],
            },
          ],
          total: { type: Number, min: 0 },
          paidAmount: { type: Number, min: 0, default: 0 },
          paymentAmount: { type: Number, min: 0, default: 0 },
          paymentMethod: {
            type: String,
            enum: ["cash", "esewa", "khalti", "bank_qr"],
          },
          paymentStatus: {
            type: String,
            enum: ["unpaid", "pending", "pending_verification", "paid", "rejected"],
          },
        },
        { _id: false },
      ),
      default: undefined,
    },
    startedAt: { type: Date, default: Date.now, required: true },
    closedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

tableSessionSchema.index(
  { restaurantId: 1, tableId: 1 },
  { unique: true, partialFilterExpression: { status: "active" } },
);

export default mongoose.model<ITableSession>("TableSession", tableSessionSchema);
