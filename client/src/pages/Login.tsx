import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store.tsx';

export default function Login() {
  const [email, setEmail] = useState('vykladchyk@bspu.com');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const { login, user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    navigate('/');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка входа');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '50px auto' }}>
      <h1>Вход в систему</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 15 }}>
          <label>Email:</label><br />
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
            style={{ width: '100%', padding: 8, marginTop: 5 }} />
        </div>
        <div style={{ marginBottom: 15 }}>
          <label>Пароль:</label><br />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
            style={{ width: '100%', padding: 8, marginTop: 5 }} />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" style={{ padding: '10px 20px', background: '#1976d2', color: '#fff', border: 'none', cursor: 'pointer' }}>
          Войти
        </button>
      </form>
      <div style={{ marginTop: 20, fontSize: 13, color: '#666' }}>
        <p>Тестовые аккаунты:</p>
        <p>Преподаватель: vykladchyk@bspu.com / 123456</p>
        <p>Студент: student1@bspu.com / 123456</p>
        <p>Студент 2: student2@bspu.com / 123456</p>
      </div>
    </div>
  );
}