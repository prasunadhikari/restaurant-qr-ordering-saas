import mongoose, { Document, Schema } from "mongoose";

export interface IMenuItem extends Document {
  restaurantId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  price: number;
  image: string;
  available: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const menuItemSchema = new Schema<IMenuItem>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "MenuCategory",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, default: "", trim: true },
    available: { type: Boolean, default: true },
  },
  { timestamps: true },
);

menuItemSchema.index({ restaurantId: 1, categoryId: 1 });

export default mongoose.model<IMenuItem>("MenuItem", menuItemSchema);
