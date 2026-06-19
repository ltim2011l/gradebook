import { useState, useEffect } from 'react';
import { scheduleAPI, journalAPI, subjectsAPI } from '../../api';
import { Schedule, JournalData, Subject, Group } from '../../types';
import { useAuth } from '../../store.tsx';

export default function TeacherJournal() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<JournalData | null>(null);
  const [loading, setLoading] = useState(false);

  const [showAddDay, setShowAddDay] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [newDay, setNewDay] = useState({ date: '', startTime: '09:00', endTime: '10:30', room: '', subjectId: '', groupId: '' });

  const [gradeModal, setGradeModal] = useState<{ studentId: string; scheduleId: string } | null>(null);
  const [gradeValue, setGradeValue] = useState('');

  useEffect(() => {
    loadSchedules();
    subjectsAPI.getAll().then(res => {
      setSubjects(res.data);
      if (res.data.length > 0) setNewDay(prev => ({ ...prev, subjectId: res.data[0].id }));
    });
  }, []);

  const loadSchedules = async () => {
    const res = await scheduleAPI.getMy();
    setSchedules(res.data);
    const uniqueGroups: Group[] = [];
    const seen = new Set();
    for (const s of res.data) {
      if (s.group && !seen.has(s.group.id)) {
        seen.add(s.group.id);
        uniqueGroups.push(s.group);
      }
    }
    setGroups(uniqueGroups);
    if (uniqueGroups.length > 0) setNewDay(prev => ({ ...prev, groupId: uniqueGroups[0].id }));
  };

  const loadJournal = async (scheduleId: string) => {
    setLoading(true);
    try {
      const res = await journalAPI.getBySchedule(scheduleId);
      setSelectedSchedule(res.data);
    } catch { alert('Ошибка загрузки'); }
    setLoading(false);
  };

  const handleCellClick = (studentId: string, scheduleId: string, event: React.MouseEvent) => {
    if (event.button === 2) {
      event.preventDefault();
      markAttendance(scheduleId, studentId, 'ABSENT');
    } else if (event.button === 1) {
      event.preventDefault();
      markAttendance(scheduleId, studentId, 'LATE');
    } else {
      setGradeModal({ studentId, scheduleId });
      setGradeValue('');
    }
  };

  const markAttendance = async (scheduleId: string, studentId: string, status: string) => {
    await journalAPI.markAttendance({ scheduleId, studentId, status });
    loadJournal(scheduleId);
  };

  const submitGrade = async () => {
    if (!gradeModal) return;
    const val = parseInt(gradeValue);
    if (isNaN(val) || val < 1 || val > 10) {
      alert('Оценка должна быть числом от 1 до 10');
      return;
    }
    await journalAPI.addGrade({ scheduleId: gradeModal.scheduleId, studentId: gradeModal.studentId, value: val });
    setGradeModal(null);
    loadJournal(gradeModal.scheduleId);
  };

  const addDay = async () => {
    try {
      await journalAPI.addDay(newDay);
      setShowAddDay(false);
      loadSchedules();
    } catch { alert('Ошибка при добавлении дня'); }
  };

  const getAttendanceStatus = (studentId: string) => {
    if (!selectedSchedule) return null;
    return selectedSchedule.attendances.find(a => a.studentId === studentId);
  };

  const getGrade = (studentId: string) => {
    if (!selectedSchedule) return null;
    return selectedSchedule.grades.find(g => g.studentId === studentId);
  };

  const trStyle = (student: any) => ({
    background: student.isExpelled ? '#f5f5f5' : 'transparent',
    opacity: student.isExpelled ? 0.5 : 1,
  });

  return (
    <div>
      <h1>Журнал преподавателя</h1>

      <button onClick={() => setShowAddDay(!showAddDay)} style={{ marginBottom: 15, padding: '8px 16px', background: '#1976d2', color: '#fff', border: 'none', cursor: 'pointer' }}>
        + Добавить день (урок)
      </button>

      {showAddDay && (
        <div style={{ background: '#f9f9f9', padding: 15, marginBottom: 15, borderRadius: 8 }}>
          <h3>Добавить день в журнал</h3>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'end' }}>
            <div>
              <label>Дата:</label>
              <input type="date" value={newDay.date} onChange={e => setNewDay({...newDay, date: e.target.value})} style={{ display: 'block' }} />
            </div>
            <div>
              <label>Начало:</label>
              <input type="time" value={newDay.startTime} onChange={e => setNewDay({...newDay, startTime: e.target.value})} style={{ display: 'block' }} />
            </div>
            <div>
              <label>Конец:</label>
              <input type="time" value={newDay.endTime} onChange={e => setNewDay({...newDay, endTime: e.target.value})} style={{ display: 'block' }} />
            </div>
            <div>
              <label>Аудитория:</label>
              <input type="text" value={newDay.room} onChange={e => setNewDay({...newDay, room: e.target.value})} style={{ display: 'block' }} />
            </div>
            <div>
              <label>Предмет:</label>
              <select value={newDay.subjectId} onChange={e => setNewDay({...newDay, subjectId: e.target.value})} style={{ display: 'block' }}>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label>Группа:</label>
              <select value={newDay.groupId} onChange={e => setNewDay({...newDay, groupId: e.target.value})} style={{ display: 'block' }}>
                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <button onClick={addDay} style={{ padding: '8px 16px', background: 'green', color: '#fff', border: 'none', cursor: 'pointer' }}>
              Добавить
            </button>
          </div>
        </div>
      )}

      <div style={{ marginBottom: 15 }}>
        <label><strong>Выберите день: </strong></label>
        <select onChange={e => e.target.value && loadJournal(e.target.value)} style={{ padding: 5 }}>
          <option value="">— Выбрать —</option>
          {schedules.map(s => (
            <option key={s.id} value={s.id}>{s.date} {s.startTime}-{s.endTime} ({s.subject?.name}, {s.group?.name})</option>
          ))}
        </select>
      </div>

      {loading && <p>Загрузка журнала...</p>}

      {selectedSchedule && (
        <div>
          <h3>Группа: {selectedSchedule.group?.name} — {selectedSchedule.date}</h3>
          <p style={{ fontSize: 13, color: '#666' }}>
            Левая кнопка: оценка | Средняя кнопка (колесо): опоздание | Правая кнопка: отсутствие
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
              <thead>
                <tr style={{ background: '#e0e0e0' }}>
                  <th style={{ border: '1px solid #bbb', padding: 8 }}>№</th>
                  <th style={{ border: '1px solid #bbb', padding: 8 }}>Студент</th>
                  <th style={{ border: '1px solid #bbb', padding: 8 }}>Посещаемость</th>
                  <th style={{ border: '1px solid #bbb', padding: 8 }}>Оценка</th>
                </tr>
              </thead>
              <tbody>
                {selectedSchedule.group?.students.map((student, i) => {
                  const att = getAttendanceStatus(student.id);
                  const grade = getGrade(student.id);
                  return (
                    <tr
                      key={student.id}
                      style={trStyle(student)}
                      onMouseEnter={e => { e.currentTarget.style.background = '#e3f2fd'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = trStyle(student).background as string; }}
                    >
                      <td style={{ border: '1px solid #ccc', padding: 8, textAlign: 'center' }}>{i + 1}</td>
                      <td style={{ border: '1px solid #ccc', padding: 8 }}>
                        {student.lastName} {student.firstName}
                        {student.isExpelled ? ' (отчислен)' : ''}
                      </td>
                      <td
                        onClick={(e) => !student.isExpelled && handleCellClick(student.id, selectedSchedule.id, e)}
                        onContextMenu={(e) => { e.preventDefault(); !student.isExpelled && handleCellClick(student.id, selectedSchedule.id, e); }}
                        style={{
                          border: '1px solid #ccc',
                          padding: 8,
                          textAlign: 'center',
                          cursor: student.isExpelled ? 'default' : 'pointer',
                          background: att?.status === 'ABSENT' ? '#ffcccc' : att?.status === 'LATE' ? '#fff3cd' : '#d4edda',
                        }}
                        title="ЛКМ: оценка | СКМ: опоздание | ПКМ: отсутствие"
                      >
                        {att ? (att.status === 'ABSENT' ? 'Н' : att.status === 'LATE' ? 'О' : '✓') : '—'}
                      </td>
                      <td
                        onClick={(e) => !student.isExpelled && handleCellClick(student.id, selectedSchedule.id, e)}
                        style={{
                          border: '1px solid #ccc',
                          padding: 8,
                          textAlign: 'center',
                          cursor: student.isExpelled ? 'default' : 'pointer',
                        }}
                      >
                        {grade ? grade.value : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {gradeModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: '#fff', padding: 30, borderRadius: 8, minWidth: 300 }}>
            <h3>Выставить оценку</h3>
            <p>Введите оценку (1-10):</p>
            <input
              type="number"
              value={gradeValue}
              onChange={e => setGradeValue(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') submitGrade(); }}
              min="1"
              max="10"
              autoFocus
              style={{ width: '100%', padding: 10, fontSize: 18 }}
            />
            <div style={{ marginTop: 15, display: 'flex', gap: 10 }}>
              <button onClick={submitGrade} style={{ padding: '8px 20px', background: '#1976d2', color: '#fff', border: 'none', cursor: 'pointer' }}>ОК</button>
              <button onClick={() => setGradeModal(null)} style={{ padding: '8px 20px', background: '#ccc', border: 'none', cursor: 'pointer' }}>Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}