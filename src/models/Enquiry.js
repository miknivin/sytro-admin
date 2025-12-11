// src/models/Enquiry.js
import mongoose from "mongoose";

const enquirySchema = new mongoose.Schema({
 name: {
      type: String,
      required: [false, "Please enter your name"],
      maxlength: [50, "Your name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      unique: true,
      sparse: true, // Allows the unique constraint to be ignored if the value is null or undefined
      validate: {
        validator: function (value) {
          return !this.phone || !!value; // Only validate email if phone is not provided
        },
        message: "Email or phone is required",
      },
    },
    phone: {
      type: String,
      unique: true,
      sparse: true, // Allows the unique constraint to be ignored if the value is null or undefined
      validate: {
        validator: function (value) {
          return !this.email || !!value; // Only validate phone if email is not provided
        },
        message: "Email or phone is required",
      },
    },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Enquiry= mongoose.models.Enquiry || mongoose.model("Enquiry", enquirySchema);

export default Enquiry;