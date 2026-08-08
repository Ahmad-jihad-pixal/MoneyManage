import express from "express";
import prisma from "../config/prisma.js";
import auth from "../middleware/auth.js";
const router = express.Router();

//get all category  {without validation}
// to get both defult and user category we use (or)then where 1:  2:
//that mean the peisma will get excute when one of them is right

//put deletedAt:null to make sure the get only work on non deleted item
router.get("/api/category", auth, async (req, res) => {
  try {
    const category = await prisma.category.findMany({
      where: {
        deletedAt: null,
        OR: [{ userId: null }, { userId: req.user.id }],
      },
      orderBy: {
        name: "asc",
      },
    });
    res.status(200).json(category);
  } catch (err) {
    res.status(500).json({ massage: "Failed to access category" });
  }
});

//get category by id {without validation}
//put deletedAt:null to make sure the get only work on non deleted item

router.get("/api/category/:id", auth, async (req, res) => {
  const { id } = req.params;
  const categoryId = parseInt(id);
  if (isNaN(categoryId)) {
    return res.status(400).json({ message: "Invalid category ID format" });
  }
  try {
    const category = await prisma.category.findFirst({
      where: {
        deletedAt: null,
        id: categoryId,
        OR: [{ userId: null }, { userId: req.user.id }],
      },
    });

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }
    res.status(200).json(category);
  } catch (err) {
    res.status(500).json({ message: "Failed to access category" });
  }
});

//create category (post) {without validation}

router.post("/api/category", auth, async (req, res) => {
  const { name, type, parentId } = req.body;
  try {
    const category = await prisma.category.create({
      data: {
        name,
        type,
        parentId,
        userId: req.user.id,
      },
    });
    res.status(201).json(category);
  } catch (err) {
    res
      .status(500)
      .json({ massage: "Something went wrong creating the category" });
  }
});

//update category (put) {without validation}

router.put("/api/category/:id", auth, async (req, res) => {
  const { name, type, parentId } = req.body;
  const { id } = req.params;
  const categoryId = parseInt(id);

  if (isNaN(categoryId)) {
    return res.status(400).json({ message: "Invalid category ID format" });
  }
  try {
    const existingCategory = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId: req.user.id,
        deletedAt: null,
      },
    });
    if (!existingCategory) {
      return res.status(404).json({ message: "Category not found" });
    }
    const category = await prisma.category.update({
      where: {
        id: categoryId,
      },

      data: {
        name,
        type,
        parentId,
      },
    });
    res.status(200).json(category);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Something went wrong updating the category" });
  }
});

//delete category
//to make a soft delete after add deletedAt in the db table , add deletedAt:null to the onwer ship to ensure the item in not deleted ,cant delte item alredy deleted

//rather than use prisma.delete , we use prisma.update to make it univsable to the user

router.delete("/api/category/:id", auth, async (req, res) => {
  const { id } = req.params;
  const categoryId = parseInt(id);

  if (isNaN(categoryId)) {
    return res.status(400).json({ message: "Invalid category ID format" });
  }
  try {
    const existingCategory = await prisma.category.findFirst({
      where: { id: categoryId, userId: req.user.id, deletedAt: null },
    });
    if (!existingCategory) {
      return res.status(404).json({ message: "category not found " });
    }
    await prisma.category.update({
      where: {
        id: categoryId,
      },
      data: {
        deletedAt: new Date(),
      },
    });
    res.status(200).json({ message: "category deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete category " });
  }
});

export default router;
