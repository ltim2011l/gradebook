import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware';

const router = Router();
const prisma = new PrismaClient();

router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    let subjects;
    if (user.role === 'TEACHER') {
      subjects = await prisma.subject.findMany({
        where: { teachers: { some: { teacherId: user.id } } },
        include: { templates: true }
      });
    } else {
      subjects = await prisma.subject.findMany({
        where: { schedules: { some: { groupId: user.groupId! } } },
        include: { templates: true }
      });
    }
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const subject = await prisma.subject.findUnique({
      where: { id: req.params.id },
      include: { templates: { include: { submissions: { include: { student: true } } } } }
    });
    if (!subject) return res.status(404).json({ error: 'Предмет не найден' });
    res.json(subject);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.post('/template', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { subjectId, type, title, description, maxScore, deadline, fileUrl, isTeamWork } = req.body;
    const template = await prisma.lessonTemplate.create({
      data: { subjectId, type, title, description, maxScore, deadline, fileUrl, isTeamWork }
    });
    res.json(template);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;