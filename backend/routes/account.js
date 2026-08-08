import express from "express";
import prisma from "../config/prisma.js";
import auth from "../middleware/auth.js";
const router = express.Router();

// get all accounts
router.get("/api/accounts", auth, async (req, res) => {
  try {
    const accounts = await prisma.account.findMany({
      where: {
        userId: req.user.id,
      },
    });
    res.status(200).json(accounts);
  } catch (err) {
    res.status(500).json({ error: "Failed to access accounts" });
  }
});

// get account by id
router.get("/api/accounts/:id", auth, async (req, res) => {
  const { id } = req.params;
  const accountId = parseInt(id);
  if (isNaN(accountId)) {
    return res.status(400).json({ message: "Invalid account ID format" });
  }
  try {
    const account = await prisma.account.findFirst({
      where: {
        id: accountId,
        userId: req.user.id,
      },
    });
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }
    res.status(200).json(account);
  } catch (err) {
    res.status(500).json({ message: "Failed to access account" });
  }
});

// create account
// balance here is treated as an "opening balance" set once at creation.
// After creation, balance should only ever change via Transaction/Transfer/
// GoalTransfer processing (see PUT below) — not by direct client edits.
router.post("/api/accounts", auth, async (req, res) => {
  const { name, balance } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Account name is required" });
  }

  let openingBalance = 0;
  if (balance !== undefined && balance !== null) {
    openingBalance = parseFloat(balance);
    if (isNaN(openingBalance)) {
      return res
        .status(400)
        .json({ message: "Balance must be a valid number" });
    }
  }

  try {
    const createAccount = await prisma.account.create({
      data: {
        name,
        balance: openingBalance,
        userId: req.user.id,
      },
    });
    res.status(201).json(createAccount);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Something went wrong creating the account" });
  }
});

// update account
// NOTE: balance is intentionally NOT editable here. Per the system design,
// Account.balance is a derived/cached value that must only be mutated by the
// transaction/transfer/goal-transfer services (in the same DB transaction as
// the underlying record), so it can't drift from the raw event history.
// This endpoint only allows renaming the account.
router.put("/api/accounts/:id", auth, async (req, res) => {
  const { name } = req.body;
  const { id } = req.params;
  const accountId = parseInt(id);

  if (isNaN(accountId)) {
    return res.status(400).json({ message: "Invalid account ID format" });
  }

  if (!name) {
    return res.status(400).json({ message: "Account name is required" });
  }

  try {
    const account = await prisma.account.findFirst({
      where: { id: accountId, userId: req.user.id },
    });

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    const updatedAccount = await prisma.account.update({
      where: { id: accountId },
      data: { name },
    });

    res.status(200).json(updatedAccount);
  } catch (err) {
    res.status(500).json({ message: "Error updating account" });
  }
});

// delete account
router.delete("/api/accounts/:id", auth, async (req, res) => {
  const { id } = req.params;
  const accountId = parseInt(id);

  if (isNaN(accountId)) {
    return res.status(400).json({ message: "Invalid account ID format" });
  }

  try {
    const account = await prisma.account.findFirst({
      where: {
        id: accountId,
        userId: req.user.id,
      },
    });
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    await prisma.account.delete({
      where: { id: accountId },
    });

    res.status(200).json({ message: "Account deleted" });
  } catch (err) {
    // Once Transaction/Transfer/GoalTransfer relations use onDelete: Restrict,
    // deleting an account that still has related records will throw a Prisma
    // foreign-key constraint error (code P2003) instead of a generic failure.
    if (err.code === "P2003") {
      return res.status(409).json({
        message:
          "This account has existing transactions or transfers and can't be deleted. Consider closing it instead.",
      });
    }
    res.status(500).json({ message: "Failed to delete account" });
  }
});

export default router;
