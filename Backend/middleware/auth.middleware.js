import jwt from "jsonwebtoken";
import redisClient from "../services/redis.service.js";

export const authUser = async (req, res, next) => {
  try {
    // Safely get token from either cookie or header
    const authHeader = req.headers.authorization;
    const token =
      req.cookies?.token ||
      (authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null);

    if (!token) {
      return res.status(401).send({ error: "Unauthorized User - No token" });
    }

    // Check Redis blacklist
    const isBlackListed = await redisClient.get(token);
    if (isBlackListed) {
      res.cookie("token", "");
      return res.status(401).send({ error: "Unauthorized User - Blacklisted" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    return res.status(401).send({ error: "Unauthorized User - Invalid token" });
  }
};
