import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { LoginForm } from '~/components/LoginForm';
import { RegisterForm } from '~/components/RegisterForm';

export function meta() {
  return [
    { title: "Mis tareas" },
    { name: "description", content: "Administra tus tareas de manera eficiente" },
  ];
}

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const [isLoginState, setIsLoginState] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-500 dark:text-gray-400">Cargando...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return isLoginState ? (
    <LoginForm onSwitchToRegister={() => setIsLoginState(false)} />
  ) : (
    <RegisterForm onSwitchToLogin={() => setIsLoginState(true)} />
  );
}
