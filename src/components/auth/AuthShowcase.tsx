import { useState, useEffect } from 'react';
import { BarChart3, Users, CheckCircle2, Clock, TrendingUp, CalendarDays, ListChecks, Shield, MessageSquare, Zap, PieChart, Activity, Target, ArrowUpRight, ArrowDownRight, Layers, GitBranch, Star } from 'lucide-react';

const sprintTasks = [
  { title: 'Design system review', assignee: 'Sarah' },
  { title: 'Q3 performance reports', assignee: 'Mike' },
  { title: 'Update onboarding flow', assignee: 'Emma' },
  { title: 'Sprint planning meeting', assignee: 'Alex' },
  { title: 'Deploy v2.4 release', assignee: 'Chris' },
  { title: 'Client feedback analysis', assignee: 'Dana' },
];

const barHeights = [35, 55, 45, 72, 60, 85, 68, 78, 50, 90];
const weeklyData = [20, 45, 35, 60, 80, 55, 70, 90, 65, 75];

export function AuthShowcase() {
  const [phase, setPhase] = useState(0);
  const [checkedTasks, setCheckedTasks] = useState<number[]>([]);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'dashboard'>('overview');
  const [pulseNotif, setPulseNotif] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [expandedMember, setExpandedMember] = useState<number | null>(null);
  const [showNotifPanel, setShowNotifPanel] = useState(false);

  const projectNotifs = [
    { icon: '🔒', title: 'Role-based access', message: 'Admin · Manager · Employee with RLS', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { icon: '🤖', title: 'AI-powered insights', message: 'Smart team analytics & summaries', color: 'text-violet-400', bg: 'bg-violet-400/10' },
    { icon: '🌐', title: 'Bilingual support', message: 'English & Japanese (i18n)', color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { icon: '⏱️', title: 'Realtime sync', message: 'Live presence & activity feed', color: 'text-amber-400', bg: 'bg-amber-400/10' },
  ];

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 700),
      setTimeout(() => setPhase(3), 1100),
      setTimeout(() => setPhase(4), 1500),
    ];
    const taskTimers = sprintTasks.map((_, i) =>
      setTimeout(() => setCheckedTasks(prev => [...prev, i]), 2000 + i * 500)
    );
    const notifTimer = setTimeout(() => setPulseNotif(true), 3500);
    return () => {
      timers.forEach(clearTimeout);
      taskTimers.forEach(clearTimeout);
      clearTimeout(notifTimer);
    };
  }, []);

  const toggleTask = (index: number) => {
    setCheckedTasks(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const overviewStats = [
    { label: 'Active Tasks', value: '24', icon: ListChecks, color: 'text-blue-400', bg: 'bg-blue-400/10', trend: '+3', up: true },
    { label: 'Team Members', value: '12', icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-400/10', trend: '+1', up: true },
    { label: 'Completed', value: '89%', icon: TrendingUp, color: 'text-accent', bg: 'bg-accent/10', trend: '+5%', up: true },
  ];

  const dashboardStats = [
    { label: 'Open Issues', value: '8', icon: Target, color: 'text-amber-400', bg: 'bg-amber-400/10', trend: '-2', up: false },
    { label: 'Deployments', value: '47', icon: GitBranch, color: 'text-violet-400', bg: 'bg-violet-400/10', trend: '+12', up: true },
    { label: 'Uptime', value: '99.9%', icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-400/10', trend: '0.1%', up: true },
  ];

  const priorities = [
    { label: 'Critical', count: 3, color: 'bg-red-400', pct: 15 },
    { label: 'High', count: 7, color: 'bg-amber-400', pct: 35 },
    { label: 'Medium', count: 8, color: 'bg-blue-400', pct: 40 },
    { label: 'Low', count: 2, color: 'bg-emerald-400', pct: 10 },
  ];

  const teamMembers = [
    { name: 'Sarah Chen', role: 'Lead', tasks: 6, done: 5, avatar: 'S' },
    { name: 'Mike Ross', role: 'Developer', tasks: 8, done: 6, avatar: 'M' },
    { name: 'Emma Liu', role: 'Designer', tasks: 5, done: 5, avatar: 'E' },
    { name: 'Alex Kim', role: 'DevOps', tasks: 4, done: 3, avatar: 'A' },
  ];

  const stats = activeTab === 'overview' ? overviewStats : dashboardStats;

  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl bg-[hsl(220,25%,8%)] shadow-2xl">
      {/* Grid bg */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(hsl(0,0%,100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0,0%,100%) 1px, transparent 1px)',
        backgroundSize: '32px 32px'
      }} />
      <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-accent/10 blur-[80px]" />
      <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-blue-500/8 blur-[60px]" />

      <div className="relative flex h-full flex-col p-5">
        {/* Top bar */}
        <div className={`relative z-40 mb-4 flex items-center justify-between transition-all duration-600 ${phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'}`}>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-400/80 hover:bg-red-400 transition-colors cursor-pointer" />
            <div className="h-3 w-3 rounded-full bg-yellow-400/80 hover:bg-yellow-400 transition-colors cursor-pointer" />
            <div className="h-3 w-3 rounded-full bg-green-400/80 hover:bg-green-400 transition-colors cursor-pointer" />
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-[hsl(220,20%,14%)] p-0.5">
            {(['overview', 'dashboard'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-4 py-1 text-[10px] font-medium capitalize transition-all duration-300 ${
                  activeTab === tab
                    ? 'bg-accent text-accent-foreground shadow-sm'
                    : 'text-[hsl(215,14%,50%)] hover:text-[hsl(215,14%,70%)]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="relative">
            <div className="cursor-pointer group" onClick={() => { setShowNotifPanel(v => !v); setPulseNotif(false); }}>
              <MessageSquare className="h-3.5 w-3.5 text-[hsl(215,14%,40%)] group-hover:text-[hsl(215,14%,60%)] transition-colors" />
              {pulseNotif && (
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-accent animate-pulse pointer-events-none" />
              )}
            </div>
            {showNotifPanel && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setShowNotifPanel(false)} />
                <div className="absolute right-0 top-5 z-30 w-60 rounded-xl border border-[hsl(220,20%,18%)] bg-[hsl(220,22%,10%)] shadow-2xl shadow-black/40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between border-b border-[hsl(220,20%,16%)] px-3 py-2">
                    <span className="text-[10px] font-semibold text-[hsl(210,20%,90%)]">About this project</span>
                    <span className="text-[8px] text-accent">{projectNotifs.length} new</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-[hsl(220,20%,15%)]">
                    {projectNotifs.map((n, i) => (
                      <div key={n.title} className="flex gap-2 px-3 py-2 hover:bg-[hsl(220,20%,13%)] transition-colors" style={{ animationDelay: `${i * 50}ms` }}>
                        <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${n.bg} text-[11px]`}>
                          <span>{n.icon}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-[10px] font-semibold ${n.color}`}>{n.title}</p>
                          <p className="text-[9px] text-[hsl(215,14%,55%)] leading-tight mt-0.5">{n.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-[hsl(220,20%,16%)] px-3 py-1.5 text-center">
                    <span className="text-[8px] text-[hsl(215,14%,40%)]">TeamHub · Portfolio demo</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className={`mb-4 grid grid-cols-3 gap-2.5 transition-all duration-700 ${phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          {stats.map((s, i) => (
            <div
              key={s.label}
              onMouseEnter={() => setHoveredCard(s.label)}
              onMouseLeave={() => setHoveredCard(null)}
              className={`group cursor-default rounded-xl border border-[hsl(220,20%,16%)] bg-[hsl(220,20%,11%)] p-3 transition-all duration-300 ${
                hoveredCard === s.label ? 'border-accent/30 bg-[hsl(220,20%,13%)] scale-[1.02] shadow-lg shadow-accent/5' : ''
              }`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className={`mb-1.5 flex h-6 w-6 items-center justify-center rounded-lg ${s.bg}`}>
                <s.icon className={`h-3 w-3 ${s.color}`} />
              </div>
              <div className="flex items-baseline gap-1">
                <p className="text-base font-bold text-[hsl(210,20%,95%)]">{s.value}</p>
                <span className={`text-[7px] font-medium flex items-center gap-0.5 ${s.up ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {s.up ? <ArrowUpRight className="h-2 w-2" /> : <ArrowDownRight className="h-2 w-2" />}
                  {s.trend}
                </span>
              </div>
              <p className="text-[9px] text-[hsl(215,14%,46%)]">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="grid flex-1 grid-cols-5 gap-2.5 min-h-0">
          {/* Left panel - different per tab */}
          <div className={`col-span-3 flex flex-col rounded-xl border border-[hsl(220,20%,16%)] bg-[hsl(220,20%,11%)] p-3 transition-all duration-700 ${phase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            {activeTab === 'overview' ? (
              <>
                <div className="mb-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-[11px] font-semibold text-[hsl(210,20%,95%)]">Sprint Progress</span>
                  </div>
                  <span className="text-[9px] font-medium text-accent">{checkedTasks.length}/{sprintTasks.length}</span>
                </div>
                <div className="space-y-1 flex-1 overflow-hidden">
                  {sprintTasks.map((task, i) => {
                    const checked = checkedTasks.includes(i);
                    return (
                      <div
                        key={task.title}
                        onClick={() => toggleTask(i)}
                        className={`group flex items-center gap-2 rounded-lg px-2 py-1.5 cursor-pointer transition-all duration-400 ${
                          checked ? 'bg-emerald-400/5' : 'hover:bg-[hsl(220,20%,14%)]'
                        }`}
                      >
                        <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                          checked
                            ? 'border-emerald-400 bg-emerald-400'
                            : i === checkedTasks.length
                              ? 'border-accent/60 animate-pulse'
                              : 'border-[hsl(220,20%,25%)] group-hover:border-[hsl(220,20%,40%)]'
                        }`}>
                          {checked && (
                            <svg className="h-2.5 w-2.5 text-[hsl(220,25%,8%)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className={`text-[10px] truncate transition-all duration-300 ${
                          checked ? 'text-[hsl(215,14%,40%)] line-through' : 'text-[hsl(210,20%,85%)]'
                        }`}>{task.title}</span>
                        <span className="ml-auto text-[8px] text-[hsl(215,14%,35%)] shrink-0">{task.assignee}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-2 h-1 w-full rounded-full bg-[hsl(220,20%,16%)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-accent transition-all duration-700 ease-out"
                    style={{ width: `${(checkedTasks.length / sprintTasks.length) * 100}%` }}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="mb-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-violet-400" />
                    <span className="text-[11px] font-semibold text-[hsl(210,20%,95%)]">Team Overview</span>
                  </div>
                  <span className="text-[9px] font-medium text-violet-400">{teamMembers.length} members</span>
                </div>
                <div className="space-y-1.5 flex-1 overflow-hidden">
                  {teamMembers.map((m, i) => {
                    const expanded = expandedMember === i;
                    const pct = Math.round((m.done / m.tasks) * 100);
                    return (
                      <div
                        key={m.name}
                        onClick={() => setExpandedMember(expanded ? null : i)}
                        className={`rounded-lg px-2 py-1.5 cursor-pointer transition-all duration-300 ${
                          expanded ? 'bg-[hsl(220,20%,14%)]' : 'hover:bg-[hsl(220,20%,13%)]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="h-5 w-5 shrink-0 rounded-full bg-gradient-to-br from-violet-400/40 to-violet-400/20 flex items-center justify-center">
                            <span className="text-[8px] font-bold text-violet-300">{m.avatar}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-medium text-[hsl(210,20%,90%)] truncate">{m.name}</span>
                              <span className="text-[8px] text-[hsl(215,14%,45%)]">{m.done}/{m.tasks}</span>
                            </div>
                          </div>
                        </div>
                        {expanded && (
                          <div className="mt-1.5 ml-7 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[8px] text-[hsl(215,14%,50%)]">{m.role}</span>
                              <div className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, si) => (
                                  <Star key={si} className={`h-2 w-2 ${si < Math.ceil(pct / 20) ? 'text-amber-400 fill-amber-400' : 'text-[hsl(220,20%,25%)]'}`} />
                                ))}
                              </div>
                            </div>
                            <div className="h-1 w-full rounded-full bg-[hsl(220,20%,18%)] overflow-hidden">
                              <div className="h-full rounded-full bg-violet-400/70 transition-all duration-500" style={{ width: `${pct}%` }} />
                            </div>
                            <p className="text-[7px] text-emerald-400">{pct}% completion rate</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Right sidebar widgets - different per tab */}
          <div className={`col-span-2 flex flex-col gap-2.5 transition-all duration-700 ${phase >= 4 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-6'}`}>
            {activeTab === 'overview' ? (
              <>
                {/* Calendar */}
                <div
                  onMouseEnter={() => setHoveredCard('calendar')}
                  onMouseLeave={() => setHoveredCard(null)}
                  className={`rounded-xl border border-[hsl(220,20%,16%)] bg-[hsl(220,20%,11%)] p-2.5 transition-all duration-300 ${
                    hoveredCard === 'calendar' ? 'border-blue-400/30 shadow-lg shadow-blue-400/5' : ''
                  }`}
                >
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <CalendarDays className="h-3 w-3 text-blue-400" />
                    <span className="text-[9px] font-semibold text-[hsl(210,20%,95%)]">Upcoming</span>
                  </div>
                  <div className="space-y-1">
                    {[
                      { t: 'Team standup', time: '9:00', c: 'text-amber-400' },
                      { t: 'Design review', time: '11:30', c: 'text-blue-400' },
                      { t: 'Sprint retro', time: '14:00', c: 'text-emerald-400' },
                    ].map(ev => (
                      <div key={ev.t} className="flex items-center gap-1.5 group cursor-pointer hover:bg-[hsl(220,20%,14%)] rounded-md px-1 py-0.5 transition-colors">
                        <Clock className="h-2.5 w-2.5 text-[hsl(215,14%,35%)] group-hover:text-[hsl(215,14%,55%)] transition-colors" />
                        <span className="text-[9px] text-[hsl(210,20%,75%)]">{ev.t}</span>
                        <span className={`ml-auto text-[8px] font-medium ${ev.c}`}>{ev.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Performance chart */}
                <div
                  onMouseEnter={() => setHoveredCard('chart')}
                  onMouseLeave={() => setHoveredCard(null)}
                  className={`rounded-xl border border-[hsl(220,20%,16%)] bg-[hsl(220,20%,11%)] p-2.5 transition-all duration-300 ${
                    hoveredCard === 'chart' ? 'border-accent/30 shadow-lg shadow-accent/5' : ''
                  }`}
                >
                  <div className="mb-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <BarChart3 className="h-3 w-3 text-accent" />
                      <span className="text-[9px] font-semibold text-[hsl(210,20%,95%)]">Performance</span>
                    </div>
                    <Zap className="h-2.5 w-2.5 text-accent/60" />
                  </div>
                  <div className="flex items-end gap-[3px] h-10">
                    {barHeights.map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-[2px] bg-gradient-to-t from-accent/40 to-accent/80 transition-all duration-700 ease-out hover:from-accent/60 hover:to-accent cursor-pointer"
                        style={{
                          height: phase >= 4 ? `${h}%` : '0%',
                          transitionDelay: `${i * 60}ms`,
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Activity feed */}
                <div
                  onMouseEnter={() => setHoveredCard('activity')}
                  onMouseLeave={() => setHoveredCard(null)}
                  className={`rounded-xl border border-[hsl(220,20%,16%)] bg-[hsl(220,20%,11%)] p-2.5 flex-1 transition-all duration-300 ${
                    hoveredCard === 'activity' ? 'border-emerald-400/30 shadow-lg shadow-emerald-400/5' : ''
                  }`}
                >
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <Shield className="h-3 w-3 text-emerald-400" />
                    <span className="text-[9px] font-semibold text-[hsl(210,20%,95%)]">Team Activity</span>
                  </div>
                  <div className="space-y-1.5">
                    {[
                      { name: 'Sarah', action: 'completed review', time: '2m' },
                      { name: 'Mike', action: 'added comment', time: '5m' },
                      { name: 'Emma', action: 'joined sprint', time: '12m' },
                    ].map((a, i) => (
                      <div key={i} className="flex items-start gap-1.5 cursor-pointer hover:bg-[hsl(220,20%,14%)] rounded-md px-1 py-0.5 transition-colors">
                        <div className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-gradient-to-br from-accent/40 to-accent/20 flex items-center justify-center">
                          <span className="text-[7px] font-bold text-accent">{a.name[0]}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[8px] text-[hsl(210,20%,80%)] truncate">
                            <span className="font-medium">{a.name}</span>{' '}{a.action}
                          </p>
                          <p className="text-[7px] text-[hsl(215,14%,35%)]">{a.time} ago</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Priority breakdown */}
                <div
                  onMouseEnter={() => setHoveredCard('priority')}
                  onMouseLeave={() => setHoveredCard(null)}
                  className={`rounded-xl border border-[hsl(220,20%,16%)] bg-[hsl(220,20%,11%)] p-2.5 transition-all duration-300 ${
                    hoveredCard === 'priority' ? 'border-amber-400/30 shadow-lg shadow-amber-400/5' : ''
                  }`}
                >
                  <div className="mb-2 flex items-center gap-1.5">
                    <Layers className="h-3 w-3 text-amber-400" />
                    <span className="text-[9px] font-semibold text-[hsl(210,20%,95%)]">By Priority</span>
                  </div>
                  <div className="space-y-1.5">
                    {priorities.map(p => (
                      <div
                        key={p.label}
                        onClick={() => setSelectedPriority(selectedPriority === p.label ? null : p.label)}
                        className={`flex items-center gap-2 cursor-pointer rounded-md px-1.5 py-1 transition-all duration-200 ${
                          selectedPriority === p.label ? 'bg-[hsl(220,20%,15%)]' : 'hover:bg-[hsl(220,20%,13%)]'
                        }`}
                      >
                        <div className={`h-2 w-2 rounded-full ${p.color}`} />
                        <span className="text-[9px] text-[hsl(210,20%,80%)] flex-1">{p.label}</span>
                        <span className="text-[8px] font-medium text-[hsl(215,14%,50%)]">{p.count}</span>
                      </div>
                    ))}
                  </div>
                  {/* Mini bar */}
                  <div className="mt-2 flex h-1.5 w-full rounded-full overflow-hidden gap-[1px]">
                    {priorities.map(p => (
                      <div
                        key={p.label}
                        className={`${p.color} transition-all duration-500 ${selectedPriority && selectedPriority !== p.label ? 'opacity-20' : 'opacity-100'}`}
                        style={{ width: `${p.pct}%` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Weekly trend */}
                <div
                  onMouseEnter={() => setHoveredCard('weekly')}
                  onMouseLeave={() => setHoveredCard(null)}
                  className={`rounded-xl border border-[hsl(220,20%,16%)] bg-[hsl(220,20%,11%)] p-2.5 transition-all duration-300 ${
                    hoveredCard === 'weekly' ? 'border-violet-400/30 shadow-lg shadow-violet-400/5' : ''
                  }`}
                >
                  <div className="mb-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <PieChart className="h-3 w-3 text-violet-400" />
                      <span className="text-[9px] font-semibold text-[hsl(210,20%,95%)]">Weekly Trend</span>
                    </div>
                    <span className="text-[7px] text-emerald-400 font-medium">+18%</span>
                  </div>
                  <div className="flex items-end gap-[3px] h-10">
                    {weeklyData.map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-[2px] bg-gradient-to-t from-violet-400/40 to-violet-400/80 transition-all duration-700 ease-out hover:from-violet-400/60 hover:to-violet-400 cursor-pointer"
                        style={{
                          height: phase >= 4 ? `${h}%` : '0%',
                          transitionDelay: `${i * 60}ms`,
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Recent deploys */}
                <div
                  onMouseEnter={() => setHoveredCard('deploys')}
                  onMouseLeave={() => setHoveredCard(null)}
                  className={`rounded-xl border border-[hsl(220,20%,16%)] bg-[hsl(220,20%,11%)] p-2.5 flex-1 transition-all duration-300 ${
                    hoveredCard === 'deploys' ? 'border-emerald-400/30 shadow-lg shadow-emerald-400/5' : ''
                  }`}
                >
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <GitBranch className="h-3 w-3 text-emerald-400" />
                    <span className="text-[9px] font-semibold text-[hsl(210,20%,95%)]">Recent Deploys</span>
                  </div>
                  <div className="space-y-1.5">
                    {[
                      { branch: 'main', status: 'success', time: '3m', hash: 'a1b2c3' },
                      { branch: 'feat/auth', status: 'building', time: '8m', hash: 'd4e5f6' },
                      { branch: 'fix/api', status: 'success', time: '1h', hash: 'g7h8i9' },
                    ].map((d, i) => (
                      <div key={i} className="flex items-center gap-1.5 cursor-pointer hover:bg-[hsl(220,20%,14%)] rounded-md px-1 py-0.5 transition-colors">
                        <div className={`h-1.5 w-1.5 rounded-full ${
                          d.status === 'success' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
                        }`} />
                        <span className="text-[9px] text-[hsl(210,20%,80%)] flex-1 truncate">{d.branch}</span>
                        <span className="text-[7px] font-mono text-[hsl(215,14%,40%)]">{d.hash}</span>
                        <span className="text-[7px] text-[hsl(215,14%,35%)]">{d.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
