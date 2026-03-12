import pool from "../_connect";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: "معرّف المستخدم مطلوب" });

  try {
    const [rows] = await pool.query(
      `SELECT
         f.id AS favID,
         sr.id,
         sr.title,
         sr.otherTitle,
         sr.img,
         sr.type,
         sr.rating,
         sr.finished
       FROM favorites f
       JOIN series sr ON f.seriesID = sr.id
       WHERE f.userID = ?
       ORDER BY f.id DESC`,
      [id]
    );
    return res.status(200).json({ favorites: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}