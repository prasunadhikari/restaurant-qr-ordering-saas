import mongoose, { Document, Schema } from "mongoose";
import { randomUUID } from "node:crypto";

export interface IRestaurantTable extends Document {
  restaurantId: mongoose.Types.ObjectId;
  tableNumber: string;
  capacity: number;
  qrToken: string;
  status: "available" | "occupied";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const restaurantTableSchema = new Schema<IRestaurantTable>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    tableNumber: { type: String, required: true, trim: true },
    capacity: { type: Number, required: true, min: 1, default: 2 },
    qrToken: {
      type: String,
      required: true,
      unique: true,
      default: () => String(randomUUID()),
    },
    status: {
      type: String,
      enum: ["available", "occupied"],
      default: "available",
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

restaurantTableSchema.index(
  { restaurantId: 1, tableNumber: 1 },
  { unique: true },
);

export default mongoose.model<IRestaurantTable>(
  "RestaurantTable",
  restaurantTableSchema,
);
