import jwt from "jsonwebtoken";

import dotenv from "dotenv";

dotenv.config();

// 1 - read token from request header
//         ↓
// 2 - check if token exists
//         ↓
// 3 - verify token with jwt.verify()
//         ↓
// 4 - if valid → attach user info to request → next()
//         ↓
// 5 - if invalid → return 401

const auth = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({
      massage: "no token provided",
    });
  }
  const token = header.split(" ")[1];
  // split by space → ["Bearer", "eyJhbGci..."]
  // [1] → gets the token part only

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // attach user info to request
    req.user = decoded;
    // continue to the route
    console.log("DECODED USER:", req.user);
    next();
  } catch (err) {
    res.status(401).json({ err: "Invalid token" });
  }
};

export default auth;
