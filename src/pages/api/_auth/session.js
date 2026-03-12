import { verifyAuth } from "@/middlewares/user";

export default function handler(req, res) {
  const user = verifyAuth(req, res);

  if (!user) {
    return res.json({ session: null });
  }

  res.json({
    session: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  });
}