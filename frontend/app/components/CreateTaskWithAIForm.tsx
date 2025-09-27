import React, { useState } from 'react';
import { apiClient } from '../utils/api';
import type { Task } from '../utils/api';

interface CreateTaskWithAIFormProps {
  onTasksCreated: () => void;
  onCancel: () => void;
}

export function CreateTaskWithAIForm({ onTasksCreated, onCancel }: CreateTaskWithAIFormProps) {
  const [formData, setFormData] = useState({
    topic: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.topic.trim()) {
      setError('La descripción es obligatoria');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await apiClient.generateWithAi(formData.topic);

      onTasksCreated();
      setFormData({ topic: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar las tareas');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Crear Nuevas Tareas con AI
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tema
          </label>
          <textarea
            id="topic"
            name="topic"
            value={formData.topic}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe el tema o contexto para generar tareas... (Ej: 'Planificar la fiesta de cumpleaños')"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
            <div className="text-red-700 dark:text-red-200 text-sm">{error}</div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || !formData.topic.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creando...' : 'Crear Tareas con AI'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
