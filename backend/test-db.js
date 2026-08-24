import mariadb from "mariadb";

const pool = mariadb.createPool({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "Ahmad056",
  database: "MoneyManageDB",
  connectionLimit: 5,
});

try {
  const conn = await pool.getConnection();
  console.log("✅ Connected successfully!");
  const rows = await conn.query("SELECT 1 as test");
  console.log(rows);
  conn.release();
} catch (err) {
  console.error("❌ Connection failed:", err);
} finally {
  await pool.end();
}
