import { query, queryOne } from '../db/index.js';

function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

// ─── REFLECTIONS ──────────────────────────────────────────────
export async function getReflections(req, res) {
  try {
    const result = await query(
      'SELECT * FROM reflections WHERE user_id=$1 ORDER BY date DESC',
      [req.user.id]
    );
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Gagal mengambil refleksi.' });
  }
}

export async function upsertReflection(req, res) {
  const { date, mood, good_things, obstacles, tomorrow_goal, ai_summary, ai_advice } = req.body;
  const targetDate = date || getTodayStr();

  try {
    const result = await query(
      `INSERT INTO reflections (user_id, date, mood, good_things, obstacles, tomorrow_goal, ai_summary, ai_advice)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (user_id, date) DO UPDATE SET
         mood=$3, good_things=$4, obstacles=$5,
         tomorrow_goal=$6, ai_summary=$7, ai_advice=$8
       RETURNING *`,
      [req.user.id, targetDate, mood, good_things, obstacles, tomorrow_goal, ai_summary, ai_advice]
    );
    return res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Gagal menyimpan refleksi.' });
  }
}

export async function deleteReflection(req, res) {
  const { id } = req.params;
  try {
    await query('DELETE FROM reflections WHERE id=$1 AND user_id=$2', [id, req.user.id]);
    return res.json({ message: 'Refleksi dihapus.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Gagal menghapus refleksi.' });
  }
}

// ─── DAILY GOALS ──────────────────────────────────────────────
export async function getDailyGoals(req, res) {
  const today = getTodayStr();
  try {
    const result = await queryOne(
      'SELECT * FROM daily_goals WHERE user_id=$1 AND date=$2',
      [req.user.id, today]
    );
    return res.json(result?.items || null);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Gagal mengambil goals.' });
  }
}

export async function upsertDailyGoals(req, res) {
  const { items, date } = req.body;
  const targetDate = date || getTodayStr();
  try {
    const result = await query(
      `INSERT INTO daily_goals (user_id, date, items)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, date) DO UPDATE SET items=$3
       RETURNING *`,
      [req.user.id, targetDate, JSON.stringify(items)]
    );
    return res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Gagal menyimpan goals.' });
  }
}

// ─── WEEKLY REPORTS ───────────────────────────────────────────
export async function getWeeklyReport(req, res) {
  try {
    const result = await query(
      'SELECT * FROM weekly_reports WHERE user_id=$1 ORDER BY created_at DESC LIMIT 1',
      [req.user.id]
    );
    const weekly = result.rows[0] || null;
    if (weekly) {
      const diffDays = (Date.now() - new Date(weekly.created_at).getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays > 7) return res.json(null);
    }
    return res.json(weekly);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Gagal mengambil laporan mingguan.' });
  }
}

export async function saveWeeklyReport(req, res) {
  const { date_generated, achievements, challenges, trends, recommendations } = req.body;
  try {
    const result = await query(
      `INSERT INTO weekly_reports (user_id, date_generated, achievements, challenges, trends, recommendations)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [req.user.id, date_generated, JSON.stringify(achievements), JSON.stringify(challenges), trends, JSON.stringify(recommendations)]
    );
    return res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Gagal menyimpan laporan mingguan.' });
  }
}
