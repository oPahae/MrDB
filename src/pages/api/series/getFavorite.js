import pool from '../_connect';

export default async function handler(req, res) {
  const { userID, seriesID } = req.query;
  if (!userID || !seriesID) return res.status(400).json({ error: 'Missing params' });

  const [rows] = await pool.query(
    'SELECT id FROM favorites WHERE userID = ? AND seriesID = ?',
    [userID, seriesID]
  );
  res.json({ isFavorite: rows.length > 0 });
}