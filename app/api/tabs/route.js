import { assertTabInput } from "../../../lib/tab.js";

export async function POST(request) {
  try {
    const body = await request.json();
    const tab = assertTabInput(body);
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return Response.json({ ok: true, tab, stored: false, reason: "supabase_not_configured" });
    }
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/tabs`, {
      method: "POST",
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        title: tab.title,
        token_address: tab.token,
        host_address: body.host || null,
        tx_hash: body.txHash || null,
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) return Response.json({ ok: false, error: payload.message || "insert failed" }, { status: 400 });
    return Response.json({ ok: true, tab, stored: true });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 400 });
  }
}
