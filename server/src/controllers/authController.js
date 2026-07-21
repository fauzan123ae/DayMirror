import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, queryOne } from '../db/index.js';

const formatUser = (u) => ({
  id:        u.id,
  name:      u.name,
  email:     u.email,
  goal:      u.goal,
  streak:    u.streak || 0,
  joinedAt:  u.joined_at,
  aiCompanion: u.ai_companion || { name: 'Mirror', avatar: '🥑' },
  stickers:  u.stickers,
});

const makeToken = (user) =>
  jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

export async function register(req, res) {
  const { name, email, password, goal } = req.body;
  if (!name || !email || !password)
    return res.status(422).json({ message: 'Nama, email, dan password wajib diisi.' });
  if (password.length < 6)
    return res.status(422).json({ message: 'Password minimal 6 karakter.' });

  try {
    const exists = await queryOne('SELECT id FROM users WHERE email=$1', [email]);
    if (exists) return res.status(422).json({ message: 'Email sudah terdaftar.' });

    const hashed = await bcrypt.hash(password, 12);
    const result = await query(
      `INSERT INTO users (name, email, password, goal)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, email, hashed, goal || null]
    );
    const user = result.rows[0];
    return res.status(201).json({ token: makeToken(user), user: formatUser(user) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
}

export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(422).json({ message: 'Email dan password wajib diisi.' });

  try {
    const user = await queryOne('SELECT * FROM users WHERE email=$1', [email]);
    if (!user) return res.status(401).json({ message: 'Email atau kata sandi salah.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Email atau kata sandi salah.' });

    return res.json({ token: makeToken(user), user: formatUser(user) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
}

export async function me(req, res) {
  return res.json(formatUser(req.user));
}

export async function updateProfile(req, res) {
  const { name, goal, aiCompanion, stickers } = req.body;
  try {
    const fields = [];
    const values = [];
    let idx = 1;

    if (name !== undefined)        { fields.push(`name=$${idx++}`);         values.push(name); }
    if (goal !== undefined)        { fields.push(`goal=$${idx++}`);         values.push(goal); }
    if (aiCompanion !== undefined) { fields.push(`ai_companion=$${idx++}`); values.push(JSON.stringify(aiCompanion)); }
    if (stickers !== undefined)    { fields.push(`stickers=$${idx++}`);     values.push(JSON.stringify(stickers)); }

    if (fields.length === 0) return res.status(422).json({ message: 'Tidak ada data yang diupdate.' });

    values.push(req.user.id);
    const result = await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id=$${idx} RETURNING *`,
      values
    );
    return res.json({ user: formatUser(result.rows[0]) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
}

export async function updateStreak(req, res) {
  const { streak } = req.body;
  try {
    const result = await query(
      'UPDATE users SET streak=$1 WHERE id=$2 RETURNING *',
      [streak, req.user.id]
    );
    return res.json({ user: formatUser(result.rows[0]) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
}

export async function changePassword(req, res) {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword)
    return res.status(422).json({ message: 'Password lama dan baru wajib diisi.' });
  if (newPassword.length < 6)
    return res.status(422).json({ message: 'Password baru minimal 6 karakter.' });

  try {
    const match = await bcrypt.compare(oldPassword, req.user.password);
    if (!match) return res.status(401).json({ message: 'Password lama salah.' });

    const hashed = await bcrypt.hash(newPassword, 12);
    await query('UPDATE users SET password=$1 WHERE id=$2', [hashed, req.user.id]);
    return res.json({ message: 'Password berhasil diubah.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
}

export async function deleteAccount(req, res) {
  const { password } = req.body;
  if (!password) return res.status(422).json({ message: 'Password wajib diisi.' });

  try {
    const match = await bcrypt.compare(password, req.user.password);
    if (!match) return res.status(401).json({ message: 'Password salah.' });

    await query('DELETE FROM users WHERE id=$1', [req.user.id]);
    return res.json({ message: 'Akun berhasil dihapus.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
}
