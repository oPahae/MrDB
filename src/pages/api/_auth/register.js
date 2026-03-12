import pool from "../_connect";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, password } = req.body;

  // ── Basic validation ──
  if (!name?.trim() || !email?.trim() || !password) {
    return res.status(400).json({ error: "جميع الحقول مطلوبة" });
  }

  if (!/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ error: "بريد إلكتروني غير صالح" });
  }

  if (password.length < 4) {
    return res.status(400).json({ error: "يجب أن تكون كلمة المرور 4 أحرف على الأقل" });
  }

  try {
    // ── Check if email already exists ──
    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email.toLowerCase().trim()]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: "هذا البريد الإلكتروني مسجّل مسبقاً" });
    }

    // ── Hash password & insert ──
    const hashed = await bcrypt.hash(password, 12);

    const [result] = await pool.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name.trim(), email.toLowerCase().trim(), hashed]
    );

    const userId = result.insertId;

    // ── Generate JWT & set cookie ──
    const token = jwt.sign(
      { id: userId, name: name.trim(), email: email.toLowerCase().trim() },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.setHeader(
      "Set-Cookie",
      serialize("userAuthToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      })
    );

    return res.status(201).json({
      message: "تم إنشاء الحساب بنجاح",
      user: { id: userId, name: name.trim(), email: email.toLowerCase().trim() },
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: "حدث خطأ في الخادم" });
  }
}
