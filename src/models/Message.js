// models/Message.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: { type: String, required: true },
    recipientId: { type: String, required: true },
    timestamp: { type: Date, required: true },
    message: { type: String, required: true },
    mid: { type: String, required: true, unique: true }, // Message ID, unique to prevent duplicates
    eventType: { type: String, default: "message" }, // Store event type (e.g., "message", "comments")
    isEcho: { type: Boolean, default: false }, // Track if the message is an echo
  },
  { timestamps: true },
);

// Export the model, reusing it if already defined to avoid OverwriteModelError
const Message =
  mongoose.models.Message || mongoose.model("Message", messageSchema);

export default Message;
