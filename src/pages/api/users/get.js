import pool from "../_connect";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: "معرّف المستخدم مطلوب" });

  try {
    const [[user]] = await pool.query(
      "SELECT id, name, email FROM users WHERE id = ?",
      [id]
    );
    if (!user) return res.status(404).json({ error: "المستخدم غير موجود" });
    return res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}