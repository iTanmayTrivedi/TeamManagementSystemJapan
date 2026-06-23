// Mock data store for portfolio demo mode - fully offline, no backend calls

export type AppRole = 'admin' | 'manager' | 'employee';

export interface MockUser {
  id: string;
  email: string;
  full_name: string;
  role: AppRole;
  department: string;
  status: string;
}

export interface MockTask {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  assigned_to: string | null;
  assigned_by: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface MockNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  category: 'assignment' | 'deadline' | 'completion' | 'system';
}

export interface MockActivityLog {
  id: string;
  action: string;
  details: string | null;
  created_at: string;
  user_id: string;
  entity_type: string;
  entity_id: string | null;
}

export interface MockComment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export const DEMO_USERS: MockUser[] = [
  { id: 'u1', email: 'admin@demo.com', full_name: 'Admin User', role: 'admin', department: 'Management', status: 'active' },
  { id: 'u2', email: 'manager@demo.com', full_name: 'Sarah Manager', role: 'manager', department: 'Engineering', status: 'active' },
  { id: 'u3', email: 'employee@demo.com', full_name: 'John Employee', role: 'employee', department: 'Engineering', status: 'active' },
  { id: 'u4', email: 'jane@demo.com', full_name: 'Jane Developer', role: 'employee', department: 'Design', status: 'active' },
  { id: 'u5', email: 'mike@demo.com', full_name: 'Mike Analyst', role: 'employee', department: 'Marketing', status: 'inactive' },
];

const now = new Date().toISOString();
const yesterday = new Date(Date.now() - 86400000).toISOString();
const twoDaysAgo = new Date(Date.now() - 172800000).toISOString();
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
const nextWeek = new Date(Date.now() + 604800000).toISOString().split('T')[0];
const lastWeek = new Date(Date.now() - 604800000).toISOString().split('T')[0];

const INITIAL_TASKS: MockTask[] = [
  { id: 't1', title: 'Design new landing page', description: 'Create mockups for the new landing page', priority: 'high', status: 'in_progress', assigned_to: 'u4', assigned_by: 'u2', due_date: tomorrow, created_at: twoDaysAgo, updated_at: yesterday },
  { id: 't2', title: 'Fix login bug', description: 'Users report intermittent login failures', priority: 'high', status: 'completed', assigned_to: 'u3', assigned_by: 'u2', due_date: lastWeek, created_at: twoDaysAgo, updated_at: yesterday },
  { id: 't3', title: 'Write API documentation', description: null, priority: 'medium', status: 'pending', assigned_to: 'u3', assigned_by: 'u1', due_date: nextWeek, created_at: yesterday, updated_at: yesterday },
  { id: 't4', title: 'Update dependencies', description: 'Upgrade all npm packages to latest versions', priority: 'low', status: 'pending', assigned_to: 'u4', assigned_by: 'u2', due_date: nextWeek, created_at: now, updated_at: now },
  { id: 't5', title: 'Quarterly report', description: 'Compile Q1 metrics', priority: 'high', status: 'in_progress', assigned_to: 'u5', assigned_by: 'u1', due_date: tomorrow, created_at: twoDaysAgo, updated_at: now },
  { id: 't6', title: 'Code review sprint tasks', description: null, priority: 'medium', status: 'completed', assigned_to: 'u3', assigned_by: 'u2', due_date: lastWeek, created_at: twoDaysAgo, updated_at: twoDaysAgo },
  { id: 't7', title: 'Setup CI/CD pipeline', description: 'Configure GitHub Actions', priority: 'high', status: 'pending', assigned_to: null, assigned_by: 'u1', due_date: nextWeek, created_at: now, updated_at: now },
];

const INITIAL_DEPARTMENTS = ['Management', 'Engineering', 'Design', 'Marketing', 'HR'];

