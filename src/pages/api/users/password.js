import pool from "../_connect";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "PUT") return res.status(405).json({ error: "Method not allowed" });

  const { id, currentPassword, newPassword } = req.body;
  if (!id || !currentPassword || !newPassword)
    return res.status(400).json({ error: "بيانات ناقصة" });

  if (newPassword.length < 4)
    return res.status(400).json({ error: "كلمة المرور يجب أن تكون 4 أحرف على الأقل" });

  try {
    const [[user]] = await pool.query("SELECT password FROM users WHERE id = ?", [id]);
    if (!user) return res.status(404).json({ error: "المستخدم غير موجود" });

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(401).json({ error: "كلمة المرور الحالية غير صحيحة" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password = ? WHERE id = ?", [hashed, id]);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}