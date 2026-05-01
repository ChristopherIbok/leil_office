const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const DEMO_AUTH_ENABLED = process.env.NEXT_PUBLIC_DEMO_AUTH !== "false";

const demoUsers = [
  {
    id: "demo-admin",
    name: "Admin",
    email: "admin@leilportal.local",
    password: "AdminPass123!",
    role: "ADMIN" as const
  },
  {
    id: "demo-team",
    name: "Team Member",
    email: "team@leilportal.local",
    password: "TeamPass123!",
    role: "TEAM_MEMBER" as const
  },
  {
    id: "demo-client",
    name: "Client",
    email: "client@leilportal.local",
    password: "ClientPass123!",
    role: "CLIENT" as const
  }
];

export type AuthSession = {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "TEAM_MEMBER" | "CLIENT";
  };
};

export type ProjectSummary = {
  id: string;
  name: string;
  status: string;
  description?: string | null;
  _count?: {
    tasks: number;
    files: number;
    members: number;
  };
};

export type TaskRecord = {
  id: string;
  title: string;
  description?: string | null;
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
  assignee?: { id: string; name: string; email: string } | null;
  dueDate?: string | null;
  tags: string[];
};

export type ProjectDetail = {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  client?: { id: string; name: string; email: string } | null;
  tasks: TaskRecord[];
  files: { id: string; name: string; version: number }[];
  channels: { id: string; name: string }[];
};

export async function apiFetch<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const response = await fetch(`${API_URL}/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message ?? `Request failed with ${response.status}`);
  }

  return response.json();
}

export function login(email: string, password: string) {
  return apiFetch<AuthSession>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password })
    }
  ).catch((error) => {
    if (!DEMO_AUTH_ENABLED) throw error;
    return demoLogin(email, password);
  });
}

export function register(name: string, email: string, password: string, role = "TEAM_MEMBER") {
  return apiFetch<AuthSession>(
    "/auth/register",
    {
      method: "POST",
      body: JSON.stringify({ name, email, password, role })
    }
  ).catch((error) => {
    if (!DEMO_AUTH_ENABLED) throw error;
    return {
      accessToken: "demo-token",
      user: {
        id: `demo-${email}`,
        name,
        email,
        role: role as AuthSession["user"]["role"]
      }
    };
  });
}

export function fetchMe(token: string) {
  return apiFetch<{ user: AuthSession["user"] }>("/auth/me", { method: "GET" }, token);
}

export function fetchProjects(token: string) {
  return apiFetch<ProjectSummary[]>("/projects", { method: "GET" }, token);
}

export function fetchProject(projectId: string, token: string) {
  return apiFetch<ProjectDetail>(`/projects/${projectId}`, { method: "GET" }, token);
}

export function fetchProjectTasks(projectId: string, token: string) {
  return apiFetch<TaskRecord[]>(`/tasks?projectId=${encodeURIComponent(projectId)}`, { method: "GET" }, token);
}

function demoLogin(email: string, password: string): AuthSession {
  const user = demoUsers.find((item) => item.email === email.toLowerCase() && item.password === password);
  if (!user) throw new Error("API is offline. Use a demo account or start the backend.");

  return {
    accessToken: "demo-token",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
}
