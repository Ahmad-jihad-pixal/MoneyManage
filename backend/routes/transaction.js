import express from "express";
import prisma from "../config/prisma.js";
import auth from "../middleware/auth.js";
import { getSignedAmount } from "../utils/getSignedAmount.js";
const router = express.Router();

//get all transaction
router.get("/api/transaction", auth, async (req, res) => {
  try {
    const { accountId, categoryId, from, to } = req.query;

    const where = { account: { userId: req.user.id }, deletedAt: null };

    if (accountId) where.accountId = parseInt(accountId);
    if (categoryId) where.categoryId = parseInt(categoryId);
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from);
      if (to) where.date.lte = new Date(to);
    }

    const transaction = await prisma.transaction.findMany({
      where,
      orderBy: {
        date: "desc",
      },
      include: {
        category: true,
        account: true,
      },
    });
    res.status(200).json(transaction);
  } catch (err) {
    res.status(500).json({ message: "Failed to access transaction" });
  }
});

//get transaction by id

router.get("/api/transaction/:id", auth, async (req, res) => {
  const { id } = req.params;
  const transactionId = parseInt(id);
  if (isNaN(transactionId)) {
    return res.status(400).json({ message: "Invalid transaction ID format" });
  }
  try {
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        account: { userId: req.user.id },
        deletedAt: null,
      },
      include: {
        category: true,
        account: true,
      },
    });
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found " });
    }
    res.status(200).json(transaction);
  } catch (error) {
    res.status(500).json({ message: "Failed to access transaction" });
  }
});

//post transaction

router.post("/api/transaction", auth, async (req, res) => {
  const { categoryId, accountId, amount, date, note } = req.body;
  try {
    //OR to defult category

    //category check for existing and owned
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        OR: [{ userId: null }, { userId: req.user.id }],
      },
    });
    if (!category) {
      return res.status(404).json({
        message: "category not found",
      });
    }

    //account  check for existing and owned
    const account = await prisma.account.findFirst({
      where: {
        id: accountId,
        userId: req.user.id,
      },
    });
    if (!account) {
      return res.status(404).json({
        //account not found
        message: "select an account  ",
      });
    }
    //for culc balance and budgetmath
    const signedAmount = getSignedAmount(amount, category.type);

    //never let a transaction push the account balance below zero
    if (Number(account.balance) + signedAmount < 0) {
      return res.status(400).json({
        message: "This transaction would leave the account balance below zero",
      });
    }

    // Step 5: find the active BudgetCycle for this category, if one exists.
    // Only relevant for expenses — income never affects budget spending.
    let activeCycle = null;
    //Does this user have a budget for this category
    if (category.type === "EXPENSE") {
      const budget = await prisma.budget.findFirst({
        where: {
          categoryId: category.id,
          userId: req.user.id,
          deletedAt: null,
        },
      });
      //If yes, you then find the active cycle
      if (budget) {
        activeCycle = await prisma.budgetCycle.findFirst({
          where: {
            budgetId: budget.id,
            status: "ACTIVE",
          },
        });
      }
    }

    //crete trasaction qurey
    const createTransaction = prisma.transaction.create({
      data: {
        categoryId: category.id,
        accountId: account.id,
        amount,
        date: new Date(date),
        note,
      },
    });

    //update the account balace
    const updateBalnace = prisma.account.update({
      where: { id: account.id },
      data: {
        balance: { increment: signedAmount },
      },
    });

    //update the budget spent amount
    const budgetCycleUpdate = activeCycle
      ? prisma.budgetCycle.update({
          where: { id: activeCycle.id },
          data: { spentAmount: { increment: amount } },
        })
      : null;

    const operations = [
      createTransaction,
      updateBalnace,
      budgetCycleUpdate,
    ].filter(Boolean);
    const results = await prisma.$transaction(operations);
    //this all ganna happen when the user make a new transaction that why we send the the results[0] which is create the trasaction
    res.status(201).json(results[0]);
  } catch (error) {
    res.status(500).json({ message: "Failed to make a new transaction" });
  }
});

