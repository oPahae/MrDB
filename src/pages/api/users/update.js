import pool from "../_connect";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id, name, email } = req.body;

  if (!id || !name || !email) {
    return res.status(400).json({ error: "بيانات ناقصة" });
  }

  try {
    const [[existing]] = await pool.query(
      "SELECT id FROM users WHERE email = ? AND id != ?",
      [email, id]
    );

    if (existing) {
      return res.status(409).json({ error: "البريد الإلكتروني مستخدم مسبقاً" });
    }

    await pool.query(
      "UPDATE users SET name = ?, email = ? WHERE id = ?",
      [name, email, id]
    );

    // créer un nouveau token avec les nouvelles données
    const token = jwt.sign(
      { id, name, email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // mettre à jour le cookie de session
    res.setHeader(
      "Set-Cookie",
      `userAuthToken=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax`
    );

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}