import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export function verifyAuth(req, res) {
  const token = req.cookies?.userAuthToken;

  if (!token) {
    return null;
  }

  try {
    const user = jwt.verify(token, JWT_SECRET);
    return { id: user.id, name: user.name, email: user.email };
  } catch (error) {
    console.error("Invalid token", error);
    return null;
  }
}