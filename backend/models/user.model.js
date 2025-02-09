import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    id: {
      type: String,
      required: true,
      unique: true,
      minlength: 8,
    },
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      sparse: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    refreshToken: {
      type: String,
      default: null,
    },
    reset_passwd: {
      type: String,
      minlength: 6,
      default: null,
    },
    reset_passwd_exp: {
      type: Date,
      default: null,
    },
    role: {
      type: String,
      enum: ["student", "tutor"],
      required: true,
    },
    isAdmin: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date, default: null },
  },
  {
    timestamps: true,
  },
);

export const User = mongoose.model("User", userSchema);
