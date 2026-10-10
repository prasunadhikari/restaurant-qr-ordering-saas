import mongoose, { Document, Schema } from "mongoose";

export interface IRestaurant extends Document {
  name: string;
  slug: string;
  logo?: string;
  coverImage?: string;
  phone?: string;
  address?: string;
  restaurantType?: string;
  acceptingOrders: boolean;
  qrLocation?: {
    latitude: number;
    longitude: number;
  };
  paymentSettings: {
    cashEnabled: boolean;
    esewaEnabled: boolean;
    esewaQrImage: string;
    khaltiEnabled: boolean;
    khaltiQrImage: string;
    bankEnabled: boolean;
    bankQrImage: string;
    bankName: string;
    bankAccountName: string;
    bankAccountNumber: string;
  };

  openingHours?: {
    open: string;
    close: string;
  };

  status: "active" | "pending" | "suspended";
  plan: "starter" | "professional" | "custom";

  ownerId?: mongoose.Types.ObjectId | null;

  createdAt: Date;
  updatedAt: Date;
}

const restaurantSchema = new Schema<IRestaurant>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    logo: {
      type: String,
      default: "",
    },

    coverImage: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },

    restaurantType: {
      type: String,
      default: "",
      trim: true,
    },

    acceptingOrders: {
      type: Boolean,
      default: true,
    },

    qrLocation: {
      type: new Schema(
        {
          latitude: { type: Number, required: true, min: -90, max: 90 },
          longitude: { type: Number, required: true, min: -180, max: 180 },
        },
        { _id: false },
      ),
      default: undefined,
    },

    paymentSettings: {
      cashEnabled: { type: Boolean, default: true },
      esewaEnabled: { type: Boolean, default: false },
      esewaQrImage: { type: String, default: "" },
      khaltiEnabled: { type: Boolean, default: false },
      khaltiQrImage: { type: String, default: "" },
      bankEnabled: { type: Boolean, default: false },
      bankQrImage: { type: String, default: "" },
      bankName: { type: String, default: "", trim: true },
      bankAccountName: { type: String, default: "", trim: true },
      bankAccountNumber: { type: String, default: "", trim: true },
    },

    openingHours: {
      open: {
        type: String,
        default: "09:00",
      },

      close: {
        type: String,
        default: "22:00",
      },
    },

    status: {
      type: String,
      enum: ["active", "pending", "suspended"],
      default: "pending",
    },

    plan: {
      type: String,
      enum: ["starter", "professional", "custom"],
      default: "starter",
    },

    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const Restaurant = mongoose.model<IRestaurant>(
  "Restaurant",
  restaurantSchema,
);

export default Restaurant;