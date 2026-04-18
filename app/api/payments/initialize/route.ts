import { NextRequest, NextResponse } from "next/server";

interface InitializePaymentBody {
  userId: string;
  amount: number;
  tokens: number;
  email: string;
}

export async function POST(request: NextRequest) {
  try {
    const { userId, amount, tokens, email } =
      (await request.json()) as InitializePaymentBody;

    if (!userId || !amount || !tokens || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const paystackApiKey = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackApiKey) {
      return NextResponse.json(
        { error: "Payment provider not configured" },
        { status: 500 },
      );
    }

    // Initialize Paystack transaction
    const baseUrl =
      request.headers.get("x-forwarded-proto") === "https"
        ? `https://${request.headers.get("host")}`
        : `http://${request.headers.get("host")}`;

    const callbackUrl = `${baseUrl}/api/payments/verify`;

    const paystackResponse = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${paystackApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount: Math.round(amount * 100), // Convert to kobo (Paystack expects 100x amount)
          metadata: {
            userId,
            tokens,
          },
          callback_url: callbackUrl,
        }),
      },
    );

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok) {
      console.error("Paystack error:", paystackData);
      return NextResponse.json(
        { error: "Failed to initialize payment" },
        { status: 500 },
      );
    }

    // Use the authorization URL as-is, don't modify it
    return NextResponse.json({
      success: true,
      data: {
        authorizationUrl: paystackData.data.authorization_url,
        accessCode: paystackData.data.access_code,
        reference: paystackData.data.reference,
      },
    });
  } catch (error) {
    console.error("Payment initialization error:", error);
    return NextResponse.json(
      { error: "Failed to initialize payment" },
      { status: 500 },
    );
  }
}