//update the transaction
router.put("/api/transaction/:id", auth, async (req, res) => {
  const { categoryId, accountId, amount, date, note } = req.body;
  const { id } = req.params;
  const transactionId = parseInt(id);
  //make sure the id is a number
  if (isNaN(transactionId)) {
    return res.status(400).json({ message: "invalid id " });
  }

  try {
    //Prisma lets you reach through a relation in a where clause,we find the user onwership throw the account
    const existing = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        account: { userId: req.user.id },
        deletedAt: null,
      },
    });
    if (!existing) {
      return res.status(404).json({ message: "transactoin not found" });
    }

    //get the old category to get the categoryType
    //the exsting trsaction give us a category id (number)
    const oldCategory = await prisma.category.findFirst({
      where: {
        id: existing.categoryId,
        OR: [{ userId: null }, { userId: req.user.id }],
      },
    });
    const oldSignedAmount = getSignedAmount(existing.amount, oldCategory.type);

    //to get the new category type
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        OR: [{ userId: null }, { userId: req.user.id }],
      },
    });
    if (!category) {
      return res.status(404).json({
        message: "category not found",
      });
    }

    //account  check for existing and owned
    const account = await prisma.account.findFirst({
      where: {
        id: accountId,
        userId: req.user.id,
      },
    });
    if (!account) {
      return res.status(404).json({
        message: "account not found",
      });
    }
    const newSignedAmount = getSignedAmount(amount, category.type);

    const accountChange = existing.accountId !== account.id;

    //never let an edit push either affected account's balance below zero
    if (!accountChange) {
      const projectedBalance =
        Number(account.balance) + (newSignedAmount - oldSignedAmount);
      if (projectedBalance < 0) {
        return res.status(400).json({
          message:
            "This transaction would leave the account balance below zero",
        });
      }
    } else {
      const oldAccountRecord = await prisma.account.findFirst({
        where: { id: existing.accountId },
      });
      const projectedOldBalance =
        Number(oldAccountRecord.balance) - oldSignedAmount;
      const projectedNewBalance = Number(account.balance) + newSignedAmount;
      if (projectedOldBalance < 0 || projectedNewBalance < 0) {
        return res.status(400).json({
          message: "This transaction would leave an account balance below zero",
        });
      }
    }

    let balanceOp = [];
    //case1 if the account id the same
    if (!accountChange) {
      balanceOp = [
        prisma.account.update({
          where: { id: account.id },
          data: { balance: { increment: newSignedAmount - oldSignedAmount } },
        }),
      ];
      //case 2 if the account is diff
    } else {
      balanceOp = [
        //return the amount back/to account
        prisma.account.update({
          where: { id: existing.accountId },
          data: { balance: { increment: -oldSignedAmount } },
        }),
        //remove/add the amount from the new account
        prisma.account.update({
          where: { id: account.id },
          data: { balance: { increment: newSignedAmount } },
        }),
      ];
    }

    //find the old active cycle

    let oldActiveCycle = null;
    //Does this user have a budget for this category
    if (oldCategory.type === "EXPENSE") {
      const OldBudget = await prisma.budget.findFirst({
        where: {
          categoryId: oldCategory.id,
          userId: req.user.id,
          deletedAt: null,
        },
      });
      //If yes, you then find the active cycle if there one
      if (OldBudget) {
        oldActiveCycle = await prisma.budgetCycle.findFirst({
          where: {
            budgetId: OldBudget.id,
            status: "ACTIVE",
          },
        });
      }
    }

    //find the new active cylce

    let newActiveCycle = null;
    if (category.type === "EXPENSE") {
      const newBudget = await prisma.budget.findFirst({
        where: { categoryId: category.id, userId: req.user.id, deletedAt: null },
      });
      if (newBudget) {
        newActiveCycle = await prisma.budgetCycle.findFirst({
          where: { budgetId: newBudget.id, status: "ACTIVE" },
        });
      }
    }

    //compare the old and new active cycle to know if they are same/diff

    const sameCycle =
      oldActiveCycle &&
      newActiveCycle &&
      oldActiveCycle.id === newActiveCycle.id;

    //same budget cycle
    let budgetCycleOps = [];
    if (sameCycle) {
      budgetCycleOps.push(
        prisma.budgetCycle.update({
          where: { id: oldActiveCycle.id },
          data: { spentAmount: { increment: amount - existing.amount } },
        }),
      );
      //diff budget cycle
    } else {
      //put reverse and new update each one in if becuse one or more may be null

      //revser the old budget
      if (oldActiveCycle) {
        budgetCycleOps.push(
          prisma.budgetCycle.update({
            where: { id: oldActiveCycle.id },
            data: { spentAmount: { increment: -existing.amount } },
          }),
        );
      }
      //make the change to the new budget if there
      if (newActiveCycle) {
        budgetCycleOps.push(
          prisma.budgetCycle.update({
            where: { id: newActiveCycle.id },
            data: { spentAmount: { increment: amount } },
          }),
        );
      }
    }
    //update the transaction
    const transactionUpdate = prisma.transaction.update({
      where: { id: transactionId },
      data: {
        categoryId: category.id,
        accountId: account.id,
        amount,
        date: new Date(date),
        note,
      },
    });

    const operations = [transactionUpdate, ...balanceOp, ...budgetCycleOps];
    const results = await prisma.$transaction(operations);

    res.status(200).json(results[0]);
  } catch (err) {
    res.status(500).json({ message: "Failed to update transaction" });
  }
});

