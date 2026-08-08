import express from "express";
const app = express();
import cors from 'cors'
// Define route app.use


import budgetRouter from "./routes/budget.js";
import accountRouter from "./routes/account.js";
import categoryRouter from "./routes/category.js";
import goalRouter from "./routes/goal.js";
import loginRouter from "./routes/login.js";
import registerRouter from "./routes/register.js";
import transferRouter from "./routes/transfer.js";
import transactionRouter from "./routes/transaction.js";




app.use(cors());
app.use(express.json());

app.use(accountRouter);
//"Every route inside budgetRouter starts with /api/budget."
//app.use("/api/budget", budgetRouter);
app.use( budgetRouter);
app.use( categoryRouter);
app.use( goalRouter);
app.use( loginRouter);
app.use( registerRouter);
app.use( transferRouter);
app.use( transactionRouter);








const PORT = 3000;
// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
