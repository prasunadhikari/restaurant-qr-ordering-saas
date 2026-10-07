import mongoose, { Document, Schema } from "mongoose";

export interface IMenuCategory extends Document {
  restaurantId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const menuCategorySchema = new Schema<IMenuCategory>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

menuCategorySchema.index(
  { restaurantId: 1, name: 1 },
  { unique: true },
);

export default mongoose.model<IMenuCategory>(
  "MenuCategory",
  menuCategorySchema,
);
