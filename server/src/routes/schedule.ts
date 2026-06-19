import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware';

const router = Router();
const prisma = new PrismaClient();

router.get('/my', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    let schedules;
    if (user.role === 'STUDENT') {
      schedules = await prisma.schedule.findMany({
        where: { groupId: user.groupId! },
        include: { subject: true, group: true },
        orderBy: { date: 'asc' }
      });
    } else {
      const teacherSubjects = await prisma.subjectTeacher.findMany({
        where: { teacherId: user.id },
        select: { subjectId: true }
      });
      schedules = await prisma.schedule.findMany({
        where: { subjectId: { in: teacherSubjects.map(ts => ts.subjectId) } },
        include: { subject: true, group: true },
        orderBy: { date: 'asc' }
      });
    }
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;