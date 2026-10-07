import mongoose, { Document, Schema } from "mongoose";
import { randomUUID } from "node:crypto";

export type TableSessionStatus = "active" | "closed";

export interface ITableSession extends Document {
  restaurantId: mongoose.Types.ObjectId;
  tableId: mongoose.Types.ObjectId;
  tableNumber: string;
  sessionToken: string;
  status: TableSessionStatus;
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
