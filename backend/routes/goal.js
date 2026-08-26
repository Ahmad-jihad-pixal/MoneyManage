import express from "express";
import prisma from "../config/prisma.js";
import auth from "../middleware/auth.js";
import { getGoalSavedAmount } from "../utils/getGoalSavedAmount.js";
const router = express.Router();
//get all goals
router.get("/api/goal", auth, async (req, res) => {
  try {
    const goals = await prisma.goal.findMany({
      where: { userId: req.user.id, deletedAt: null },
    });

    const goalsWithProgress = await Promise.all(
      goals.map(async (goal) => {
        const savedAmount = await getGoalSavedAmount(goal.id);
        const progress = (savedAmount / Number(goal.targetAmount)) * 100;

        return {
          ...goal,
          savedAmount,
          progress,
        };
      }),
    );
    res.status(200).json(goalsWithProgress);
  } catch (error) {
    res.status(500).json({ message: "faild to access goals" });
  }
});

//get goal by id

router.get("/api/goal/:id", auth, async (req, res) => {
  const { id } = req.params;
  const goalId = parseInt(id);

  if (isNaN(goalId)) {
    return res.status(400).json({ message: "inavlid goal" });
  }
  try {
    const goalExsit = await prisma.goal.findFirst({
      where: { id: goalId, userId: req.user.id, deletedAt: null },
    });
    if (!goalExsit) {
      return res.status(404).json({ message: "goal not found" });
    }
    const savedAmount = await getGoalSavedAmount(goalExsit.id);

    const progress = (savedAmount / goalExsit.targetAmount) * 100;

    res.status(200).json({
      ...goalExsit,
      savedAmount,
      progress,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to access goal" });
  }
});

//create new goal
router.post("/api/goal", auth, async (req, res) => {
  const { name, targetAmount } = req.body;
  try {
    const goal = await prisma.goal.create({
      data: { name, targetAmount, userId: req.user.id },
    });
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: "faild to create goal" });
  }
});

//update the goal name and targetAmount
router.put("/api/goal/:id", auth, async (req, res) => {
  const { id } = req.params;
  const goalId = parseInt(id);
  const { name, targetAmount } = req.body;

  if (isNaN(goalId)) {
    return res.status(400).json({ message: "invalid goal ID" });
  }
  try {
    const goalExsit = await prisma.goal.findFirst({
      where: { id: goalId, userId: req.user.id, deletedAt: null },
    });
    if (!goalExsit) {
      return res.status(404).json({ message: "goal not found " });
    }

    const goal = await prisma.goal.update({
      where: { id: goalExsit.id },
      data: { name, targetAmount },
    });
    res.status(200).json(goal);
  } catch (error) {
    res.status(500).json({ message: "Faild to update goal" });
  }
});

//delete goal
router.delete("/api/goal/:id", auth, async (req, res) => {
  const { id } = req.params;
  const goalId = parseInt(id);

  if (isNaN(goalId)) {
    return res.status(400).json({ message: "invalid goal id" });
  }
  try {
    const goalExsit = await prisma.goal.findFirst({
      where: { id: goalId, userId: req.user.id, deletedAt: null },
    });

    if (!goalExsit) {
      return res.status(404).json({ message: "goal not found" });
    }

    const savedAmount = await getGoalSavedAmount(goalExsit.id);

    if (savedAmount > 0) {
      return res.status(400).json({
        message:
          "the goal account is not empty withdraw the money to account first ",
      });
    }

    await prisma.goal.update({
      where: { id: goalExsit.id },
      data: { deletedAt: new Date() },
    });

    return res.status(200).json({ message: "deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete goal" });
  }
});

//--------------------------------------------

//goalTransfer

//--------------------------------------------

//golaTransfer post
router.post("/api/goal/:id/transfer", auth, async (req, res) => {
  const { id } = req.params;
  const goalId = parseInt(id);
  const { accountId, amount, type, date, note } = req.body;

  if (isNaN(goalId)) {
    return res.status(400).json({ message: "invalid goal id " });
  }
  try {
    const goalExsit = await prisma.goal.findFirst({
      where: {
        id: goalId,
        deletedAt: null,
        userId: req.user.id,
      },
    });

    if (!goalExsit) {
      return res.status(404).json({ message: "goal not found" });
    }
    const accountExsit = await prisma.account.findFirst({
      where: { id: accountId, userId: req.user.id, deletedAt: null },
    });

    if (!accountExsit) {
      return res.status(404).json({ message: "acocunt not found " });
    }
    const savedAmount = await getGoalSavedAmount(goalExsit.id);
    if (type === "OUT") {
      if (amount > savedAmount) {
        return res
          .status(400)
          .json({ message: "can't withdraw more than what's saved " });
      }
    } else if (type === "IN" && savedAmount + amount > goalExsit.targetAmount) {
      return res
        .status(400)
        .json({ message: "the amount+saved > goal target ,no more transfer" });
    }

    //never let moving money INTO a goal push the source account balance below zero
    if (type === "IN" && Number(accountExsit.balance) - amount < 0) {
      return res.status(400).json({
        message: "the amount is begger than the amount in the goal",
      });
    }

    const createGoalTransfer = prisma.goalTransfer.create({
      data: {
        goalId: goalExsit.id,
        accountId: accountExsit.id,
        amount,
        type,
        date: new Date(date),
        note,
      },
    });

    //update accout balance
    const accountBalanceUpdate = prisma.account.update({
      where: { id: accountExsit.id },
      data: {
        balance: type === "IN" ? { decrement: amount } : { increment: amount },
      },
    });

    const operations = [createGoalTransfer, accountBalanceUpdate];

    const results = await prisma.$transaction(operations);
    res.status(201).json(results[0]);
  } catch (error) {
    res.status(500).json({ message: "faild to make new transfer " });
  }
});

//get all goaltransfer

router.get("/api/goal/:id/goaltransfer", auth, async (req, res) => {
  const { id } = req.params;
  const goalId = parseInt(id);

  if (isNaN(goalId)) {
    return res.status(400).json({ message: "invalid goal id " });
  }
  try {
    const goalExsit = await prisma.goal.findFirst({
      where: {
        id: goalId,
        userId: req.user.id,
        deletedAt: null,
      },
    });
    if (!goalExsit) {
      return res.status(404).json({ message: "goal not found" });
    }

    const findGoalTransfer = await prisma.goalTransfer.findMany({
      where: { goalId: goalExsit.id },
    });
    res.status(200).json(findGoalTransfer);
  } catch (error) {
    res.status(500).json({ message: "goalTransfer not found" });
  }
});

export default router;
