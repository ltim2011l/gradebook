import { useState, useEffect } from 'react';
import { useAuth } from '../../store';
import { scheduleAPI } from '../../api';
import { Schedule } from '../../types';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  useEffect(() => {
    scheduleAPI.getMy().then(res => setSchedules(res.data));
  }, []);

  return (
    <div>
      <h1>Главная — Преподаватель</h1>
      <p>Добро пожаловать, {user?.firstName} {user?.lastName}</p>
      <h2>Моё расписание</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f0f0f0' }}>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Дата</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Время</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Предмет</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Группа</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Аудитория</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map(s => (
            <tr key={s.id}>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{s.date}</td>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{s.startTime} - {s.endTime}</td>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{s.subject?.name}</td>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{s.group?.name}</td>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{s.room || '—'}</td>
            </tr>
          ))}
          {schedules.length === 0 && (
            <tr><td colSpan={5} style={{ textAlign: 'center', padding: 20 }}>Расписание пока пусто</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}