import pool from '../_connect';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'ID مطلوب' });

  try {
    // 1. Get series info
    const [seriesRows] = await pool.query(
      'SELECT * FROM series WHERE id = ?',
      [id]
    );

    if (seriesRows.length === 0) {
      return res.status(404).json({ error: 'السلسلة غير موجودة' });
    }

    const serie = seriesRows[0];

    // 2. Get seasons
    const [seasonsRows] = await pool.query(
      'SELECT * FROM seasons WHERE serieID = ? ORDER BY id ASC',
      [id]
    );

    // 3. Get all episodes for all seasons in one query
    const seasonIDs = seasonsRows.map((s) => s.id);

    let episodesRows = [];
    if (seasonIDs.length > 0) {
      const placeholders = seasonIDs.map(() => '?').join(',');
      [episodesRows] = await pool.query(
        `SELECT * FROM episodes WHERE seasonID IN (${placeholders}) ORDER BY seasonID ASC, number ASC`,
        seasonIDs
      );
    }

    // 4. Group episodes by seasonID
    const episodesBySeason = {};
    for (const ep of episodesRows) {
      if (!episodesBySeason[ep.seasonID]) episodesBySeason[ep.seasonID] = [];
      episodesBySeason[ep.seasonID].push({
        id: ep.id,
        number: ep.number,
        title: ep.title,
        img: ep.img || '',
      });
    }

    // 5. Build full response
    const seasons = seasonsRows.map((s) => ({
      id: s.id,
      title: s.title,
      episodes: episodesBySeason[s.id] || [],
    }));

    return res.status(200).json({
      id: serie.id,
      title: serie.title,
      img: serie.img || '',
      trailer: serie.trailer || '',
      descr: serie.descr || '',
      type: serie.type,
      finished: serie.finished,
      start: serie.start ? serie.start.toISOString().split('T')[0] : '',
      end: serie.end ? serie.end.toISOString().split('T')[0] : '',
      maker: serie.maker || '',
      rating: serie.rating,
      seasons,
    });
  } catch (err) {
    console.error('getSeries error:', err);
    return res.status(500).json({ error: 'فشل جلب البيانات: ' + err.message });
  }
}
