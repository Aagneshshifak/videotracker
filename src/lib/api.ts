interface ApiResponse<T = any> {
  data?: T;
  error?: string;
}

async function apiRequest<T = any>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    credentials: "include", // Important for session cookies
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "An error occurred" }));
    throw new Error(error.error || "An error occurred");
  }

  return response.json();
}

export const api = {
  auth: {
    login: (username: string, password: string) =>
      apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      }),
    signup: (data: { username: string; password: string; name: string }) =>
      apiRequest("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    logout: () =>
      apiRequest("/api/auth/logout", {
        method: "POST",
      }),
    getSession: () => apiRequest("/api/auth/session"),
  },
  videos: {
    getAll: () => apiRequest("/api/videos"),
    create: (data: any) =>
      apiRequest("/api/videos", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      apiRequest(`/api/videos/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      apiRequest(`/api/videos/${id}`, {
        method: "DELETE",
      }),
  },
  progress: {
    getAll: () => apiRequest("/api/progress"),
    createOrUpdate: (videoId: string, completed: boolean) =>
      apiRequest("/api/progress", {
        method: "POST",
        body: JSON.stringify({
          videoId,
          completed,
          completedAt: completed ? new Date().toISOString() : null,
        }),
      }),
  },
  admin: {
    getStudents: () => apiRequest("/api/admin/students"),
    getStudentProgress: (userId: string) =>
      apiRequest(`/api/admin/students/${userId}/progress`),
    getAllProgress: () => apiRequest("/api/admin/progress"),
    setup: () =>
      apiRequest("/api/admin/setup", {
        method: "POST",
      }),
  },
};
