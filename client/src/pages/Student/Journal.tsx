import { useState, useEffect } from 'react';
import { useAuth } from '../../store.tsx';
import { scheduleAPI, journalAPI } from '../../api';
import { Schedule, JournalData } from '../../types';

export default function StudentJournal() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [journalMap, setJournalMap] = useState<Record<string, JournalData>>({});

  useEffect(() => {
    scheduleAPI.getMy().then(async res => {
      setSchedules(res.data);
      const map: Record<string, JournalData> = {};
      for (const s of res.data) {
        const jres = await journalAPI.getBySchedule(s.id);
        map[s.id] = jres.data;
      }
      setJournalMap(map);
    });
  }, []);

  const getAttendance = (scheduleId: string) => {
    const my = journalMap[scheduleId]?.attendances?.find(a => a.studentId === user?.id);
    if (!my) return '—';
    if (my.status === 'ABSENT') return 'Н';
    if (my.status === 'LATE') return 'О';
    return '✓';
  };

  const getGrade = (scheduleId: string) => {
    const my = journalMap[scheduleId]?.grades?.find(g => g.studentId === user?.id);
    return my ? my.value : '—';
  };

  return (
    <div>
      <h1>Электронный журнал</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f0f0f0' }}>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Дата</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Предмет</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Посещаемость</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Оценка</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map(s => (
            <tr key={s.id}>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{s.date}</td>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{s.subject?.name}</td>
              <td style={{ border: '1px solid #ccc', padding: 8, textAlign: 'center', 
                background: getAttendance(s.id) === 'Н' ? '#ffcccc' : getAttendance(s.id) === 'О' ? '#fff3cd' : '#fff' }}>
                {getAttendance(s.id)}
              </td>
              <td style={{ border: '1px solid #ccc', padding: 8, textAlign: 'center' }}>
                {getGrade(s.id)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}