export function GET() {
  return Response.json({
    ok: true,
    app: "tabroom",
    chainId: Number(process.env.NEXT_PUBLIC_MONAD_CHAIN_ID || 143),
    tabConfigured: Boolean(process.env.NEXT_PUBLIC_TAB_ADDRESS),
  });
}
