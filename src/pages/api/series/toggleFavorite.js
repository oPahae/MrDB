import pool from '../_connect';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { userID, seriesID } = req.body;
  if (!userID || !seriesID) return res.status(400).json({ error: 'Missing params' });

  const [existing] = await pool.query(
    'SELECT id FROM favorites WHERE userID = ? AND seriesID = ?',
    [userID, seriesID]
  );

  if (existing.length > 0) {
    await pool.query('DELETE FROM favorites WHERE userID = ? AND seriesID = ?', [userID, seriesID]);
    return res.json({ isFavorite: false });
  } else {
    await pool.query('INSERT INTO favorites (userID, seriesID) VALUES (?, ?)', [userID, seriesID]);
    return res.json({ isFavorite: true });
  }
}