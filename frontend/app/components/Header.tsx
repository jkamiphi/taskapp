import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

export function Header() {
  const { logout, loading } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      toast.error(`Logout error: ${err instanceof Error ? err.message : 'Un error ha ocurrido al cerrar sesión'}`);
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Mis Tareas
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLogout}
              disabled={loading}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 px-3 py-2 rounded-md text-sm font-medium disabled:opacity-50"
            >
              {loading ? 'Saliendo...' : 'Cerrar Sesión'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
