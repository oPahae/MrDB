import pool from "../_connect";

const PAGE_SIZE = 20;

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "الطريقة غير مسموح بها" });
  }

  try {
    const q = (req.query.q || "").trim();
    if (!q) {
      return res.status(400).json({ error: "يرجى إدخال كلمة للبحث" });
    }

    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || PAGE_SIZE));
    const offset = (page - 1) * limit;

    const type = req.query.type || null;
    const sort = req.query.sort || "rating";

    // ── WHERE clause ──────────────────────────────────────────────────────────
    const conditions = [];
    const params     = [];

    // Full-text search on title + otherTitle (with LIKE fallback for broad match)
    conditions.push("(s.title LIKE ? OR s.otherTitle LIKE ?)");
    const like = `%${q}%`;
    params.push(like, like);

    if (type && ["anime", "series", "kdrama", "other"].includes(type)) {
      conditions.push("s.type = ?");
      params.push(type);
    }

    const where = `WHERE ${conditions.join(" AND ")}`;

    // ── ORDER BY ──────────────────────────────────────────────────────────────
    const ORDER_MAP = {
      rating:   "rating DESC",
      newest:   "s.start DESC",
      oldest:   "s.start ASC",
      episodes: "episodes DESC",
    };

    // Boost exact / starts-with matches to the top, then apply chosen sort
    const relevance = `
      CASE
        WHEN s.title = ?        THEN 0
        WHEN s.title LIKE ?     THEN 1
        WHEN s.otherTitle = ?   THEN 2
        WHEN s.otherTitle LIKE ? THEN 3
        ELSE 4
      END
    `;
    const relevanceParams = [q, `${q}%`, q, `${q}%`];

    const orderBy = `${relevance}, ${ORDER_MAP[sort] || "rating DESC"}`;

    // ── Count ─────────────────────────────────────────────────────────────────
    const [countRows] = await pool.query(
      `SELECT COUNT(DISTINCT s.id) AS total FROM series s ${where}`,
      params
    );
    const total      = countRows[0].total;
    const totalPages = Math.ceil(total / limit);

    // ── Fetch page ────────────────────────────────────────────────────────────
    const [rows] = await pool.query(
      `
      SELECT
        s.id,
        s.title,
        s.otherTitle,
        s.img,
        s.descr,
        s.finished,
        s.type,
        YEAR(s.start)                        AS start,
        YEAR(s.end)                          AS end,
        s.maker,
        COUNT(DISTINCT sn.id)                AS seasons,
        COUNT(DISTINCT ep.id)                AS episodes,
        COALESCE(ROUND(
          AVG(NULLIF(ep.rating, 0)), 1
        ), 0)                                AS rating
      FROM series s
      LEFT JOIN seasons  sn ON sn.serieID  = s.id
      LEFT JOIN episodes ep ON ep.seasonID = sn.id
      ${where}
      GROUP BY
        s.id, s.title, s.otherTitle, s.img, s.descr,
        s.finished, s.type, s.start, s.end, s.maker
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
      `,
      [...params, ...relevanceParams, limit, offset]
    );

    return res.status(200).json({
      data: rows,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        query:   q,
      },
    });
  } catch (error) {
    console.error("[/api/series/search]", error);
    return res.status(500).json({ error: "خطأ في الخادم، حاول مجدداً لاحقاً" });
  }
}
