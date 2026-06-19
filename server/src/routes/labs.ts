import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, roleGuard, AuthRequest } from '../middleware';
import multer from 'multer';
import path from 'path';

const router = Router();
const prisma = new PrismaClient();

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads'),
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

router.post('/:templateId/submit', authMiddleware, upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const submission = await prisma.submission.create({
      data: {
        studentId: req.user!.id,
        templateId: req.params.templateId,
        fileUrl,
        submittedAt: new Date().toISOString()
      }
    });
    res.json(submission);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.get('/template/:templateId/submissions', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const submissions = await prisma.submission.findMany({
      where: { templateId: req.params.templateId },
      include: { student: true, team: true }
    });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.post('/submission/:id/review', authMiddleware, roleGuard('TEACHER'), async (req: AuthRequest, res: Response) => {
  try {
    const { score, comment } = req.body;
    const submission = await prisma.submission.update({
      where: { id: req.params.id },
      data: { score, comment }
    });
    res.json(submission);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;