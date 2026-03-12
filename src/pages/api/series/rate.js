import pool from "../_connect";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userID, seriesID, rating, feedback } = req.body;

  if (!userID || !seriesID || !rating) {
    return res.status(400).json({ error: "Missing data" });
  }

  try {

    // insert or update rating
    await pool.query(
      `
      INSERT INTO ratingSR (userID, seriesID, rating, feedback)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        rating = VALUES(rating),
        feedback = VALUES(feedback)
      `,
      [userID, seriesID, rating, feedback || null]
    );

    // recalculate series rating
    const [[avg]] = await pool.query(
      `
      SELECT ROUND(AVG(CAST(rating AS DECIMAL(3,1))),1) as avgRating
      FROM ratingSR
      WHERE seriesID = ?
      `,
      [seriesID]
    );

    const newRating = avg.avgRating || 0;

    // update series table
    await pool.query(
      `UPDATE series SET rating = ? WHERE id = ?`,
      [newRating, seriesID]
    );

    res.status(200).json({
      success: true,
      rating: newRating
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
}