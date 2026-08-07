// utils/getGoalSavedAmount.js
import prisma from "../config/prisma.js";

// Calculates a goal's current saved amount by summing its GoalTransfers.
// IN transfers add to the total, OUT transfers subtract from it.
// This is never stored on Goal directly — always calculated fresh,
// per the "store raw data, calculate derived values" design principle.
export async function getGoalSavedAmount(goalId) {
  const inSum = await prisma.goalTransfer.aggregate({
    where: { goalId, type: "IN" },
    _sum: { amount: true },
  });

  const outSum = await prisma.goalTransfer.aggregate({
    where: { goalId, type: "OUT" },
    _sum: { amount: true },
  });

  const totalIn = Number(inSum._sum.amount ?? 0);
  const totalOut = Number(outSum._sum.amount ?? 0);

  return totalIn - totalOut;
}
