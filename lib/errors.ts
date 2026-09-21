export function friendlyError(error: unknown): string {
  const value = error as { code?: number | string; shortMessage?: string; message?: string; reason?: string };
  const text = `${value?.shortMessage || ""} ${value?.reason || ""} ${value?.message || ""}`.toLowerCase();
  if (value?.code === 4001 || text.includes("user rejected") || text.includes("user denied")) return "You cancelled the request in your wallet.";
  if (text.includes("insufficient funds")) return "Your wallet does not have enough BOT for this transaction and its network fee.";
  if (text.includes("unauthorized")) return "This wallet is not allowed to manage this payroll contract.";
  if (text.includes("invalidconfiguration")) return "One or more payroll details are invalid, or the selected payment is not due yet.";
  if (text.includes("incorrectvalue")) return "The payment amount does not match the amount required by the contract.";
  if (text.includes("transferfailed")) return "The contract could not send one of the payments. No funds were moved.";
  if (text.includes("network") || text.includes("failed to fetch") || text.includes("could not coalesce")) return "BOT Chain could not be reached. Check your connection and try again.";
  if (text.includes("missing revert data")) return "The transaction could not be completed. Check the contract balance and payment schedule.";
  return "Something prevented that action from completing. Your funds have not been moved.";
}
