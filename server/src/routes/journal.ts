import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, roleGuard, AuthRequest } from '../middleware';

const router = Router();
const prisma = new PrismaClient();

router.get('/:scheduleId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const schedule = await prisma.schedule.findUnique({
      where: { id: req.params.scheduleId },
      include: {
        group: { include: { students: true } },
        attendances: true,
        grades: true,
      }
    });
    if (!schedule) return res.status(404).json({ error: 'Расписание не найдено' });
    res.json(schedule);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.post('/attendance', authMiddleware, roleGuard('TEACHER'), async (req: AuthRequest, res: Response) => {
  try {
    const { scheduleId, studentId, status } = req.body;
    const attendance = await prisma.attendance.upsert({
      where: { studentId_scheduleId: { studentId, scheduleId } },
      update: { status },
      create: { studentId, scheduleId, status }
    });
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.post('/grade', authMiddleware, roleGuard('TEACHER'), async (req: AuthRequest, res: Response) => {
  try {
    const { scheduleId, studentId, value, comment } = req.body;
    if (typeof value !== 'number' || value < 1 || value > 10) {
      return res.status(400).json({ error: 'Оценка должна быть числом от 1 до 10' });
    }
    const grade = await prisma.grade.create({
      data: { studentId, scheduleId, value, comment: comment || '', createdAt: new Date().toISOString() }
    });
    res.json(grade);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.post('/add-day', authMiddleware, roleGuard('TEACHER'), async (req: AuthRequest, res: Response) => {
  try {
    const { date, startTime, endTime, room, subjectId, groupId } = req.body;
    const schedule = await prisma.schedule.create({
      data: { date, startTime, endTime, room, subjectId, groupId }
    });
    res.json(schedule);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;