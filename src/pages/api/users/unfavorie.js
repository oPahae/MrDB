import pool from "../_connect";

export default async function handler(req, res) {
  if (req.method !== "DELETE") return res.status(405).json({ error: "Method not allowed" });

  const { userID, seriesID } = req.body;
  if (!userID || !seriesID) return res.status(400).json({ error: "بيانات ناقصة" });

  try {
    await pool.query("DELETE FROM favorites WHERE userID = ? AND seriesID = ?", [userID, seriesID]);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}