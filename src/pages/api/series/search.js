import pool from "../_connect";

const LIMIT = 6;

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "الطريقة غير مسموح بها" });
  }

  try {
    const q = (req.query.q || "").trim();
    if (!q) {
      return res.status(200).json([]);
    }

    const like = `%${q}%`;

    const [rows] = await pool.query(
      `
      SELECT
        s.id,
        s.title,
        s.otherTitle,
        s.img,
        s.type,
        s.maker,
        COALESCE(ROUND(AVG(NULLIF(ep.rating, 0)), 1), 0) AS rating
      FROM series s
      LEFT JOIN seasons  sn ON sn.serieID  = s.id
      LEFT JOIN episodes ep ON ep.seasonID = sn.id
      WHERE s.title LIKE ? OR s.otherTitle LIKE ?
      GROUP BY s.id, s.title, s.otherTitle, s.img, s.type, s.maker
      ORDER BY
        CASE
          WHEN s.title      = ?    THEN 0
          WHEN s.title      LIKE ? THEN 1
          WHEN s.otherTitle = ?    THEN 2
          WHEN s.otherTitle LIKE ? THEN 3
          ELSE 4
        END,
        rating DESC
      LIMIT ?
      `,
      [like, like, q, `${q}%`, q, `${q}%`, LIMIT]
    );

    return res.status(200).json(rows);
  } catch (error) {
    console.error("[/api/series/searchHeader]", error);
    return res.status(500).json({ error: "خطأ في الخادم، حاول مجدداً لاحقاً" });
  }
}