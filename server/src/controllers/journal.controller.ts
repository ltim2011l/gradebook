// server/src/controllers/journal.controller.ts
export const markAttendance = async (req: AuthRequest, res: Response) => {
  const { scheduleId, studentId, status } = req.body; // status: 'ABSENT' | 'LATE' | 'PRESENT'
  
  // Получаем время начала урока из расписания (захардкожено в БД)
  const schedule = await prisma.schedule.findUnique({ where: { id: scheduleId } });
  
  // Если преподаватель нажал "опоздание", можно свериться с текущим временем
  // или просто записать то, что передали с фронта.
  // По требованию: "Автоматическое определение опозданий".
  // Реализация: если сервер получает текущее время и сравнивает с schedule.startTime.
  
  // Пример автоматической логики:
  const currentTime = new Date();
  let finalStatus = status;
  if (status === 'PRESENT' && currentTime > new Date(schedule.startTime)) {
     // Если отметился позже начала, но преподаватель поставил присутствие - ок, 
     // но можно логгировать опоздание.
  }

  await prisma.attendance.upsert({
    where: {
      // compound unique key нужен
    },
    update: { status: finalStatus },
    create: {
      studentId,
      scheduleId,
      status: finalStatus
    }
  });
  // ...
};