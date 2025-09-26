import React, { useState, useEffect } from 'react';
import { apiClient } from '../utils/api';
import type { Task } from '../utils/api';
import { TaskItem } from './TaskItem';
import { CreateTaskForm } from './CreateTaskForm';

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
  const [filters, setFilters] = useState({
    completed: undefined as boolean | undefined,
    title: '',
    sort: 'created_at' as 'created_at' | 'due_date',
    dir: 'desc' as 'asc' | 'desc',
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

  const handleTaskCreate = (newTask: Task) => {
    setTasks(prev => [newTask, ...prev]);
    setShowCreateForm(false);
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
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
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Mis Tareas
          </h1>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            {showCreateForm ? 'Cancelar' : 'Agregar Tarea'}
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-4">
          <input
            type="text"
            placeholder="Buscar tareas..."
            value={filters.title}
            onChange={(e) => handleFilterChange('title', e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          
          <select
            value={filters.completed === undefined ? 'all' : filters.completed ? 'completed' : 'pending'}
            onChange={(e) => {
              const value = e.target.value;
              handleFilterChange('completed', 
                value === 'all' ? undefined : value === 'completed'
              );
            }}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">Todas las Tareas</option>
            <option value="pending">Pendientes</option>
            <option value="completed">Completadas</option>
          </select>

          <select
            value={`${filters.sort}_${filters.dir}`}
            onChange={(e) => {
              const [sort, dir] = e.target.value.split('_');
              handleFilterChange('sort', sort);
              handleFilterChange('dir', dir);
            }}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="created_at_desc">Más Reciente Primero</option>
            <option value="created_at_asc">Más Antiguo Primero</option>
            <option value="due_date_asc">Fecha de Vencimiento (Más Cercana)</option>
            <option value="due_date_desc">Fecha de Vencimiento (Más Lejana)</option>
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
      )}
    </div>
  );
}