const INITIAL_NOTIFICATIONS: MockNotification[] = [
  { id: 'n1', user_id: 'u3', title: 'New Task Assigned', message: '"Write API documentation" has been assigned to you by Admin User', read: false, created_at: yesterday, category: 'assignment' },
  { id: 'n2', user_id: 'u4', title: 'Task Due Tomorrow', message: '"Design new landing page" is due tomorrow!', read: false, created_at: now, category: 'deadline' },
  { id: 'n3', user_id: 'u1', title: 'Task Completed', message: 'John Employee completed "Fix login bug"', read: true, created_at: twoDaysAgo, category: 'completion' },
  { id: 'n4', user_id: 'u1', title: 'System Update', message: 'New features have been deployed to the platform', read: false, created_at: now, category: 'system' },
  { id: 'n5', user_id: 'u2', title: 'Task Overdue', message: '"Quarterly report" is overdue', read: false, created_at: now, category: 'deadline' },
  { id: 'n6', user_id: 'u3', title: 'Task Completed', message: 'Your task "Code review sprint tasks" was marked complete', read: true, created_at: twoDaysAgo, category: 'completion' },
];

const INITIAL_ACTIVITY: MockActivityLog[] = [
  { id: 'a1', action: 'task_created', details: 'Admin User created task "Setup CI/CD pipeline"', created_at: now, user_id: 'u1', entity_type: 'task', entity_id: 't7' },
  { id: 'a2', action: 'status_changed', details: 'John Employee changed "Fix login bug" status to completed', created_at: yesterday, user_id: 'u3', entity_type: 'task', entity_id: 't2' },
  { id: 'a3', action: 'task_assigned', details: 'Sarah Manager assigned "Design new landing page" to Jane Developer', created_at: twoDaysAgo, user_id: 'u2', entity_type: 'task', entity_id: 't1' },
  { id: 'a4', action: 'task_created', details: 'Admin User created task "Quarterly report"', created_at: twoDaysAgo, user_id: 'u1', entity_type: 'task', entity_id: 't5' },
];

const INITIAL_COMMENTS: MockComment[] = [
  { id: 'c1', task_id: 't1', user_id: 'u4', content: 'Started working on the wireframes. Will share first draft by EOD.', created_at: yesterday },
  { id: 'c2', task_id: 't1', user_id: 'u2', content: 'Great! Please focus on mobile-first design.', created_at: now },
  { id: 'c3', task_id: 't2', user_id: 'u3', content: 'Found the root cause — it was a session timeout issue.', created_at: twoDaysAgo },
  { id: 'c4', task_id: 't5', user_id: 'u5', content: 'Need access to analytics dashboard for Q1 data.', created_at: yesterday },
];

// In-memory store with localStorage persistence
const STORAGE_KEY = 'mock_store';

interface Store {
  tasks: MockTask[];
  departments: string[];
  notifications: MockNotification[];
  activity: MockActivityLog[];
  comments: MockComment[];
}

function loadStore(): Store {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure comments array exists for older stored data
      if (!parsed.comments) parsed.comments = INITIAL_COMMENTS;
      // Ensure notification category exists
      if (parsed.notifications?.length && !parsed.notifications[0].category) {
        parsed.notifications = INITIAL_NOTIFICATIONS;
      }
      return parsed;
    }
  } catch {}
  return {
    tasks: INITIAL_TASKS,
    departments: INITIAL_DEPARTMENTS,
    notifications: INITIAL_NOTIFICATIONS,
    activity: INITIAL_ACTIVITY,
    comments: INITIAL_COMMENTS,
  };
}

