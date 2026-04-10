import { Webhook } from "svix";
import { db } from "@/lib/prisma";
import { headers } from "next/headers";

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

const PLAN_CREDITS = {
  free_user: 0,
  standard: 10,
  premium: 24,
};

export async function POST(req) {
  // Get svix headers
  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  // Validate headers
  if (!svixId || !svixTimestamp || !svixSignature) {
    console.error("Missing svix headers");
    return new Response("Missing svix headers", { status: 400 });
  }

  // Validate webhook secret
  if (!webhookSecret) {
    console.error("Missing CLERK_WEBHOOK_SECRET");
    return new Response("Missing webhook secret", { status: 500 });
  }

  // Get raw body
  const body = await req.text();

  // Verify webhook signature
  const wh = new Webhook(webhookSecret);
  let evt;
  try {
    evt = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return new Response("Webhook verification failed", { status: 400 });
  }

  // Log event for debugging
  console.log("📨 Webhook event type:", evt.type);
  console.log("📦 Webhook data:", JSON.stringify(evt.data, null, 2));

  // ─── Handle user.created ───────────────────────────────────────────
  if (evt.type === "user.created") {
    const {
      id: clerkUserId,
      email_addresses,
      first_name,
      last_name,
      image_url,
    } = evt.data;

    const email = email_addresses?.[0]?.email_address;
    const name = [first_name, last_name].filter(Boolean).join(" ") || null;

    try {
      // Check if user already exists
      const existingUser = await db.user.findUnique({
        where: { clerkUserId },
      });

      if (!existingUser) {
        await db.user.create({
          data: {
            clerkUserId,
            email,
            name,
            imageUrl: image_url || null,
            role: "UNASSIGNED",
            credits: 2, // Default 2 free credits
          },
        });
        console.log(`✅ Created new user: ${clerkUserId}`);
      }

      return new Response("User created", { status: 200 });
    } catch (error) {
      console.error("Error creating user:", error);
      return new Response("Error creating user", { status: 500 });
    }
  }

  // ─── Handle user.updated ───────────────────────────────────────────
  if (evt.type === "user.updated") {
    const {
      id: clerkUserId,
      email_addresses,
      first_name,
      last_name,
      image_url,
      public_metadata,
    } = evt.data;

    const email = email_addresses?.[0]?.email_address;
    const name = [first_name, last_name].filter(Boolean).join(" ") || null;

    console.log("🔍 public_metadata:", public_metadata);

    try {
      // Find user in DB
      const user = await db.user.findUnique({
        where: { clerkUserId },
      });

      if (!user) {
        console.error("User not found:", clerkUserId);
        return new Response("User not found", { status: 404 });
      }

      // Update basic user info
      await db.user.update({
        where: { clerkUserId },
        data: {
          email,
          name,
          imageUrl: image_url || null,
        },
      });

      // Check if plan exists in public_metadata
      const plan = public_metadata?.plan;
      console.log("📋 Plan from metadata:", plan);

      if (plan && plan in PLAN_CREDITS) {
        const creditsToAdd = PLAN_CREDITS[plan];

        if (creditsToAdd > 0) {
          // Check if credits already allocated this month for this plan
          const startOfMonth = new Date();
          startOfMonth.setDate(1);
          startOfMonth.setHours(0, 0, 0, 0);

          const existingTransaction = await db.creditTransaction.findFirst({
            where: {
              userId: user.id,
              packageId: plan,
              type: "CREDIT_PURCHASE",
              createdAt: { gte: startOfMonth },
            },
          });

          if (existingTransaction) {
            console.log("⚠️ Credits already allocated this month for plan:", plan);
            return new Response("Credits already allocated", { status: 200 });
          }

          // Allocate credits
          await db.$transaction(async (tx) => {
            await tx.creditTransaction.create({
              data: {
                userId: user.id,
                amount: creditsToAdd,
                type: "CREDIT_PURCHASE",
                packageId: plan,
              },
            });

            await tx.user.update({
              where: { id: user.id },
              data: { credits: { increment: creditsToAdd } },
            });
          });

          console.log(`✅ Added ${creditsToAdd} credits to user ${user.id} for plan: ${plan}`);
        }
      }

      return new Response("User updated", { status: 200 });
    } catch (error) {
      console.error("Error processing user.updated:", error);
      return new Response("Error processing webhook", { status: 500 });
    }
  }

  // ─── Handle user.deleted ───────────────────────────────────────────
  if (evt.type === "user.deleted") {
    const { id: clerkUserId } = evt.data;

    try {
      const user = await db.user.findUnique({
        where: { clerkUserId },
      });

      if (user) {
        await db.user.delete({
          where: { clerkUserId },
        });
        console.log(`✅ Deleted user: ${clerkUserId}`);
      }

      return new Response("User deleted", { status: 200 });
    } catch (error) {
      console.error("Error deleting user:", error);
      return new Response("Error processing webhook", { status: 500 });
    }
  }

  console.log("⚠️ Unhandled event type:", evt.type);
  return new Response("Event not handled", { status: 200 });
}