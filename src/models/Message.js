import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: { type: String, required: true },
    recipientId: { type: String, required: true },
    timestamp: { type: Date, required: true },
    message: { type: String, required: true },
    mid: { type: String, required: true, unique: true }, // Message ID, unique to prevent duplicates
  },
  { timestamps: true },
);

const Message =
  mongoose.models.Message || mongoose.model("Message", messageSchema);

export default Message;