function saveStore(store: Store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

let store = loadStore();

// --- Tasks ---
export const mockTasks = {
  getAll: () => [...store.tasks].sort((a, b) => b.created_at.localeCompare(a.created_at)),
  insert: (task: Omit<MockTask, 'id' | 'created_at' | 'updated_at'>) => {
    const now = new Date().toISOString();
    const newTask: MockTask = { ...task, id: 'task_' + Date.now(), created_at: now, updated_at: now };
    store.tasks.push(newTask);
    saveStore(store);
    return newTask;
  },
  update: (id: string, data: Partial<MockTask>) => {
    const idx = store.tasks.findIndex(t => t.id === id);
    if (idx === -1) return null;
    store.tasks[idx] = { ...store.tasks[idx], ...data, updated_at: new Date().toISOString() };
    saveStore(store);
    return store.tasks[idx];
  },
  delete: (id: string) => {
    store.tasks = store.tasks.filter(t => t.id !== id);
    saveStore(store);
  },
};

// --- Departments ---
export const mockDepartments = {
  getAll: () => [...store.departments].sort(),
  insert: (name: string) => {
    if (store.departments.includes(name)) return false;
    store.departments.push(name);
    saveStore(store);
    return true;
  },
  delete: (name: string) => {
    store.departments = store.departments.filter(d => d !== name);
    saveStore(store);
  },
};

// --- Notifications ---
export const mockNotifications = {
  getForUser: (userId: string) =>
    store.notifications
      .filter(n => n.user_id === userId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at)),
  markRead: (ids: string[]) => {
    for (const n of store.notifications) {
      if (ids.includes(n.id)) n.read = true;
    }
    saveStore(store);
  },
  dismiss: (id: string) => {
    store.notifications = store.notifications.filter(n => n.id !== id);
    saveStore(store);
  },
  add: (notification: Omit<MockNotification, 'id' | 'created_at'>) => {
    const newNotif: MockNotification = {
      ...notification,
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      created_at: new Date().toISOString(),
    };
    store.notifications.push(newNotif);
    saveStore(store);
    return newNotif;
  },
};

// --- Activity ---
export const mockActivity = {
  getRecent: (limit = 15) =>
    [...store.activity]
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, limit),
  add: (log: Omit<MockActivityLog, 'id'>) => {
    store.activity.push({ ...log, id: 'act_' + Date.now() });
    saveStore(store);
  },
};

// --- Comments ---
export const mockComments = {
  getForTask: (taskId: string) =>
    store.comments
      .filter(c => c.task_id === taskId)
      .sort((a, b) => a.created_at.localeCompare(b.created_at)),
  add: (comment: Omit<MockComment, 'id' | 'created_at'>) => {
    const newComment: MockComment = {
      ...comment,
      id: 'comment_' + Date.now(),
      created_at: new Date().toISOString(),
    };
    store.comments.push(newComment);
    saveStore(store);
    return newComment;
  },
};

// --- Simulated notification generator ---
const SIMULATED_NOTIFICATIONS = [
  { title: 'New Task Assigned', message: 'You have been assigned a new task', category: 'assignment' as const },
  { title: 'Deadline Approaching', message: 'A task deadline is approaching soon', category: 'deadline' as const },
  { title: 'Task Completed', message: 'A team member completed their task', category: 'completion' as const },
  { title: 'System Maintenance', message: 'Scheduled maintenance window tonight', category: 'system' as const },
  { title: 'New Comment', message: 'Someone commented on your task', category: 'system' as const },
  { title: 'Priority Changed', message: 'Task priority has been updated to high', category: 'assignment' as const },
];

let simulationInterval: ReturnType<typeof setInterval> | null = null;

export function startNotificationSimulation(userId: string, onNew: (n: MockNotification) => void) {
  if (simulationInterval) clearInterval(simulationInterval);
  simulationInterval = setInterval(() => {
    const template = SIMULATED_NOTIFICATIONS[Math.floor(Math.random() * SIMULATED_NOTIFICATIONS.length)];
    const newNotif = mockNotifications.add({
      user_id: userId,
      title: template.title,
      message: template.message,
      read: false,
      category: template.category,
    });
    onNew(newNotif);
  }, 30000); // Every 30 seconds
}

export function stopNotificationSimulation() {
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
  }
}

// Reset to initial data
export const resetMockData = () => {
  store = {
    tasks: INITIAL_TASKS,
    departments: INITIAL_DEPARTMENTS,
    notifications: INITIAL_NOTIFICATIONS,
    activity: INITIAL_ACTIVITY,
    comments: INITIAL_COMMENTS,
  };
  saveStore(store);
};
