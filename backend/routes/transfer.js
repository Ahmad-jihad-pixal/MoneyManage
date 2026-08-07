import express from "express";
import prisma from "../prisma.js";
import auth from "../middleware/auth.js";

const router = express.Router();

//get all
router.get("/api/transfer", auth, async (req, res) => {
  try {
    const transfer = await prisma.transfer.findMany({
      where: {
        fromAccount: { userId: req.user.id },
      },
      orderBy: { date: "desc" },
    });
    res.status(200).json(transfer);
  } catch (err) {
    res.status(500).json({ message: "Failed to access transfer" });
  }
});

//get by id

router.get("/api/transfer/:id", auth, async (req, res) => {
  const { id } = req.params;
  const transferId = parseInt(id);

  if (isNaN(transferId)) {
    return res.status(400).json({ message: "invalid trasfer" });
  }
  try {
    //exsiting and onwership
    const transferExsiting = await prisma.transfer.findFirst({
      where: { id: transferId, fromAccount: { userId: req.user.id } },
    });

    //if the trasfer not exsiting
    if (!transferExsiting) {
      return res.status(404).json({ message: "transfer not found " });
    }

    res.status(200).json(transferExsiting);
  } catch (error) {
    res.status(500).json({ message: "Failed to access transfer" });
  }
});

//make new trasfer
router.post("/api/transfer", auth, async (req, res) => {
  const { fromAccountId, toAccountId, amount, date } = req.body;

  try {
    //vaidate
    if (fromAccountId === toAccountId) {
      return res
        .status(400)
        .json({ message: "Cannot transfer to the same account" });
    }
    //check the onwership of the to account

    const fromAccountExisting = await prisma.account.findFirst({
      where: { id: fromAccountId, userId: req.user.id },
    });
    if (!fromAccountExisting) {
      return res.status(404).json({ message: "Source account not found" });
    }

    const toAccountExisting = await prisma.account.findFirst({
      where: { id: toAccountId, userId: req.user.id },
    });
    if (!toAccountExisting) {
      return res.status(404).json({ message: "Destination account not found" });
    }

    const transfarFromAccount = prisma.account.update({
      where: { id: fromAccountExisting.id },
      data: { balance: { decrement: amount } },
    });

    const transferToAccount = prisma.account.update({
      where: { id: toAccountExisting.id },
      data: { balance: { increment: amount } },
    });
    const transfer = prisma.transfer.create({
      data: {
        fromAccountId: fromAccountExisting.id,
        toAccountId: toAccountExisting.id,
        amount,
        date,
      },
    });

    const operations = [transfer, transfarFromAccount, transferToAccount];

    const results = await prisma.$transaction(operations);
    res.status(201).json(results[0]);
  } catch (error) {
    res.status(500).json({ message: "Failed to make a new transfer" });
  }
});

//update the trasfer
router.put("/api/transfer/:id", auth, async (req, res) => {
  const { id } = req.params;
  const transferId = parseInt(id);
  const { fromAccountId, toAccountId, amount, date } = req.body;

  if (isNaN(transferId)) {
    return res.status(400).json({ message: "invalid trnasfer" });
  }
  try {
    //existing for onwership and get the amount
    const existing = await prisma.transfer.findFirst({
      where: {
        id: transferId,
        fromAccount: { userId: req.user.id },
      },
    });

    if (!existing) {
      return res.status(404).json({ message: "Transfer not found" });
    }
    //security for onwership
    const fromAccountExisting = await prisma.account.findFirst({
      where: { id: fromAccountId, userId: req.user.id },
    });
    if (!fromAccountExisting) {
      return res.status(404).json({ message: "Source account not found" });
    }

    const toAccountExisting = await prisma.account.findFirst({
      where: { id: toAccountId, userId: req.user.id },
    });
    if (!toAccountExisting) {
      return res.status(404).json({ message: "Destination account not found" });
    }
    //array to use $trasaction
    let balanceOps = [];
    //oldFromAccount !==newFromAccount
    if (existing.fromAccountId !== fromAccountId) {
      balanceOps.push(
        //reverse thr oldFromAccount (retrun the blance amount)
        prisma.account.update({
          where: { id: existing.fromAccountId },
          data: { balance: { increment: existing.amount } },
        }),

        //add the amount to the new account
        prisma.account.update({
          where: { id: fromAccountId },
          data: { balance: { decrement: amount } },
        }),
      );
    } else {
      balanceOps.push(
        //old and new account are same(just edit the the amount )
        prisma.account.update({
          where: { id: fromAccountId },
          data: { balance: { decrement: amount - existing.amount } },
        }),
      );
    }
    if (existing.toAccountId !== toAccountId) {
      balanceOps.push(
        //reverse the old toAccount
        prisma.account.update({
          where: { id: existing.toAccountId },
          data: { balance: { decrement: existing.amount } },
        }),

        //add the money to the nre account
        prisma.account.update({
          where: { id: toAccountId },
          data: { balance: { increment: amount } },
        }),
      );
    } else {
      balanceOps.push(
        prisma.account.update({
          where: { id: toAccountId },
          data: { balance: { increment: amount - existing.amount } },
        }),
      );
    }

    const transferUpdate = prisma.transfer.update({
      where: { id: transferId },
      data: { fromAccountId, toAccountId, amount, date },
    });

    const operations = [transferUpdate, ...balanceOps];
    const results = await prisma.$transaction(operations);

    res.status(200).json(results[0]);
  } catch (error) {
    res.status(500).json({ message: "Failed to update transfer" });
  }
});
