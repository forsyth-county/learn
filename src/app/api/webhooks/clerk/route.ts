import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function POST(req: Request) {
  // Get the webhook secret from environment variables
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("Missing CLERK_WEBHOOK_SECRET environment variable");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: "Missing svix headers" },
      { status: 400 }
    );
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 }
    );
  }

  // Connect to database
  try {
    await connectToDatabase();
  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json(
      { error: "Database connection failed" },
      { status: 500 }
    );
  }

  // Handle the webhook event
  const eventType = evt.type;

  try {
    switch (eventType) {
      case "user.created": {
        const { id, email_addresses, first_name, last_name, image_url } = evt.data;
        const primaryEmail = email_addresses?.[0]?.email_address;

        if (!primaryEmail) {
          console.error("No email found for user:", id);
          return NextResponse.json(
            { error: "No email found" },
            { status: 400 }
          );
        }

        // Create user in MongoDB
        await User.create({
          clerkId: id,
          email: primaryEmail,
          firstName: first_name || undefined,
          lastName: last_name || undefined,
          imageUrl: image_url || undefined,
          role: "teacher",
          isApproved: true, // Auto-approve for now, can add domain check later
        });

        console.log(`User created: ${id}`);
        break;
      }

      case "user.updated": {
        const { id, email_addresses, first_name, last_name, image_url } = evt.data;
        const primaryEmail = email_addresses?.[0]?.email_address;

        // Update user in MongoDB
        await User.findOneAndUpdate(
          { clerkId: id },
          {
            email: primaryEmail,
            firstName: first_name || undefined,
            lastName: last_name || undefined,
            imageUrl: image_url || undefined,
          },
          { upsert: true, new: true }
        );

        console.log(`User updated: ${id}`);
        break;
      }

      case "user.deleted": {
        const { id } = evt.data;

        // Delete user from MongoDB (soft delete could be implemented)
        await User.findOneAndDelete({ clerkId: id });

        console.log(`User deleted: ${id}`);
        break;
      }

      default:
        console.log(`Unhandled webhook event: ${eventType}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}
