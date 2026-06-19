import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './store.tsx';
import Login from './pages/Login';
import StudentDashboard from './pages/Student/Dashboard';
import StudentJournal from './pages/Student/Journal';
import StudentSubject from './pages/Student/Subject';
import StudentLabWork from './pages/Student/LabWork';
import TeacherDashboard from './pages/Teacher/Dashboard';
import TeacherJournal from './pages/Teacher/Journal';
import TeacherProgram from './pages/Teacher/Program';
import TeacherSubmissions from './pages/Teacher/Submissions';

function PrivateRoute({ children, role }: { children: JSX.Element; role?: string }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Загрузка...</div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
}

export default function App() {
  const { user, logout } = useAuth();

  const navStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 20px',
    background: '#1976d2',
    color: '#fff',
    alignItems: 'center'
  };

  return (
    <div>
      {user && (
        <nav style={navStyle}>
          <span>
            <strong>Электронный журнал</strong> — {user.lastName} {user.firstName} ({user.role === 'TEACHER' ? 'Преподаватель' : 'Студент'})
          </span>
          <div>
            <a href="/" style={{ color: '#fff', marginRight: 15 }}>Главная</a>
            {user.role === 'STUDENT' && <a href="/journal" style={{ color: '#fff', marginRight: 15 }}>Журнал</a>}
            {user.role === 'STUDENT' && <a href="/subjects" style={{ color: '#fff', marginRight: 15 }}>Предметы</a>}
            {user.role === 'TEACHER' && <a href="/teacher/journal" style={{ color: '#fff', marginRight: 15 }}>Журнал</a>}
            {user.role === 'TEACHER' && <a href="/teacher/program" style={{ color: '#fff', marginRight: 15 }}>Программа</a>}
            <button onClick={logout} style={{ background: '#fff', color: '#1976d2', border: 'none', padding: '5px 15px', cursor: 'pointer', borderRadius: 4 }}>
              Выйти
            </button>
          </div>
        </nav>
      )}
      <div style={{ padding: 20 }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute>{user?.role === 'TEACHER' ? <TeacherDashboard /> : <StudentDashboard />}</PrivateRoute>} />
          <Route path="/journal" element={<PrivateRoute role="STUDENT"><StudentJournal /></PrivateRoute>} />
          <Route path="/subjects" element={<PrivateRoute role="STUDENT"><StudentSubject /></PrivateRoute>} />
          <Route path="/subjects/:subjectId" element={<PrivateRoute role="STUDENT"><StudentSubject /></PrivateRoute>} />
          <Route path="/lab/:templateId" element={<PrivateRoute role="STUDENT"><StudentLabWork /></PrivateRoute>} />
          <Route path="/teacher/journal" element={<PrivateRoute role="TEACHER"><TeacherJournal /></PrivateRoute>} />
          <Route path="/teacher/program" element={<PrivateRoute role="TEACHER"><TeacherProgram /></PrivateRoute>} />
          <Route path="/teacher/submissions/:templateId" element={<PrivateRoute role="TEACHER"><TeacherSubmissions /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  );
}