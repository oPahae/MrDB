import pool from "../_connect";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const {
    page = 1,
    limit = 24,
    type,
    search,
    sort = "rating", // rating | title
  } = req.query;

  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    let where = [];
    let params = [];

    if (type && type !== "all") {
      where.push("sr.type = ?");
      params.push(type);
    }

    if (search && search.trim()) {
      where.push("(sr.title LIKE ? OR sr.otherTitle LIKE ?)");
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    const whereSQL = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const orderSQL =
      sort === "title"
        ? "ORDER BY sr.title ASC"
        : "ORDER BY sr.rating DESC, sr.id DESC";

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM series sr ${whereSQL}`,
      params
    );

    const [rows] = await pool.query(
      `SELECT
         sr.id,
         sr.title,
         sr.otherTitle,
         sr.img,
         sr.type,
         sr.rating,
         sr.finished,
         sr.start,
         sr.end,
         sr.maker,
         COUNT(DISTINCT sn.id) AS seasonCount,
         COUNT(DISTINCT ep.id) AS episodeCount
       FROM series sr
       LEFT JOIN seasons sn ON sn.serieID = sr.id
       LEFT JOIN episodes ep ON ep.seasonID = sn.id
       ${whereSQL}
       GROUP BY sr.id
       ${orderSQL}
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    return res.status(200).json({
      series: rows,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}