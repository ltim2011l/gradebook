import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import authRoutes from './routes/auth';
import scheduleRoutes from './routes/schedule';
import journalRoutes from './routes/journal';
import subjectsRoutes from './routes/subjects';
import labsRoutes from './routes/labs';

const app = express();
const PORT = 3001;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/subjects', subjectsRoutes);
app.use('/api/labs', labsRoutes);

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});