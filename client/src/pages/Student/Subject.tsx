import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { subjectsAPI } from '../../api';
import { Subject } from '../../types';

export default function StudentSubject() {
  const [subjects, setSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    subjectsAPI.getAll().then(res => setSubjects(res.data));
  }, []);

  return (
    <div>
      <h1>Предметы</h1>
      {subjects.map(subj => (
        <div key={subj.id} style={{ marginBottom: 30 }}>
          <h2>{subj.name}</h2>
          {subj.templates && subj.templates.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f0f0f0' }}>
                  <th style={{ border: '1px solid #ccc', padding: 8 }}>Тип</th>
                  <th style={{ border: '1px solid #ccc', padding: 8 }}>Название</th>
                  <th style={{ border: '1px solid #ccc', padding: 8 }}>Дедлайн</th>
                  <th style={{ border: '1px solid #ccc', padding: 8 }}>Действия</th>
                </tr>
              </thead>
              <tbody>
                {subj.templates.map(t => (
                  <tr key={t.id}>
                    <td style={{ border: '1px solid #ccc', padding: 8 }}>{t.type === 'LAB' ? 'Лаб.' : t.type}</td>
                    <td style={{ border: '1px solid #ccc', padding: 8 }}>{t.title}</td>
                    <td style={{ border: '1px solid #ccc', padding: 8 }}>{t.deadline || '—'}</td>
                    <td style={{ border: '1px solid #ccc', padding: 8 }}>
                      <Link to={`/lab/${t.id}`}>Открыть</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p>Нет шаблонов занятий</p>}
        </div>
      ))}
      {subjects.length === 0 && <p>Нет доступных предметов</p>}
    </div>
  );
}