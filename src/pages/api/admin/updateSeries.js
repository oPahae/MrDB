import pool from '../_connect';

export default async function handler(req, res) {
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });

  const {
    id, title, img, trailer, descr, finished,
    type, start, end, maker, seasons,
  } = req.body;

  if (!id) return res.status(400).json({ error: 'ID السلسلة مطلوب' });
  if (!title || !title.trim()) return res.status(400).json({ error: 'العنوان مطلوب' });
  if (!img || !img.trim()) return res.status(400).json({ error: 'رابط الصورة مطلوب' });
  if (!type) return res.status(400).json({ error: 'النوع مطلوب' });

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 1. Update the series info
    await conn.query(
      `UPDATE series SET
        title = ?, img = ?, trailer = ?, descr = ?,
        finished = ?, type = ?, start = ?, end = ?, maker = ?
       WHERE id = ?`,
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
        id,
      ]
    );

    // 2. Get current season IDs for this series (to detect deleted ones)
    const [existingSeasons] = await conn.query(
      'SELECT id FROM seasons WHERE serieID = ?',
      [id]
    );
    const existingSeasonIDs = existingSeasons.map((s) => s.id);

    // 3. Collect season IDs sent from the client (existing ones have an id field)
    const incomingSeasonIDs = (seasons || [])
      .filter((s) => s.id)
      .map((s) => s.id);

    // 4. Delete seasons that were removed on the client (cascade deletes their episodes)
    const seasonIDsToDelete = existingSeasonIDs.filter(
      (sid) => !incomingSeasonIDs.includes(sid)
    );
    if (seasonIDsToDelete.length > 0) {
      await conn.query(
        `DELETE FROM seasons WHERE id IN (${seasonIDsToDelete.map(() => '?').join(',')})`,
        seasonIDsToDelete
      );
    }

    // 5. Upsert seasons and episodes
    if (Array.isArray(seasons) && seasons.length > 0) {
      for (const season of seasons) {
        const seasonTitle = season.title?.trim() || 'موسم جديد';
        let seasonID = season.id;

        if (seasonID) {
          // Update existing season title
          await conn.query(
            'UPDATE seasons SET title = ? WHERE id = ?',
            [seasonTitle, seasonID]
          );
        } else {
          // Insert new season
          const [seasonResult] = await conn.query(
            'INSERT INTO seasons (serieID, title) VALUES (?, ?)',
            [id, seasonTitle]
          );
          seasonID = seasonResult.insertId;
        }

        // Get existing episodes for this season
        const [existingEps] = await conn.query(
          'SELECT id FROM episodes WHERE seasonID = ?',
          [seasonID]
        );
        const existingEpIDs = existingEps.map((e) => e.id);

        // Incoming episode IDs (existing ones have an id)
        const incomingEpIDs = (season.episodes || [])
          .filter((ep) => ep.id)
          .map((ep) => ep.id);

        // Delete removed episodes
        const epIDsToDelete = existingEpIDs.filter(
          (eid) => !incomingEpIDs.includes(eid)
        );
        if (epIDsToDelete.length > 0) {
          await conn.query(
            `DELETE FROM episodes WHERE id IN (${epIDsToDelete.map(() => '?').join(',')})`,
            epIDsToDelete
          );
        }

        // Upsert each episode
        if (Array.isArray(season.episodes)) {
          for (const ep of season.episodes) {
            if (!ep.title?.trim()) continue; // skip empty episodes

            if (ep.id) {
              // Update existing episode
              await conn.query(
                'UPDATE episodes SET number = ?, title = ?, img = ? WHERE id = ?',
                [
                  parseInt(ep.number) || 1,
                  ep.title.trim(),
                  ep.img?.trim() || null,
                  ep.id,
                ]
              );
            } else {
              // Insert new episode
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
    }

    await conn.commit();

    return res.status(200).json({
      success: true,
      id: Number(id),
      message: 'تم تحديث السلسلة بنجاح',
    });
  } catch (err) {
    await conn.rollback();
    console.error('updateSeries error:', err);
    return res.status(500).json({ error: 'فشل التحديث: ' + err.message });
  } finally {
    conn.release();
  }
}