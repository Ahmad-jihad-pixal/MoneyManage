// prisma/cleanup-seed.js
import prisma from "../config/prisma.js";

async function main() {
  // delete everything except the first 4 (ids 1-4)
  await prisma.category.deleteMany({
    where: {
      id: { gt: 4 },
    },
  });
}

main()
  .then(() => console.log("Cleanup complete."))
  .catch((err) => console.error("Cleanup failed:", err))
  .finally(() => prisma.$disconnect());
