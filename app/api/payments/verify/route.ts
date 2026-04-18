import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.redirect(
        new URL("/dashboard?payment=failed&reason=no_reference", request.url),
      );
    }

    const paystackApiKey = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackApiKey) {
      console.error("Paystack API key not configured");
      return NextResponse.redirect(
        new URL("/dashboard?payment=failed&reason=config_error", request.url),
      );
    }

    // 1. Verify payment with Paystack
    console.log("🔍 Verifying payment with Paystack:", reference);
    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${paystackApiKey}`,
        },
      },
    );

    const verifyData = await verifyResponse.json();

    if (!verifyResponse.ok) {
      console.error("Paystack verification error:", verifyData);
      return NextResponse.redirect(
        new URL("/dashboard?payment=failed&reason=paystack_error", request.url),
      );
    }

    // Check if payment was successful
    if (verifyData.data.status !== "success") {
      console.error("Payment not successful:", verifyData.data.status);
      return NextResponse.redirect(
        new URL(
          "/dashboard?payment=failed&reason=payment_not_success",
          request.url,
        ),
      );
    }

    // Extract metadata
    const { userId, tokens } = verifyData.data.metadata || {};
    if (!userId || !tokens) {
      console.error("Invalid metadata in payment:", verifyData.data.metadata);
      return NextResponse.redirect(
        new URL(
          "/dashboard?payment=failed&reason=invalid_metadata",
          request.url,
        ),
      );
    }

    console.log("🔐 VERIFY: Payment verified with Paystack");
    console.log("   User ID:", userId);
    console.log("   Tokens from metadata:", tokens, typeof tokens);
    console.log("   Reference:", reference);

    // 2. Use Supabase client to call add_tokens RPC function
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Supabase configuration missing");
      return NextResponse.redirect(
        new URL(
          "/dashboard?payment=failed&reason=supabase_config_error",
          request.url,
        ),
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    });

    console.log(
      "🔍 VERIFY: Checking if payment already processed by webhook...",
    );
    const { data: existingTransaction } = await supabase
      .from("token_transactions")
      .select("id")
      .eq("user_id", userId)
      .ilike("reason", `%${reference}%`)
      .maybeSingle();

    if (existingTransaction) {
      console.log(
        "✅ VERIFY: Webhook already processed this payment. Redirecting home.",
      );
      // Tokens already added by webhook, just show success
      return NextResponse.redirect(new URL("/", request.url));
    }

    console.log(
      "⚠️ VERIFY: Webhook hasn't processed yet. Waiting for webhook to add tokens...",
    );
    // Don't add tokens here - only webhook adds tokens
    // Webhook will fire and process the payment
    return NextResponse.redirect(new URL("/", request.url));
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.redirect(
      new URL("/dashboard?payment=failed&reason=server_error", request.url),
    );
  }
}
