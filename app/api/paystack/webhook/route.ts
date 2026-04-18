import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("x-paystack-signature");
    const rawBody = await request.text();

    // Verify webhook signature
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) {
      console.error("Paystack secret key not configured");
      return NextResponse.json(
        { error: "Configuration error" },
        { status: 500 },
      );
    }

    const hash = crypto
      .createHmac("sha512", paystackSecret)
      .update(rawBody)
      .digest("hex");

    if (hash !== signature) {
      console.error("❌ Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    console.log("✅ Webhook signature verified");

    const event = JSON.parse(rawBody);

    // Only process successful charge events
    if (event.event !== "charge.success") {
      console.log("⏭️ Ignoring event:", event.event);
      return NextResponse.json({ status: "ok" });
    }

    const payment = event.data;

    // Verify payment status
    if (payment.status !== "success") {
      console.error("Payment not successful:", payment.status);
      return NextResponse.json({ status: "ok" });
    }

    // Extract metadata
    const { userId, tokens } = payment.metadata || {};

    if (!userId || !tokens) {
      console.error("Missing metadata:", payment.metadata);
      return NextResponse.json({ error: "Invalid metadata" }, { status: 400 });
    }

    console.log("📦 WEBHOOK: Processing payment");
    console.log("   Reference:", payment.reference);
    console.log("   User ID:", userId);
    console.log("   Tokens:", tokens);

    // Get Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Supabase configuration missing");
      return NextResponse.json(
        { error: "Configuration error" },
        { status: 500 },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    });

    // Call add_tokens RPC function
    console.log("💾 WEBHOOK: Calling add_tokens RPC with p_amount:", tokens);
    const { data, error } = await supabase.rpc("add_tokens", {
      p_user_id: userId,
      p_amount: tokens,
      p_reason: `Purchased via Paystack: ${payment.reference}`,
    });

    if (error) {
      console.error("❌ WEBHOOK: RPC error:", error);
      // Return 200 to acknowledge but log error
      return NextResponse.json({ status: "ok", error: error.message });
    }

    console.log("✅ WEBHOOK: Tokens added successfully!");
    console.log("RPC result:", data);

    return NextResponse.json({
      status: "ok",
      message: "Tokens added successfully",
      data: {
        reference: payment.reference,
        userId,
        tokens,
      },
    });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    // Return 200 to acknowledge receipt, 500 will cause retries
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 200 },
    );
  }
}
