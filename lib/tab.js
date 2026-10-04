export function shareOf(deposit, totalIn, totalOut) {
  const dep = BigInt(deposit);
  const inn = BigInt(totalIn);
  const out = BigInt(totalOut);
  if (inn === 0n || dep === 0n) return 0n;
  if (out > inn) throw new Error("Spent more than funded");
  return (dep * (inn - out)) / inn;
}

export function assertTabInput(body) {
  const title = String(body.title || "").trim();
  if (title.length < 3 || title.length > 80) throw new Error("Title must be 3 to 80 characters");
  if (!/^0x[a-fA-F0-9]{40}$/.test(String(body.token || ""))) throw new Error("Token address required");
  return { title, token: body.token };
}
