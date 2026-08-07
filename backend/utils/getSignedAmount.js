// utils/getSignedAmount.js

// Converts a positive amount into a signed value based on category type.
// This is the single source of truth for sign logic — every place that
// touches Account.balance or BudgetCycle.spentAmount must use this,
// rather than re-deriving the sign independently.
export function getSignedAmount(amount, categoryType) {
  if (categoryType === "INCOME") {
    return amount;
  }
  if (categoryType === "EXPENSE") {
    return -amount;
  }
  throw new Error(`Unknown category type: ${categoryType}`);
}