//delete transaction

router.delete("/api/transaction/:id", auth, async (req, res) => {
  const { id } = req.params;
  const transactionId = parseInt(id);

  if (isNaN(transactionId)) {
    return res.status(400).json({ message: "inavalid trasaction" });
  }

  //check if the transaction exsit
  try {
    const existing = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        account: { userId: req.user.id },
        deletedAt: null,
      },
    });

    if (!existing) {
      return res.status(404).json({ message: "transactoin not found" });
    }

    //old category to know the category type to reverse the balance and budget
    const oldCategory = await prisma.category.findFirst({
      where: {
        id: existing.categoryId,
        OR: [{ userId: null }, { userId: req.user.id }],
      },
    });

    const oldSignedAmount = getSignedAmount(existing.amount, oldCategory.type);

    let oldActiveCycle = null;
    if (oldCategory.type === "EXPENSE") {
      const oldBudget = await prisma.budget.findFirst({
        where: { categoryId: oldCategory.id, userId: req.user.id, deletedAt: null },
      });
      if (oldBudget) {
        oldActiveCycle = await prisma.budgetCycle.findFirst({
          where: { budgetId: oldBudget.id, status: "ACTIVE" },
        });
      }
    }

    //reverse the balance
    const reverseBalance = prisma.account.update({
      where: { id: existing.accountId },
      data: { balance: { increment: -oldSignedAmount } },
    });

    //reverse the budget
    //reverse the budget cycle, only if one was affected
    const reverseBudgetCycle = oldActiveCycle
      ? prisma.budgetCycle.update({
          where: { id: oldActiveCycle.id },
          data: { spentAmount: { increment: -existing.amount } },
        })
      : null;

    //soft-delete the transaction
    const softDelete = prisma.transaction.update({
      where: { id: transactionId },
      data: { deletedAt: new Date() },
    });

    const operations = [softDelete, reverseBalance, reverseBudgetCycle].filter(
      Boolean,
    );
    await prisma.$transaction(operations);

    res.status(200).json({ message: "Transaction deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete transaction" });
  }
});
export default router;
