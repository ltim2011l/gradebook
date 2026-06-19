import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = 'gradebook-super-secret-key-2024';

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email }, include: { group: true } });
    if (!user) return res.status(400).json({ error: 'Неверный email или пароль' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Неверный email или пароль' });
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: false, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({
      id: user.id, email: user.email, role: user.role,
      firstName: user.firstName, lastName: user.lastName,
      groupId: user.groupId, group: user.group, isExpelled: user.isExpelled,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.get('/me', async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ error: 'Не авторизован' });
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.id }, include: { group: true } });
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    const { password, ...userData } = user;
    res.json(userData);
  } catch {
    res.status(401).json({ error: 'Не авторизован' });
  }
});

router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

export default router;