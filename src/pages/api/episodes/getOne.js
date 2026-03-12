import pool from "../_connect";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  const { id, userID } = req.query;
  if (!id) return res.status(400).json({ error: "id required" });

  try {
    // Episode + season + series info
    const [[episode]] = await pool.query(
      `SELECT e.*, 
        se.title AS seasonTitle, se.serieID,
        s.title AS seriesTitle, s.img AS seriesImg, s.type AS seriesType
       FROM episodes e
       JOIN seasons se ON se.id = e.seasonID
       JOIN series s ON s.id = se.serieID
       WHERE e.id = ?`,
      [id]
    );
    if (!episode) return res.status(404).json({ error: "not found" });

    // All raw ratings
    const [rawRatings] = await pool.query(
      `SELECT r.id, r.userID, r.rating, r.feedback, u.name AS userName
       FROM ratingep r
       JOIN users u ON u.id = r.userID
       WHERE r.episodeID = ?
       ORDER BY r.id DESC`,
      [id]
    );

    // Distribution
    const distMap = {};
    rawRatings.forEach(({ rating }) => {
      distMap[rating] = (distMap[rating] || 0) + 1;
    });
    const distribution = Object.entries(distMap)
      .map(([rating, count]) => ({ rating: Number(rating), count }))
      .sort((a, b) => a.rating - b.rating);

    // Reviews (all rawRatings with feedback text)
    const reviews = rawRatings.map(({ id, userID: uid, userName, rating, feedback }) => ({
      id, userID: uid, userName, rating, feedback,
    }));

    // User's own rating
    let userRating = null;
    if (userID) {
      const own = rawRatings.find((r) => String(r.userID) === String(userID));
      if (own) userRating = { rating: own.rating, feedback: own.feedback };
    }

    res.json({
      episode,
      distribution,
      reviews,
      userRating,
      total: rawRatings.length,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "db error" });
  }
}