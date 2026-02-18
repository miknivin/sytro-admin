import { Types } from "mongoose";

export interface User {
  _id?: Types.ObjectId;
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  avatar?: {
    public_id?: string;
    url?: string;
  };
  role?: "user" | "admin"; // Add more roles if needed
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  signupMethod?: "OTP" | "Email/Password" | "OAuth";
  createdAt: Date;
  updatedAt?: Date;
}
