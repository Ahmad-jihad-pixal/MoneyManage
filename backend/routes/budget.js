import express from "express";
import prisma from "../config/prisma.js";
import auth from "../middleware/auth.js";

const router = express.Router();

//get al the budget

router.get("/api/budget", auth, async (req, res) => {
  try {
    //deletedAt:null so soft-deleted budgets don't reappear in the list
    const budgets = await prisma.budget.findMany({
      where: { userId: req.user.id, deletedAt: null },
    });

    const budgetsWithProgress = await Promise.all(
      budgets.map(async (budget) => {
        const activeCycle = await prisma.budgetCycle.findFirst({
          where: { budgetId: budget.id, status: "ACTIVE" },
        });

        const spentAmount = activeCycle ? Number(activeCycle.spentAmount) : 0;
        const amount = Number(budget.amount);

        const remaining = amount - spentAmount;
        const progress = amount > 0 ? (spentAmount / amount) * 100 : 0;

        let daysRemaining = null;
        if (activeCycle) {
          const msPerDay = 1000 * 60 * 60 * 24;
          daysRemaining = Math.ceil(
            (new Date(activeCycle.endDate) - new Date()) / msPerDay,
          );
        }

        return {
          ...budget,
          activeCycle,
          spentAmount,
          remaining,
          progress,
          daysRemaining,
        };
      }),
    );

    res.status(200).json(budgetsWithProgress);
  } catch (err) {
    res.status(500).json({ message: "Failed to access budgets(get:id)" });
  }
});

//get budget by id

router.get("/api/budget/:id", auth, async (req, res) => {
  const { id } = req.params;
  const budgetId = parseInt(id);

  if (isNaN(budgetId)) {
    return res.status(400).json({ message: "invalid budget id" });
  }

  try {
    const budgetExsit = await prisma.budget.findFirst({
      where: { id: budgetId, userId: req.user.id, deletedAt: null },
    });

    if (!budgetExsit) {
      return res.status(404).json({ message: "budget not found" });
    }

    const activeCycle = await prisma.budgetCycle.findFirst({
      where: { budgetId: budgetExsit.id, status: "ACTIVE" },
    });

    const spentAmount = activeCycle ? Number(activeCycle.spentAmount) : 0;
    const amount = Number(budgetExsit.amount);
    const remaining = amount - spentAmount;
    const progress = amount > 0 ? (spentAmount / amount) * 100 : 0;

    let daysRemaining = null;
    if (activeCycle) {
      const msPerDay = 1000 * 60 * 60 * 24;
      daysRemaining = Math.ceil(
        (new Date(activeCycle.endDate) - new Date()) / msPerDay,
      );
    }

    res.status(200).json({
      ...budgetExsit,
      activeCycle,
      spentAmount,
      remaining,
      progress,
      daysRemaining,
    });
  } catch (error) {
    res.status(500).json({ message: "error fetch budget" });
  }
});

//post
router.post("/api/budget", auth, async (req, res) => {
  const { categoryId, amount, period, startDate, autoReset } = req.body;

  try {
    //category check for existing and accessible
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        OR: [{ userId: null }, { userId: req.user.id }],
        deletedAt: null,
      },
    });
    if (!category) {
      return res.status(404).json({ message: "category not found" });
    }

    //calculate the first cycle's end date, based on period
    const start = startDate ? new Date(startDate) : new Date();
    let endDate = new Date(start);

    if (period === "WEEKLY") {
      endDate.setDate(endDate.getDate() + 7);
    } else if (period === "MONTHLY") {
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(endDate.getDate() - 1);
    } else if (period === "YEARLY") {
      endDate.setFullYear(endDate.getFullYear() + 1);
      endDate.setDate(endDate.getDate() - 1);
    }

    //budget + first cycle must be created together
    //budgetCycle needs budget.id, which only exists after budget.create runs,
    //so we use the interactive $transaction callback form here
    const result = await prisma.$transaction(async (tx) => {
      const budget = await tx.budget.create({
        data: {
          userId: req.user.id,
          categoryId: category.id,
          amount,
          period,
          startDate: start,
          autoReset: autoReset ?? false,
        },
      });

      const cycle = await tx.budgetCycle.create({
        data: {
          budgetId: budget.id,
          startDate: start,
          endDate,
          status: "ACTIVE",
        },
      });

      return { budget, cycle };
    });

    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to create budget" });
  }
});

//update  budget
router.put("/api/budget/:id", auth, async (req, res) => {
  const { categoryId, amount, period, startDate, autoReset } = req.body;
  const { id } = req.params;
  const budgetId = parseInt;

  if (isNaN(budgetId)) {
    return res.status(400).json({ message: "in valid budget id " });
  }
  try {
    const budgetExsit = await prisma.budget.findFirst({
      where: { id: budgetId, userId: req.user.id, deletedAt: null },
    });

    if (!budgetExsit) {
      return res.status(404).json({ message: "budget not found" });
    }
    // Note: categoryId is intentionally not editable here — changing it
    // would disconnect the budget from its own past cycle history.
    // amount/period changes only affect future cycles, not the current
    // active one, so the active cycle's own startDate/endDate/spentAmount
    // stay untouched by this update.
    const budget = await prisma.budget.update({
      where: { id: existingBudget.id },
      data: { amount, period, autoReset },
    });

    res.status(200).json(budget);
  } catch (error) {
    res.status(500).json({ message: "Failed to update budget" });
  }
});

//delete budget
router.delete("/api/budget/:id", auth, async (req, res) => {
  const { id } = req.params;
  const budgetId = parseInt(id);
  if (isNaN(budgetId)) {
    return res.status(400).json({ message: "invalid budget id" });
  }
  try {
    const budgetExsit = await prisma.budget.findFirst({
      where: { id: budgetId, userId: req.user.id, deletedAt: null },
    });
    if (!budgetExsit) {
      return res.status(404).json({ message: "budget not found" });
    }
    await prisma.budget.update({
      where: { id: budgetExsit.id },
      data: { deletedAt: new Date() },
    });
    res.status(200).json({ message: "budget deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete budget" });
  }
});
export default router;
