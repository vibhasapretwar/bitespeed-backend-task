import mongoose, { Document, Schema } from "mongoose";

export interface IContact extends Document {
  id: number;
  phoneNumber?: string;
  email?: string;
  linkedId?: number;
  linkPrecedence: "primary" | "secondary";
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

const ContactSchema: Schema<IContact> = new Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    phoneNumber: {
      type: String,
    },
    email: {
      type: String,
    },
    linkedId: {
      type: Number,
    },
    linkPrecedence: {
      type: String,
      enum: ["primary", "secondary"],
      required: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

ContactSchema.index({ email: 1 });
ContactSchema.index({ phoneNumber: 1 });
ContactSchema.index({ linkedId: 1 });

const Contact = mongoose.model<IContact>("Contact", ContactSchema);

export default Contact;