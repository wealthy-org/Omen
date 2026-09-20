export function formatUserErrorMessage(
  error: unknown,
  fallbackMessage: string = "An unexpected error occurred. Please try again."
): string {
  console.error("[Omen Client Error]:", error);

  if (!error) {
    return fallbackMessage;
  }

  const rawMsg =
    typeof error === "string"
      ? error
      : error instanceof Error
      ? error.message
      : typeof (error as any)?.error === "string"
      ? (error as any).error
      : typeof (error as any)?.message === "string"
      ? (error as any).message
      : "";

  const lower = rawMsg.toLowerCase();

  if (
    lower.includes("insufficient funds") ||
    lower.includes("exceeds the balance") ||
    lower.includes("overshot")
  ) {
    return "Insufficient testnet funds for transaction gas. Please ensure your wallet has enough balance.";
  }

  if (
    lower.includes("user rejected") ||
    lower.includes("user denied") ||
    lower.includes("action rejected") ||
    lower.includes("cancelled")
  ) {
    return "Transaction was cancelled or rejected in wallet.";
  }

  if (
    lower.includes("execution reverted") ||
    lower.includes("revert") ||
    lower.includes("contract function")
  ) {
    return "Smart contract transaction failed on-chain. Please verify market parameters and try again.";
  }

  if (
    lower.includes("failed to fetch") ||
    lower.includes("network error") ||
    lower.includes("timeout") ||
    lower.includes("econnrefused")
  ) {
    return "Network connection error. Please check your RPC connection and try again.";
  }

  if (lower.includes("already resolved")) {
    return "This market has already been resolved.";
  }

  if (lower.includes("already claimed")) {
    return "Payout for this position has already been claimed.";
  }

  if (lower.includes("unauthorized") || lower.includes("access denied")) {
    return "Unauthorized action or invalid administrative credentials.";
  }

  if (
    rawMsg.length > 0 &&
    rawMsg.length <= 120 &&
    !rawMsg.includes("\n") &&
    !rawMsg.includes("Contract Call:") &&
    !rawMsg.includes("Request Arguments:") &&
    !rawMsg.includes("0x") &&
    !rawMsg.includes("{") &&
    !rawMsg.includes("}")
  ) {
    return rawMsg.trim();
  }

  return fallbackMessage;
}
