import pool from "../_connect";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: "id required" });

  try {
    const [[serie]] = await pool.query(
      `SELECT s.*,
        COUNT(DISTINCT se.id) AS seasons,
        COUNT(DISTINCT e.id) AS episodes
       FROM series s
       LEFT JOIN seasons se ON se.serieID = s.id
       LEFT JOIN episodes e ON e.seasonID = se.id
       WHERE s.id = ?
       GROUP BY s.id`,
      [id]
    );
    if (!serie) return res.status(404).json({ error: "not found" });

    res.status(200).json(serie);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "db error" });
  }
}