import pool from './_connect';

export default async function handler(req, res) {
//   if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  return;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Delete in FK-safe order: episodes → seasons → series
    // (favorites, ratingep, ratingSR cascade automatically via ON DELETE CASCADE)
    const [ep] = await conn.execute(`DELETE FROM episodes`);
    const [sn] = await conn.execute(`DELETE FROM seasons`);
    const [sr] = await conn.execute(`DELETE FROM series`);

    // Reset auto-increment counters
    await conn.execute(`ALTER TABLE episodes AUTO_INCREMENT = 1`);
    await conn.execute(`ALTER TABLE seasons AUTO_INCREMENT = 1`);
    await conn.execute(`ALTER TABLE series AUTO_INCREMENT = 1`);

    await conn.commit();

    console.log(`🗑️  Reset done: ${sr.affectedRows} series, ${sn.affectedRows} seasons, ${ep.affectedRows} episodes deleted.`);

    return res.status(200).json({
      success: true,
      deleted: {
        series: sr.affectedRows,
        seasons: sn.affectedRows,
        episodes: ep.affectedRows,
      },
    });
  } catch (err) {
    await conn.rollback();
    console.error('❌ Reset failed:', err);
    return res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
}