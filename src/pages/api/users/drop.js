import pool from "../_connect";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "DELETE") return res.status(405).json({ error: "Method not allowed" });

  const { id, password } = req.body;
  if (!id || !password) return res.status(400).json({ error: "بيانات ناقصة" });

  try {
    const [[user]] = await pool.query("SELECT password FROM users WHERE id = ?", [id]);
    if (!user) return res.status(404).json({ error: "المستخدم غير موجود" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "كلمة المرور غير صحيحة" });

    await pool.query("DELETE FROM users WHERE id = ?", [id]);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}