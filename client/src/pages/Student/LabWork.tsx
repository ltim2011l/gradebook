import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { labsAPI, subjectsAPI } from '../../api';
import { LessonTemplate, Submission } from '../../types';
import { useAuth } from '../../store.tsx';

export default function StudentLabWork() {
  const { templateId } = useParams<{ templateId: string }>();
  const { user } = useAuth();
  const [template, setTemplate] = useState<LessonTemplate | null>(null);
  const [mySubmissions, setMySubmissions] = useState<Submission[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    subjectsAPI.getAll().then(res => {
      for (const subj of res.data) {
        const t = subj.templates?.find(t => t.id === templateId);
        if (t) {
          setTemplate(t);
          break;
        }
      }
    });
    labsAPI.getSubmissions(templateId!).then(res => {
      setMySubmissions(res.data.filter((s: Submission) => s.studentId === user?.id));
    });
  }, [templateId]);

  const handleUpload = async () => {
    if (!file || !templateId) return;
    setUploading(true);
    try {
      await labsAPI.submit(templateId, file);
      alert('Решение отправлено!');
      setFile(null);
      const res = await labsAPI.getSubmissions(templateId);
      setMySubmissions(res.data.filter((s: Submission) => s.studentId === user?.id));
    } catch {
      alert('Ошибка при отправке');
    } finally {
      setUploading(false);
    }
  };

  if (!template) return <p>Загрузка...</p>;

  return (
    <div>
      <h1>{template.title}</h1>
      <p><strong>Тип:</strong> {template.type}</p>
      <p><strong>Дедлайн:</strong> {template.deadline || 'Не указан'}</p>
      <p><strong>Максимальный балл:</strong> {template.maxScore}</p>
      <p><strong>Командная работа:</strong> {template.isTeamWork ? 'Да' : 'Нет'}</p>
      
      {template.description && (
        <div style={{ background: '#f9f9f9', padding: 15, margin: '15px 0', borderRadius: 8 }}>
          <h3>Теоретические материалы</h3>
          <p>{template.description}</p>
        </div>
      )}

      <div style={{ margin: '20px 0', padding: 15, border: '2px dashed #ccc', borderRadius: 8 }}>
        <h3>Отправить решение</h3>
        <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
        <button onClick={handleUpload} disabled={!file || uploading}
          style={{ marginLeft: 10, padding: '8px 16px', background: '#1976d2', color: '#fff', border: 'none', cursor: 'pointer' }}>
          {uploading ? 'Отправка...' : 'Отправить'}
        </button>
      </div>

      <h3>Мои отправленные решения</h3>
      {mySubmissions.length === 0 ? (
        <p>Вы ещё не отправляли решения</p>
      ) : (
        mySubmissions.map(sub => (
          <div key={sub.id} style={{ border: '1px solid #eee', padding: 10, marginBottom: 10, borderRadius: 4 }}>
            <p>Отправлено: {new Date(sub.submittedAt).toLocaleString()}</p>
            {sub.fileUrl && <a href={sub.fileUrl} target="_blank">Скачать файл</a>}
            <p>Оценка: {sub.score !== null && sub.score !== undefined ? sub.score : 'Не проверено'}</p>
            {sub.comment && <p><strong>Комментарий преподавателя:</strong> {sub.comment}</p>}
          </div>
        ))
      )}
    </div>
  );
}