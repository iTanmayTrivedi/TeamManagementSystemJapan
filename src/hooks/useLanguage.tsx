import { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'ja';

const translations = {
  en: {
    // Auth
    teamHub: 'TeamHub',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    signInToAccount: 'Sign in to your account',
    createAccount: 'Create a new account',
    selectRole: 'Select Your Role',
    fullName: 'Full Name',
    email: 'Email',
    password: 'Password',
    loading: 'Loading...',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
    accountCreated: 'Account created!',
    checkEmail: 'Please check your email to verify your account.',
    error: 'Error',

    // Roles
    admin: 'Admin',
    manager: 'Manager',
    employee: 'Employee',
    adminDesc: 'Full system access & management',
    managerDesc: 'Create & assign tasks to team',
    employeeDesc: 'View tasks & update progress',

    // Sidebar
    dashboard: 'Dashboard',
    employees: 'Employees',
    departments: 'Departments',
    tasks: 'Tasks',
    signOut: 'Sign Out',

    // Dashboard
    welcomeBack: 'Welcome back,',
    overviewDesc: "Here's an overview of your workspace.",
    totalTasks: 'Total Tasks',
    completed: 'Completed',
    overdue: 'Overdue',
    inProgress: 'In Progress',
    employeesLabel: 'Employees',
    overallCompletion: 'Overall Completion',
    tasksCompleted: 'tasks completed',
    of: 'of',
    tasksPerEmployee: 'Tasks per Employee',
    tasksCount: 'tasks',
    complete: 'complete',
    recentActivity: 'Recent Activity',
    noActivity: 'No activity yet',

    // Tasks
    myTasks: 'My Tasks',
    tasksAssigned: 'tasks assigned to you',
    totalTasksLabel: 'total tasks',
    newTask: 'New Task',
    searchTasks: 'Search tasks...',
    allStatuses: 'All Statuses',
    pending: 'Pending',
    allPriority: 'All Priority',
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    allEmployees: 'All Employees',
    allDates: 'All Dates',
    today: 'Today',
    thisWeek: 'This Week',
    title: 'Title',
    assignedTo: 'Assigned To',
    priority: 'Priority',
    status: 'Status',
    dueDate: 'Due Date',
    actions: 'Actions',
    start: 'Start',
    description: 'Description',
    assignTo: 'Assign To',
    selectEmployee: 'Select employee',
    cancel: 'Cancel',
    saveChanges: 'Save Changes',
    createTask: 'Create Task',
    editTask: 'Edit Task',
    taskUpdated: 'Task updated',
    taskCreated: 'Task created',
    taskDeleted: 'Task deleted',
    noTasks: 'No tasks found',

    // Employees
    employeeDirectory: 'Employee Directory',
    teamMembers: 'team members',
    searchEmployees: 'Search employees...',
    name: 'Name',
    department: 'Department',
    role: 'Role',
    editEmployee: 'Edit Employee',
    employeeUpdated: 'Employee updated',
    employeeRemoved: 'Employee removed',
    noEmployees: 'No employees found',
    save: 'Save',
    active: 'Active',
    inactive: 'Inactive',

    // Departments
    manageDepartments: 'Manage company departments',
    newDeptPlaceholder: 'New department name...',
    add: 'Add',
    departmentName: 'Department Name',
    departmentCreated: 'Department created',
    departmentDeleted: 'Department deleted',
    noDepartments: 'No departments yet',

    // Notifications
    notifications: 'Notifications',
    markAllRead: 'Mark all read',
    noNotifications: 'No notifications yet',

    // Comments
    comments: 'Comments',
    noComments: 'No comments yet',
    addComment: 'Add a comment... (Ctrl+Enter to send)',

    // Charts
    tasksByStatus: 'Tasks by Status',
    tasksByPriority: 'Tasks by Priority',

    // CSV
    exportCSV: 'Export CSV',

    // Profile
    profileSettings: 'Profile Settings',
    profileSettingsDesc: 'Manage your personal information and preferences.',
    profileInfo: 'Personal Information',
    avatar: 'Profile Photo',
    avatarHint: 'JPG, PNG or WebP. Max 2MB.',
    avatarTooLarge: 'Image must be under 2MB',
    uploadPhoto: 'Upload Photo',
    emailReadOnly: 'Email cannot be changed.',
    roleReadOnly: 'Role is managed by administrators.',
    profileUpdated: 'Profile updated successfully',
    demoProfileNote: 'Profile changes are stored locally in demo mode.',

    // Language
    language: 'Language',

    // AI Insights
    aiInsights: 'AI Insights',
    aiSummary: 'Summary',
    aiPriority: 'Priority',
    aiActivity: 'Activity',
    aiGenerate: 'Generate',
    aiGenerating: 'Analyzing...',
    aiRefresh: 'Refresh',
    aiClickGenerate: 'Click generate to get AI-powered insights.',
    aiError: 'Failed to get AI insights. Please try again.',

    // Kanban
    kanbanBoard: 'Kanban Board',
    kanbanDesc: 'Drag and drop tasks between columns to update status.',

    // Calendar
    taskCalendar: 'Task Calendar',
    calendarDesc: 'View tasks organized by their due dates.',
    selectDate: 'Select a Date',
    clickDateToView: 'Click a date to view tasks.',
    noTasksOnDate: 'No tasks due on this date.',

    // Analytics
    performanceAnalytics: 'Performance Analytics',
    analyticsDesc: 'Employee productivity metrics and team performance overview.',
    avgCompletion: 'Avg. Completion',
    totalCompleted: 'Total Completed',
    overdueItems: 'Overdue Items',
    requiresAttention: 'Requires attention',
    topPerformer: 'Top Performer',
    completionRate: 'completion rate',
    employeePerformance: 'Employee Performance',
    weeklyTrend: 'Weekly Trend',
    created: 'Created',
    priorityDistribution: 'Priority Distribution',
    departmentBreakdown: 'Department Breakdown',
    employeeRanking: 'Employee Ranking',

    // Activity Timeline
    activityTimeline: 'Activity Timeline',
    activityTimelineDesc: 'Detailed chronological log of all workspace activity.',
    searchActivity: 'Search activity...',
    allActions: 'All Actions',
    taskAssigned: 'Task Assigned',
    statusChanged: 'Status Changed',

    // Presence & Realtime
    teamPresence: 'Team Presence',
    online: 'Online',
    offline: 'Offline',
    typing: 'typing...',
    lastSeen: 'Last seen',
    taskSyncedRealtime: 'Task updated in real-time',
    liveUpdates: 'Live Updates',
    isTyping: 'is typing',
  },
  ja: {
    // Auth
    teamHub: 'チームハブ',
    signIn: 'ログイン',
    signUp: 'アカウント作成',
    signInToAccount: 'アカウントにログイン',
    createAccount: '新しいアカウントを作成',
    selectRole: '役割を選択',
    fullName: '氏名',
    email: 'メールアドレス',
    password: 'パスワード',
    loading: '読み込み中...',
    noAccount: 'アカウントをお持ちでない方',
    hasAccount: 'すでにアカウントをお持ちの方',
    accountCreated: 'アカウントが作成されました！',
    checkEmail: 'メールアドレスの確認をしてください。',
    error: 'エラー',

    // Roles
    admin: '管理者',
    manager: 'マネージャー',
    employee: '従業員',
    adminDesc: 'システム全体の管理',
    managerDesc: 'タスクの作成・割り当て',
    employeeDesc: 'タスクの確認・進捗更新',

    // Sidebar
    dashboard: 'ダッシュボード',
    employees: '従業員',
    departments: '部署',
    tasks: 'タスク',
    signOut: 'ログアウト',

    // Dashboard
    welcomeBack: 'おかえりなさい、',
    overviewDesc: 'ワークスペースの概要です。',
    totalTasks: '全タスク',
    completed: '完了',
    overdue: '期限超過',
    inProgress: '進行中',
    employeesLabel: '従業員',
    overallCompletion: '全体の進捗',
    tasksCompleted: 'タスク完了',
    of: '/',
    tasksPerEmployee: '従業員別タスク',
    tasksCount: 'タスク',
    complete: '完了',
    recentActivity: '最近のアクティビティ',
    noActivity: 'アクティビティはまだありません',

    // Tasks
    myTasks: 'マイタスク',
    tasksAssigned: '件のタスクが割り当てられています',
    totalTasksLabel: '件の全タスク',
    newTask: '新規タスク',
    searchTasks: 'タスクを検索...',
    allStatuses: '全ステータス',
    pending: '未着手',
    allPriority: '全優先度',
    low: '低',
    medium: '中',
    high: '高',
    allEmployees: '全従業員',
    allDates: '全日付',
    today: '今日',
    thisWeek: '今週',
    title: 'タイトル',
    assignedTo: '担当者',
    priority: '優先度',
    status: 'ステータス',
    dueDate: '期限',
    actions: '操作',
    start: '開始',
    description: '説明',
    assignTo: '担当者',
    selectEmployee: '従業員を選択',
    cancel: 'キャンセル',
    saveChanges: '変更を保存',
    createTask: 'タスク作成',
    editTask: 'タスク編集',
    taskUpdated: 'タスクが更新されました',
    taskCreated: 'タスクが作成されました',
    taskDeleted: 'タスクが削除されました',
    noTasks: 'タスクが見つかりません',

    // Employees
    employeeDirectory: '従業員一覧',
    teamMembers: '名のメンバー',
    searchEmployees: '従業員を検索...',
    name: '氏名',
    department: '部署',
    role: '役割',
    editEmployee: '従業員を編集',
    employeeUpdated: '従業員が更新されました',
    employeeRemoved: '従業員が削除されました',
    noEmployees: '従業員が見つかりません',
    save: '保存',
    active: '有効',
    inactive: '無効',

    // Departments
    manageDepartments: '部署の管理',
    newDeptPlaceholder: '新しい部署名...',
    add: '追加',
    departmentName: '部署名',
    departmentCreated: '部署が作成されました',
    departmentDeleted: '部署が削除されました',
    noDepartments: '部署はまだありません',

    // Notifications
    notifications: '通知',
    markAllRead: 'すべて既読にする',
    noNotifications: '通知はまだありません',

    // Comments
    comments: 'コメント',
    noComments: 'コメントはまだありません',
    addComment: 'コメントを追加... (Ctrl+Enterで送信)',

    // Charts
    tasksByStatus: 'ステータス別タスク',
    tasksByPriority: '優先度別タスク',

    // CSV
    exportCSV: 'CSV出力',

    // Profile
    profileSettings: 'プロフィール設定',
    profileSettingsDesc: '個人情報と設定を管理します。',
    profileInfo: '個人情報',
    avatar: 'プロフィール写真',
    avatarHint: 'JPG、PNG、WebP。最大2MB。',
    avatarTooLarge: '画像は2MB以下にしてください',
    uploadPhoto: '写真をアップロード',
    emailReadOnly: 'メールアドレスは変更できません。',
    roleReadOnly: '役割は管理者によって管理されます。',
    profileUpdated: 'プロフィールが更新されました',
    demoProfileNote: 'デモモードではプロフィールの変更はローカルに保存されます。',

    // Language
    language: '言語',

    // AI Insights
    aiInsights: 'AI分析',
    aiSummary: 'サマリー',
    aiPriority: '優先度',
    aiActivity: 'アクティビティ',
    aiGenerate: '生成',
    aiGenerating: '分析中...',
    aiRefresh: '更新',
    aiClickGenerate: '生成ボタンを押してAIの分析結果を取得します。',
    aiError: 'AI分析に失敗しました。もう一度お試しください。',

    // Kanban
    kanbanBoard: 'カンバンボード',
    kanbanDesc: 'タスクをドラッグ＆ドロップしてステータスを更新します。',

    // Calendar
    taskCalendar: 'タスクカレンダー',
    calendarDesc: '期限日別にタスクを確認できます。',
    selectDate: '日付を選択',
    clickDateToView: '日付をクリックしてタスクを表示します。',
    noTasksOnDate: 'この日にタスクはありません。',

    // Analytics
    performanceAnalytics: 'パフォーマンス分析',
    analyticsDesc: '従業員の生産性指標とチームパフォーマンスの概要。',
    avgCompletion: '平均完了率',
    totalCompleted: '完了数',
    overdueItems: '期限超過',
    requiresAttention: '対応が必要です',
    topPerformer: 'トップパフォーマー',
    completionRate: '完了率',
    employeePerformance: '従業員パフォーマンス',
    weeklyTrend: '週間トレンド',
    created: '作成',
    priorityDistribution: '優先度分布',
    departmentBreakdown: '部署別内訳',
    employeeRanking: '従業員ランキング',

    // Activity Timeline
    activityTimeline: 'アクティビティタイムライン',
    activityTimelineDesc: 'ワークスペースの全アクティビティの詳細な時系列ログ。',
    searchActivity: 'アクティビティを検索...',
    allActions: '全アクション',
    taskAssigned: 'タスク割り当て',
    statusChanged: 'ステータス変更',

    // Presence & Realtime
    teamPresence: 'チームプレゼンス',
    online: 'オンライン',
    offline: 'オフライン',
    typing: '入力中...',
    lastSeen: '最終ログイン',
    taskSyncedRealtime: 'タスクがリアルタイムで更新されました',
    liveUpdates: 'ライブ更新',
    isTyping: '入力中',
  },
} as const;

type TranslationKey = keyof typeof translations.en;

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('app-language');
    return (saved === 'ja' ? 'ja' : 'en') as Language;
  });

  const changeLang = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('app-language', newLang);
  };

  const t = (key: TranslationKey): string => {
    return translations[lang][key] ?? translations.en[key] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
