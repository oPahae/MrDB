import pool from '../_connect';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'ID مطلوب' });

  try {
    const [result] = await pool.query('DELETE FROM series WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'السلسلة غير موجودة' });
    }

    return res.status(200).json({ success: true, message: 'تم حذف السلسلة بنجاح' });
  } catch (err) {
    console.error('deleteSeries error:', err);
    return res.status(500).json({ error: 'فشل الحذف: ' + err.message });
  }
}