import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { labsAPI } from '../../api';
import { Submission } from '../../types';

export default function TeacherSubmissions() {
  const { templateId } = useParams<{ templateId: string }>();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [reviewModal, setReviewModal] = useState<Submission | null>(null);
  const [score, setScore] = useState('');
  const [comment, setComment] = useState('');

  useEffect(() => {
    loadSubmissions();
  }, [templateId]);

  const loadSubmissions = async () => {
    if (!templateId) return;
    const res = await labsAPI.getSubmissions(templateId);
    setSubmissions(res.data);
  };

  const openReview = (sub: Submission) => {
    setReviewModal(sub);
    setScore(sub.score?.toString() || '');
    setComment(sub.comment || '');
  };

  const submitReview = async () => {
    if (!reviewModal) return;
    const scoreNum = parseInt(score);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
      alert('Введите корректную оценку');
      return;
    }
    await labsAPI.review(reviewModal.id, { score: scoreNum, comment });
    setReviewModal(null);
    loadSubmissions();
  };

  return (
    <div>
      <h1>Сдача лабораторных работ</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f0f0f0' }}>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Студент</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Дата сдачи</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Файл</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Оценка</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Комментарий</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Действия</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map(sub => (
            <tr key={sub.id}>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{sub.student?.lastName} {sub.student?.firstName}</td>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{new Date(sub.submittedAt).toLocaleString()}</td>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>
                {sub.fileUrl ? <a href={sub.fileUrl} target="_blank">Скачать</a> : 'Нет файла'}
              </td>
              <td style={{ border: '1px solid #ccc', padding: 8, textAlign: 'center' }}>
                {sub.score !== null && sub.score !== undefined ? sub.score : '—'}
              </td>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{sub.comment || '—'}</td>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>
                <button onClick={() => openReview(sub)} style={{ padding: '4px 12px', cursor: 'pointer' }}>
                  Проверить
                </button>
              </td>
            </tr>
          ))}
          {submissions.length === 0 && (
            <tr><td colSpan={6} style={{ textAlign: 'center', padding: 20 }}>Нет отправленных решений</td></tr>
          )}
        </tbody>
      </table>

      {reviewModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: '#fff', padding: 30, borderRadius: 8, minWidth: 400 }}>
            <h3>Проверка работы</h3>
            <p>Студент: {reviewModal.student?.lastName} {reviewModal.student?.firstName}</p>
            {reviewModal.fileUrl && <p><a href={reviewModal.fileUrl} target="_blank">Открыть файл</a></p>}
            <div style={{ marginBottom: 10 }}>
              <label>Оценка:</label>
              <input type="number" value={score} onChange={e => setScore(e.target.value)} style={{ width: '100%', padding: 8 }} />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label>Комментарий:</label>
              <textarea value={comment} onChange={e => setComment(e.target.value)} style={{ width: '100%', padding: 8, minHeight: 80 }} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={submitReview} style={{ padding: '8px 20px', background: '#1976d2', color: '#fff', border: 'none', cursor: 'pointer' }}>Сохранить</button>
              <button onClick={() => setReviewModal(null)} style={{ padding: '8px 20px', background: '#ccc', border: 'none', cursor: 'pointer' }}>Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}