// client/src/pages/Student/LabSubmission.tsx
const LabPage = ({ templateId }) => {
  const [file, setFile] = useState(null);
  
  const uploadSolution = async () => {
    const formData = new FormData();
    formData.append('file', file);
    await axios.post(`/api/labs/${templateId}/submit`, formData);
  };

  return (
    <div>
      <h2>Лабораторная работа №1</h2>
      <p>Дедлайн: 12.12.2024</p>
      <p>Напарник: Иванов И.</p> {/* Если командная */}
      
      {/* Теоретические материалы */}
      <a href="/files/theory.pdf">Скачать методичку</a>
      
      {/* Зона загрузки */}
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={uploadSolution}>Отправить</button>
      
      {/* Комментарий препода */}
      <div className="teacher-feedback">
        <p>Оценка: 4</p>
        <p>Комментарий: Нужно исправить титульный лист.</p>
      </div>
    </div>
  );
};