import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: { type: String, required: true }, // Maps to payload.value.sender.id
    recipientId: { type: String, required: true }, // Maps to payload.value.recipient.id
    timestamp: { type: Date, required: true }, // Maps to payload.value.timestamp (converted to milliseconds)
    message: { type: String, required: true }, // Maps to payload.value.message.text
    mid: { type: String, required: true, unique: true }, // Maps to payload.value.message.mid
    eventType: { type: String, default: "message" }, // Maps to payload.field ("messages")
    isEcho: { type: Boolean, default: false }, // Not present in new payload, defaults to false
  },
  { timestamps: true },
);

// Export the model, reusing it if already defined to avoid OverwriteModelError
const Message =
  mongoose.models.Message || mongoose.model("Message", messageSchema);

export default Message;
