import pool from '../_connect';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const {
    title, img, trailer, descr, finished,
    type, start, end, maker, seasons,
  } = req.body;

  if (!title || !title.trim()) return res.status(400).json({ error: 'العنوان مطلوب' });
  if (!img || !img.trim()) return res.status(400).json({ error: 'رابط الصورة مطلوب' });
  if (!type) return res.status(400).json({ error: 'النوع مطلوب' });

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // Count total episodes and seasons for denormalized fields
    const totalSeasons = Array.isArray(seasons) ? seasons.length : 0;
    const totalEpisodes = Array.isArray(seasons)
      ? seasons.reduce((acc, s) => acc + (Array.isArray(s.episodes) ? s.episodes.length : 0), 0)
      : 0;

    // Insert series
    const [seriesResult] = await conn.query(
      `INSERT INTO series (title, img, trailer, descr, finished, type, start, end, maker, rating)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [
        title.trim(),
        img.trim(),
        trailer?.trim() || null,
        descr?.trim() || null,
        finished ? 1 : 0,
        type,
        start || null,
        end || null,
        maker?.trim() || null,
      ]
    );

    const seriesID = seriesResult.insertId;

    // Insert seasons and episodes
    if (Array.isArray(seasons) && seasons.length > 0) {
      for (const season of seasons) {
        const seasonTitle = season.title?.trim() || 'موسم جديد';

        const [seasonResult] = await conn.query(
          'INSERT INTO seasons (serieID, title) VALUES (?, ?)',
          [seriesID, seasonTitle]
        );

        const seasonID = seasonResult.insertId;

        if (Array.isArray(season.episodes) && season.episodes.length > 0) {
          for (const ep of season.episodes) {
            if (!ep.title?.trim()) continue; // skip empty episodes

            await conn.query(
              'INSERT INTO episodes (seasonID, number, title, img, rating) VALUES (?, ?, ?, ?, 0)',
              [
                seasonID,
                parseInt(ep.number) || 1,
                ep.title.trim(),
                ep.img?.trim() || null,
              ]
            );
          }
        }
      }
    }

    await conn.commit();

    return res.status(201).json({
      success: true,
      id: seriesID,
      message: 'تمت إضافة السلسلة بنجاح',
    });
  } catch (err) {
    await conn.rollback();
    console.error('addSeries error:', err);
    return res.status(500).json({ error: 'فشل الحفظ: ' + err.message });
  } finally {
    conn.release();
  }
}
