import { useState, useEffect } from 'react';
import { apiClient } from '../utils/api';
import type { Task } from '../utils/api';
import { TaskItem } from './TaskItem';
import { CreateTaskForm } from './CreateTaskForm';
import { CreateTaskWithAIForm } from './CreateTaskWithAIForm';

interface TasksResponse {
  data: Task[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showCreateAIForm, setShowCreateAIForm] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0
  });
  const [filters, setFilters] = useState({
    completed: undefined as boolean | undefined,
    title: '',
    sort: 'created_at' as 'created_at' | 'due_date',
    dir: 'desc' as 'asc' | 'desc',
    page: 1,
  });

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        ...filters,
        title: filters.title || undefined,
      };
      const response: TasksResponse = await apiClient.getTasks(params);
      setTasks(response.data);
      setPagination({
        current_page: response.current_page,
        last_page: response.last_page,
        per_page: response.per_page,
        total: response.total
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error obteniendo tareas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  const handleTaskUpdate = async (taskId: number, updates: Partial<Task>) => {
    try {
      const updatedTask = await apiClient.updateTask(taskId, updates);
      setTasks(prev => prev.map(task => 
        task.id === taskId ? updatedTask : task
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar la tarea');
    }
  };

  const handleTaskDelete = async (taskId: number) => {
    try {
      await apiClient.deleteTask(taskId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar la tarea');
    }
  };

  const handleTaskCreate = async () => {
    setFilters(prev => ({ ...prev, page: 1 }));
    await fetchTasks();
    setShowCreateForm(false);
    setShowCreateAIForm(false);
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ 
      ...prev, 
      [key]: value,
      ...(key !== 'page' && { page: 1 })
    }));
  };

  const handlePageChange = (newPage: number) => {
    handleFilterChange('page', newPage);
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-500 dark:text-gray-400">Cargando tareas...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4 flex-col sm:flex-row sm:items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Mis Tareas
          </h1>
          <div className='flex items-center mt-4 sm:mt-0'>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg font-medium flex items-center gap-2 mr-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>

              {showCreateForm ? 'Cancelar' : 'Agregar Tarea'}
            </button>
            <button
              onClick={() => setShowCreateAIForm(!showCreateAIForm)}
              className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg font-medium flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
              </svg>

              {showCreateAIForm ? 'Cancelar' : 'Generar Tareas con IA'}
            </button>
          </div>
          
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-4">
          <input
            type="text"
            placeholder="Buscar tareas..."
            value={filters.title}
            onChange={(e) => handleFilterChange('title', e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white flex-1"
          />
          
          <select
            value={filters.completed === undefined ? 'all' : filters.completed ? 'completed' : 'pending'}
            onChange={(e) => {
              const value = e.target.value;
              handleFilterChange('completed', 
                value === 'all' ? undefined : value === 'completed'
              );
            }}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white flex-1/4"
          >
            <option value="all">Todas las Tareas</option>
            <option value="pending">Pendientes</option>
            <option value="completed">Completadas</option>
          </select>

          <select
            value={`${filters.sort}:${filters.dir}`}
            onChange={(e) => {
              const [sort, dir] = e.target.value.split(':');
              handleFilterChange('sort', sort);
              handleFilterChange('dir', dir);
            }}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white flex-1/4"
          >
            <option value="created_at:desc">Más Reciente Primero</option>
            <option value="created_at:asc">Más Antiguo Primero</option>
            <option value="due_date:asc">Fecha de Vencimiento (Más Cercana)</option>
            <option value="due_date:desc">Fecha de Vencimiento (Más Lejana)</option>
          </select>
        </div>

        {/* Create Task Form */}
        {showCreateForm && (
          <div className="mb-6">
            <CreateTaskForm 
              onTaskCreated={handleTaskCreate}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        )}

        {/* Create Task with AI Form */}
        {showCreateAIForm && (
          <div className="mb-6">
            <CreateTaskWithAIForm 
              onTasksCreated={handleTaskCreate}
              onCancel={() => setShowCreateAIForm(false)}
            />
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
          <div className="text-red-700 dark:text-red-200">{error}</div>
        </div>
      )}

      {/* Task List */}
      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400 text-lg">
            No se encontraron tareas. ¡Crea tu primera tarea!
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {tasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onUpdate={handleTaskUpdate}
                onDelete={handleTaskDelete}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.last_page > 1 && (
            <div className="mt-8 flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Mostrando {((pagination.current_page - 1) * pagination.per_page) + 1} a{' '}
                {Math.min(pagination.current_page * pagination.per_page, pagination.total)} de{' '}
                {pagination.total} tareas
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Previous button */}
                <button
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                  disabled={pagination.current_page === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>

                {/* Page numbers */}
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                    let pageNum;
                    if (pagination.last_page <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.current_page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.current_page >= pagination.last_page - 2) {
                      pageNum = pagination.last_page - 4 + i;
                    } else {
                      pageNum = pagination.current_page - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg ${
                          pageNum === pagination.current_page
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                {/* Next button */}
                <button
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                  disabled={pagination.current_page === pagination.last_page}
                  className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
