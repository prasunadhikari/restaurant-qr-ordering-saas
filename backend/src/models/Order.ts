import mongoose, { Document, Schema } from "mongoose";

export type OrderStatus = "New" | "Preparing" | "Ready" | "Served";

export interface IOrder extends Document {
  restaurantId: mongoose.Types.ObjectId;
  tableId: mongoose.Types.ObjectId;
  orderNumber: string;
  status: OrderStatus;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
  }>;
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
    status: {
      type: String,
      enum: ["New", "Preparing", "Ready", "Served"],
      default: "New",
      index: true,
    },
    items: [
      {
        _id: false,
        name: { type: String, required: true, trim: true },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true, min: 0 },
      },
    ],
    total: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);

orderSchema.index({ restaurantId: 1, createdAt: -1 });

export default mongoose.model<IOrder>("Order", orderSchema);
