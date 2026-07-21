import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import dataRoutes from './routes/data.js';

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok', app: 'DayMirror API' }));
app.use('/api/auth', authRoutes);
app.use('/api',      dataRoutes);

app.listen(PORT, () => {
  console.log(`🥑 DayMirror server running on port ${PORT}`);
});
