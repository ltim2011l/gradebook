import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { subjectsAPI } from '../../api';
import { Subject } from '../../types';

export default function TeacherProgram() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    subjectId: '',
    type: 'LAB',
    title: '',
    description: '',
    maxScore: 5,
    deadline: '',
    fileUrl: '',
    isTeamWork: false,
  });

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    const res = await subjectsAPI.getAll();
    setSubjects(res.data);
    if (res.data.length > 0 && !form.subjectId) {
      setForm(f => ({ ...f, subjectId: res.data[0].id }));
    }
  };

  const handleCreate = async () => {
    if (!form.subjectId || !form.title) {
      alert('Заполните обязательные поля');
      return;
    }
    try {
      await subjectsAPI.createTemplate(form);
      setShowForm(false);
      setForm({ subjectId: form.subjectId, type: 'LAB', title: '', description: '', maxScore: 5, deadline: '', fileUrl: '', isTeamWork: false });
      loadSubjects();
    } catch {
      alert('Ошибка при создании');
    }
  };

  return (
    <div>
      <h1>Программа по предметам</h1>
      <button onClick={() => setShowForm(!showForm)}
        style={{ marginBottom: 15, padding: '8px 16px', background: '#1976d2', color: '#fff', border: 'none', cursor: 'pointer' }}>
        + Добавить занятие в программу
      </button>

      {showForm && (
        <div style={{ background: '#f9f9f9', padding: 15, marginBottom: 20, borderRadius: 8 }}>
          <h3>Новое занятие</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label>Предмет:</label>
              <select value={form.subjectId} onChange={e => setForm({...form, subjectId: e.target.value})} style={{ width: '100%', padding: 5 }}>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label>Тип:</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} style={{ width: '100%', padding: 5 }}>
                <option value="LAB">Лабораторная</option>
                <option value="PRACTICE">Практическая</option>
                <option value="LECTURE">Лекция</option>
                <option value="TEST">Контрольная</option>
              </select>
            </div>
            <div>
              <label>Название:</label>
              <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} style={{ width: '100%', padding: 5 }} placeholder="Лаб. работа №1" />
            </div>
            <div>
              <label>Макс. балл:</label>
              <input type="number" value={form.maxScore} onChange={e => setForm({...form, maxScore: +e.target.value})} style={{ width: '100%', padding: 5 }} />
            </div>
            <div>
              <label>Дедлайн:</label>
              <input type="date" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} style={{ width: '100%', padding: 5 }} />
            </div>
            <div>
              <label>Ссылка на ТЗ:</label>
              <input type="text" value={form.fileUrl} onChange={e => setForm({...form, fileUrl: e.target.value})} style={{ width: '100%', padding: 5 }} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label>Описание (теория):</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{ width: '100%', padding: 5, minHeight: 80 }} />
            </div>
            <div>
              <label>
                <input type="checkbox" checked={form.isTeamWork} onChange={e => setForm({...form, isTeamWork: e.target.checked})} />
                {' '}Командная работа
              </label>
            </div>
          </div>
          <button onClick={handleCreate} style={{ marginTop: 10, padding: '8px 20px', background: 'green', color: '#fff', border: 'none', cursor: 'pointer' }}>
            Создать
          </button>
        </div>
      )}

      {subjects.map(subj => (
        <div key={subj.id} style={{ marginBottom: 30 }}>
          <h2>{subj.name}</h2>
          {subj.templates && subj.templates.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f0f0f0' }}>
                  <th style={{ border: '1px solid #ccc', padding: 8 }}>Тип</th>
                  <th style={{ border: '1px solid #ccc', padding: 8 }}>Название</th>
                  <th style={{ border: '1px solid #ccc', padding: 8 }}>Макс. балл</th>
                  <th style={{ border: '1px solid #ccc', padding: 8 }}>Дедлайн</th>
                  <th style={{ border: '1px solid #ccc', padding: 8 }}>Команды</th>
                  <th style={{ border: '1px solid #ccc', padding: 8 }}>Сдачи</th>
                </tr>
              </thead>
              <tbody>
                {subj.templates.map(t => (
                  <tr key={t.id}>
                    <td style={{ border: '1px solid #ccc', padding: 8 }}>{t.type === 'LAB' ? 'Лаб.' : t.type}</td>
                    <td style={{ border: '1px solid #ccc', padding: 8 }}>{t.title}</td>
                    <td style={{ border: '1px solid #ccc', padding: 8, textAlign: 'center' }}>{t.maxScore}</td>
                    <td style={{ border: '1px solid #ccc', padding: 8 }}>{t.deadline || '—'}</td>
                    <td style={{ border: '1px solid #ccc', padding: 8, textAlign: 'center' }}>
                      {t.isTeamWork ? 'Да' : 'Нет'}
                    </td>
                    <td style={{ border: '1px solid #ccc', padding: 8 }}>
                      <Link to={`/teacher/submissions/${t.id}`}>Проверить</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p>Нет шаблонов занятий</p>}
        </div>
      ))}
    </div>
  );
}