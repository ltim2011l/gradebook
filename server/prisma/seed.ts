import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('123456', 10);

  const group = await prisma.group.create({
    data: { name: 'ПО-21' }
  });

  const teacher = await prisma.user.create({
    data: {
      email: 'vykladchyk@bspu.com',
      password,
      role: 'TEACHER',
      firstName: 'Александр',
      lastName: 'Козлов',
    }
  });

  const student1 = await prisma.user.create({
    data: {
      email: 'student1@bspu.com',
      password,
      role: 'STUDENT',
      firstName: 'Егор',
      lastName: 'Иванов',
      groupId: group.id,
    }
  });

  const student2 = await prisma.user.create({
    data: {
      email: 'student2@bspu.com',
      password,
      role: 'STUDENT',
      firstName: 'Мария',
      lastName: 'Сидорова',
      groupId: group.id,
    }
  });

  const subject = await prisma.subject.create({
    data: { name: 'Программирование' }
  });

  await prisma.subjectTeacher.create({
    data: {
      subjectId: subject.id,
      teacherId: teacher.id,
    }
  });

  const today = new Date().toISOString().split('T')[0];

  const schedule = await prisma.schedule.create({
    data: {
      date: today,
      startTime: '09:00',
      endTime: '10:30',
      room: '305',
      subjectId: subject.id,
      groupId: group.id,
    }
  });

  await prisma.lessonTemplate.create({
    data: {
      subjectId: subject.id,
      type: 'LAB',
      title: 'Лабораторная работа №1. Основы',
      description: 'Теоретические материалы по основам программирования...',
      maxScore: 10,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isTeamWork: true,
    }
  });

  await prisma.lessonTemplate.create({
    data: {
      subjectId: subject.id,
      type: 'PRACTICE',
      title: 'Практическая работа №1',
      maxScore: 10,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isTeamWork: false,
    }
  });

  console.log('База данных заполнена тестовыми данными');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());