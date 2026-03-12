import pool from "../_connect";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { userID, episodeID, rating, feedback } = req.body;

  if (!userID || !episodeID || rating == null)
    return res.status(400).json({ error: "missing fields" });

  if (rating < 1 || rating > 10)
    return res.status(400).json({ error: "rating must be 1-10" });

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // Upsert rating
    await conn.query(
      `INSERT INTO ratingep (userID, episodeID, rating, feedback)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE rating = VALUES(rating), feedback = VALUES(feedback)`,
      [userID, episodeID, String(rating), feedback]
    );

    // Recalculate episode rating
    const [[{ avg }]] = await conn.query(
      `SELECT AVG(CAST(rating AS DECIMAL(3,1))) AS avg
       FROM ratingep
       WHERE episodeID = ? AND rating REGEXP '^[0-9]+$'`,
      [episodeID]
    );

    const episodeAvg = avg || 0;

    await conn.query(
      `UPDATE episodes SET rating = ? WHERE id = ?`,
      [episodeAvg, episodeID]
    );

    // ─────────────────────────────
    // Get seriesID of this episode
    // ─────────────────────────────
    const [[row]] = await conn.query(
      `SELECT s.serieID
       FROM episodes e
       JOIN seasons s ON e.seasonID = s.id
       WHERE e.id = ?`,
      [episodeID]
    );

    const seriesID = row?.serieID;

    if (seriesID) {
      // Calculate series rating from episodes
      const [[{ seriesAvg }]] = await conn.query(
        `SELECT AVG(e.rating) AS seriesAvg
         FROM episodes e
         JOIN seasons s ON e.seasonID = s.id
         WHERE s.serieID = ?
         AND e.rating >= 1`,
        [seriesID]
      );

      await conn.query(
        `UPDATE series SET rating = ? WHERE id = ?`,
        [seriesAvg || 0, seriesID]
      );
    }

    await conn.commit();

    res.json({
      success: true,
      newEpisodeAvg: Number(episodeAvg).toFixed(1)
    });

  } catch (e) {
    await conn.rollback();
    console.error(e);
    res.status(500).json({ error: "db error" });
  } finally {
    conn.release();
  }
}