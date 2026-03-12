import pool from "../_connect";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const {
    page = 1,
    limit = 24,
    type,
    search,
    sort = "rating", // rating | number
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
      where.push("(ep.title LIKE ? OR sr.title LIKE ?)");
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    const whereSQL = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const orderSQL =
      sort === "number"
        ? "ORDER BY ep.number ASC"
        : "ORDER BY ep.rating DESC, ep.id DESC";

    // Count total
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total
       FROM episodes ep
       JOIN seasons sn ON ep.seasonID = sn.id
       JOIN series sr ON sn.serieID = sr.id
       ${whereSQL}`,
      params
    );

    // Fetch episodes with number of ratings
    const [rows] = await pool.query(
      `SELECT
         ep.id,
         ep.number,
         ep.title,
         ep.img,
         ep.rating,
         sn.id AS seasonID,
         sn.title AS seasonTitle,
         sn.number AS seasonNumber,
         sr.id AS seriesID,
         sr.title AS seriesTitle,
         sr.img AS seriesImg,
         sr.type AS seriesType,
         COUNT(re.userID) AS totalRatings
       FROM episodes ep
       JOIN seasons sn ON ep.seasonID = sn.id
       JOIN series sr ON sn.serieID = sr.id
       LEFT JOIN ratingep re ON re.episodeID = ep.id
       ${whereSQL}
       GROUP BY ep.id
       ${orderSQL}
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    return res.status(200).json({
      episodes: rows,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}