// prisma/seed.js
import prisma from "../config/prisma.js";

const defaultCategories = [
  { name: "Food & Drinks", type: "EXPENSE" },
  { name: "Bills & Utilities", type: "EXPENSE" },
  { name: "Salary", type: "INCOME" },
  { name: "Freelance", type: "INCOME" },
];

async function main() {
  for (const cat of defaultCategories) {
    const existing = await prisma.category.findFirst({
      where: { name: cat.name, userId: null },
    });
    if (!existing) {
      await prisma.category.create({
        data: { ...cat, userId: null },
      });
    }
  }
}

main()
  .then(() => console.log("Seeding complete."))
  .catch((err) => console.error("Seeding failed:", err))
  .finally(() => prisma.$disconnect());
