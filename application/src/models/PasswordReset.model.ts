import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPasswordReset extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  expiresAt: Date;
  used: boolean;
}

const PasswordResetSchema = new Schema<IPasswordReset>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  token: { type: String, required: true, unique: true, index: true },
  expiresAt: { type: Date, required: true, index: true },
  used: { type: Boolean, default: false },
});

const PasswordReset: Model<IPasswordReset> =
  mongoose.models.PasswordReset || mongoose.model("PasswordReset", PasswordResetSchema);

export default PasswordReset;
