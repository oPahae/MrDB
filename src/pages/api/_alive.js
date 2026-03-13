import pool from "./_connect";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const [total] = await pool.query(`SELECT COUNT(*) as total FROM users`);
    return res.status(200).json({ total });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}
