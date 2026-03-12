import pool from "../_connect";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  const { seriesID, seasonID } = req.query;

  try {
    if (seasonID) {
      // Get episodes for a specific season
      const [episodes] = await pool.query(
        `SELECT e.*, COUNT(r.id) AS ratingCount
         FROM episodes e
         LEFT JOIN ratingep r ON r.episodeID = e.id
         WHERE e.seasonID = ?
         GROUP BY e.id
         ORDER BY e.number ASC`,
        [seasonID]
      );
      return res.json(episodes);
    }

    if (seriesID) {
      // Get all seasons for a series
      const [seasons] = await pool.query(
        `SELECT se.*, COUNT(e.id) AS episodeCount
         FROM seasons se
         LEFT JOIN episodes e ON e.seasonID = se.id
         WHERE se.serieID = ?
         GROUP BY se.id
         ORDER BY se.id ASC`,
        [seriesID]
      );
      return res.json(seasons);
    }

    res.status(400).json({ error: "seriesID or seasonID required" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "db error" });
  }
}
