import pool from "../_connect";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password } = req.body;

  // ── Basic validation ──
  if (!email?.trim() || !password) {
    return res.status(400).json({ error: "البريد الإلكتروني وكلمة المرور مطلوبان" });
  }

  try {
    // ── Fetch user ──
    const [rows] = await pool.query(
      "SELECT id, name, email, password FROM users WHERE email = ?",
      [email.toLowerCase().trim()]
    );

    if (rows.length === 0) {
      // Generic message to avoid user enumeration
      return res.status(401).json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
    }

    const user = rows[0];

    // ── Verify password ──
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(401).json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
    }

    // ── Generate JWT & set cookie ──
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
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

    return res.status(200).json({
      message: "تم تسجيل الدخول بنجاح",
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "حدث خطأ في الخادم" });
  }
}
