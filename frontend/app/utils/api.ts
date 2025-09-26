const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class ApiError extends Error {
    constructor(public status: number, message: string, public data?: any) {
        super(message);
        this.name = "ApiError";
    }
}

export class ApiClient {
    private baseURL: string;

    constructor(baseURL: string | undefined = API_BASE_URL) {
        if (!baseURL) {
            throw new Error("API_BASE_URL no está definido");
        }

        this.baseURL = baseURL;
    }

    private getToken(): string | null {
        return localStorage.getItem("auth_token");
    }

    private setToken(token: string): void {
        localStorage.setItem("auth_token", token);
    }

    public removeToken(): void {
        localStorage.removeItem("auth_token");
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseURL}${endpoint}`;
        const token = this.getToken();

        const config: RequestInit = {
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                ...(token && { Authorization: `Bearer ${token}` }),
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new ApiError(
                    response.status,
                    errorData.message || `HTTP ${response.status}`,
                    errorData
                );
            }

            if (response.status === 204) {
                return {} as T;
            }

            return await response.json();
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError(0, "Network error or server unavailable");
        }
    }

    async login(email: string, password: string): Promise<{ token: string }> {
        const response = await this.request<{ token: string }>("/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });

        this.setToken(response.token);
        return response;
    }

    async register(userData: {
        first_name: string;
        last_name: string;
        email: string;
        password: string;
        password_confirmation: string;
    }): Promise<{ message: string }> {
        return this.request("/register", {
            method: "POST",
            body: JSON.stringify(userData),
        });
    }

    async logout(): Promise<{ message: string }> {
        const response = await this.request<{ message: string }>("/logout", {
            method: "POST",
        });
        this.removeToken();
        return response;
    }

    async getTasks(params?: {
        completed?: boolean;
        title?: string;
        sort?: "due_date" | "created_at";
        dir?: "asc" | "desc";
        per_page?: number;
    }): Promise<{
        data: Task[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    }> {
        const searchParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    searchParams.append(key, value.toString());
                }
            });
        }

        const queryString = searchParams.toString();
        const endpoint = queryString ? `/tasks?${queryString}` : "/tasks";

        return this.request(endpoint);
    }

    async createTask(taskData: {
        title: string;
        description?: string;
        due_date?: string;
    }): Promise<Task> {
        return this.request("/tasks", {
            method: "POST",
            body: JSON.stringify(taskData),
        });
    }

    async updateTask(
        id: number,
        taskData: {
            title?: string;
            description?: string;
            completed?: boolean;
            due_date?: string;
        }
    ): Promise<Task> {
        return this.request(`/tasks/${id}`, {
            method: "PUT",
            body: JSON.stringify(taskData),
        });
    }

    async deleteTask(id: number): Promise<void> {
        return this.request(`/tasks/${id}`, {
            method: "DELETE",
        });
    }

    async getTask(id: number): Promise<Task> {
        return this.request(`/tasks/${id}`);
    }
}

// Types
export interface Task {
    id: number;
    title: string;
    description?: string;
    completed: boolean;
    due_date?: string;
    created_at: string;
    updated_at: string;
    user_id: number;
}

export interface User {
    id: number;
    nickname: string;
    first_name: string;
    last_name: string;
    email: string;
    created_at: string;
    updated_at: string;
}

// Singleton instance
export const apiClient = new ApiClient();
