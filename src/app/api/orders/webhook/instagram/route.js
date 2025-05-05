import { NextResponse } from "next/server";
import Message from "../../../../../models/Message";
import dbConnect from "@/lib/db/connection";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

    if (!VERIFY_TOKEN) {
      throw new Error("Please define the VERIFY_TOKEN environment variable");
    }

    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    // Handle webhook verification
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("Webhook verified successfully");
      return new NextResponse(challenge, { status: 200 });
    } else {
      console.log("Webhook verification failed");
      return NextResponse.json(
        { error: "Verification token mismatch" },
        { status: 403 },
      );
    }
  } catch (error) {
    console.error("Error processing GET request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    // Connect to MongoDB
    await dbConnect();

    const payload = await request.json();
    console.log("Raw payload:", JSON.stringify(payload, null, 2)); // Log full payload for debugging

    if (payload.object === "instagram") {
      for (const entry of payload.entry) {
        // Handle direct messages (messaging field)
        if (entry.messaging) {
          for (const messagingEvent of entry.messaging) {
            // Skip echo messages if desired (optional)
            if (messagingEvent.message?.is_echo) {
              console.log("Skipping echo message:", messagingEvent.message.mid);
              continue;
            }

            const messageData = {
              senderId: messagingEvent.sender.id,
              recipientId: messagingEvent.recipient.id,
              timestamp: new Date(parseInt(messagingEvent.timestamp)), // Timestamp in milliseconds
              message: messagingEvent.message.text || "No text content",
              mid: messagingEvent.message.mid,
              eventType: "message", // Add event type for clarity
            };

            // Log the message to console
            console.log("Received DM:", JSON.stringify(messageData, null, 2));

            // Save to MongoDB
            try {
              const existingMessage = await Message.findOne({
                mid: messageData.mid,
              });
              if (!existingMessage) {
                const newMessage = new Message(messageData);
                await newMessage.save();
                console.log("Message saved to MongoDB:", messageData.mid);
              } else {
                console.log("Duplicate message skipped:", messageData.mid);
              }
            } catch (dbError) {
              console.error("Error saving message to MongoDB:", dbError);
            }
          }
        }

        // Handle other events (changes field, e.g., comments, mentions)
        if (entry.changes) {
          for (const change of entry.changes) {
            const messageValue = change.value;

            // Skip if the change doesn't contain a message (e.g., not a comment or mention)
            if (!messageValue.message || !messageValue.message.text) {
              console.log("Skipping change event without message:", change);
              continue;
            }

            const messageData = {
              senderId: messageValue.sender?.id || "unknown", // Sender ID might not always be available
              recipientId: messageValue.recipient?.id || entry.id, // Use entry.id if recipient is not specified
              timestamp: new Date(parseInt(messageValue.timestamp) * 1000), // Timestamp in seconds, convert to milliseconds
              message: messageValue.message.text || "No text content",
              mid: messageValue.message.mid || `change_${Date.now()}`, // Generate a unique mid if not provided
              eventType: change.field || "unknown_event", // Store the type of event (e.g., "comments", "mentions")
            };

            // Log the event to console
            console.log(
              "Received Change Event:",
              JSON.stringify(messageData, null, 2),
            );

            // Save to MongoDB
            try {
              const existingMessage = await Message.findOne({
                mid: messageData.mid,
              });
              if (!existingMessage) {
                const newMessage = new Message(messageData);
                await newMessage.save();
                console.log("Change event saved to MongoDB:", messageData.mid);
              } else {
                console.log("Duplicate change event skipped:", messageData.mid);
              }
            } catch (dbError) {
              console.error("Error saving change event to MongoDB:", dbError);
            }
          }
        }
      }

      return NextResponse.json({ status: "success" }, { status: 200 });
    } else {
      console.log("Invalid payload");
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error processing POST request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
