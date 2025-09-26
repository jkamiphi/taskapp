import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Header } from '../components/Header';
import { TaskList } from '../components/TaskList';
import { useAuth } from '../contexts/AuthContext';

export function meta() {
  return [
    { title: "Mis tareas" },
    { name: "description", content: "Administra tus tareas de manera eficiente" },
  ];
}

export default function Dashboard() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-500 dark:text-gray-400">Cargando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main>
        <TaskList />
      </main>
    </div>
  );
}
