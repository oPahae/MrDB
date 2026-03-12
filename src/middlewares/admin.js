import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export function verifyAuth(req, res) {
  const token = req.cookies?.adminAuthToken;

  if (!token) {
    return null;
  }

  try {
    const admin = jwt.verify(token, JWT_SECRET);
    return { connected: true };
  } catch (error) {
    console.error("Invalid token", error);
    return null;
  }
}