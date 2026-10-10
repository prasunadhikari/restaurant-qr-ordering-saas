import mongoose, { Document, Schema } from "mongoose";

export type StaffCallStatus = "pending" | "attended";
export type StaffCallType = "assistance" | "bill";

export interface IStaffCallRequest extends Document {
  restaurantId: mongoose.Types.ObjectId;
  tableId: mongoose.Types.ObjectId;
  tableSessionId: mongoose.Types.ObjectId;
  type: StaffCallType;
  status: StaffCallStatus;
  attendedBy?: mongoose.Types.ObjectId;
  attendedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const staffCallRequestSchema = new Schema<IStaffCallRequest>(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: "Restaurant", required: true, index: true },
    tableId: { type: Schema.Types.ObjectId, ref: "RestaurantTable", required: true },
    tableSessionId: { type: Schema.Types.ObjectId, ref: "TableSession", required: true, index: true },
    type: { type: String, enum: ["assistance", "bill"], required: true },
    status: { type: String, enum: ["pending", "attended"], default: "pending", index: true },
    attendedBy: { type: Schema.Types.ObjectId, ref: "User" },
    attendedAt: { type: Date },
  },
  { timestamps: true },
);

staffCallRequestSchema.index({ tableSessionId: 1, type: 1, status: 1 });

export default mongoose.model<IStaffCallRequest>("StaffCallRequest", staffCallRequestSchema);
