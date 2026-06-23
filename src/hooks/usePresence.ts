import { useState, useEffect, useCallback } from 'react';
import { DEMO_USERS, type MockUser, type AppRole } from '@/lib/mockData';

export interface PresenceUser {
  id: string;
  name: string;
  role: AppRole;
  department: string;
  isOnline: boolean;
  lastSeen: Date;
  isTyping: boolean;
  typingContext?: string; // e.g. "task:t1"
}

const TYPING_EVENT = 'presence:typing';
const TYPING_STOP_EVENT = 'presence:typing-stop';

export function emitTyping(userId: string, context: string) {
  window.dispatchEvent(new CustomEvent(TYPING_EVENT, { detail: { userId, context } }));
}

export function emitTypingStop(userId: string, context: string) {
  window.dispatchEvent(new CustomEvent(TYPING_STOP_EVENT, { detail: { userId, context } }));
}

// Simulate realistic online presence for demo users
export function usePresence(currentUserId: string | undefined) {
  const [presenceList, setPresenceList] = useState<PresenceUser[]>([]);

  const buildPresence = useCallback(() => {
    const now = new Date();
    return DEMO_USERS.map((u: MockUser): PresenceUser => {
      // Current user is always online
      if (u.id === currentUserId) {
        return { id: u.id, name: u.full_name, role: u.role, department: u.department, isOnline: true, lastSeen: now, isTyping: false };
      }
      // Simulate: some users online, some recently active, some offline
      const seed = u.id.charCodeAt(1) + now.getMinutes();
      const isOnline = seed % 3 !== 0; // ~66% online
      const minutesAgo = isOnline ? 0 : (seed % 45) + 1;
      const lastSeen = new Date(now.getTime() - minutesAgo * 60000);
      return { id: u.id, name: u.full_name, role: u.role, department: u.department, isOnline, lastSeen, isTyping: false };
    });
  }, [currentUserId]);

  useEffect(() => {
    setPresenceList(buildPresence());
    // Refresh presence every 30s to simulate changes
    const interval = setInterval(() => {
      setPresenceList(buildPresence());
    }, 30000);
    return () => clearInterval(interval);
  }, [buildPresence]);

  // Listen for typing events
  useEffect(() => {
    const onTyping = (e: Event) => {
      const { userId, context } = (e as CustomEvent).detail;
      setPresenceList(prev => prev.map(p =>
        p.id === userId ? { ...p, isTyping: true, typingContext: context } : p
      ));
    };
    const onStop = (e: Event) => {
      const { userId } = (e as CustomEvent).detail;
      setPresenceList(prev => prev.map(p =>
        p.id === userId ? { ...p, isTyping: false, typingContext: undefined } : p
      ));
    };
    window.addEventListener(TYPING_EVENT, onTyping);
    window.addEventListener(TYPING_STOP_EVENT, onStop);
    return () => {
      window.removeEventListener(TYPING_EVENT, onTyping);
      window.removeEventListener(TYPING_STOP_EVENT, onStop);
    };
  }, []);

  return presenceList;
}

// Hook for simulating other users typing in a specific task context
export function useSimulatedTyping(taskId: string) {
  const [simulatedTyper, setSimulatedTyper] = useState<{ name: string; dots: number } | null>(null);

  useEffect(() => {
    // Randomly simulate another user typing after a delay
    const delay = 2000 + Math.random() * 5000;
    const timeout = setTimeout(() => {
      // Pick a random other user
      const typer = DEMO_USERS[Math.floor(Math.random() * (DEMO_USERS.length - 1)) + 1];
      emitTyping(typer.id, `task:${taskId}`);
      setSimulatedTyper({ name: typer.full_name, dots: 1 });

      // Animate dots
      let dotCount = 1;
      const dotInterval = setInterval(() => {
        dotCount = (dotCount % 3) + 1;
        setSimulatedTyper(prev => prev ? { ...prev, dots: dotCount } : null);
      }, 500);

      // Stop after 3-6 seconds
      const stopDelay = 3000 + Math.random() * 3000;
      setTimeout(() => {
        clearInterval(dotInterval);
        emitTypingStop(typer.id, `task:${taskId}`);
        setSimulatedTyper(null);
      }, stopDelay);

      return () => clearInterval(dotInterval);
    }, delay);

    return () => clearTimeout(timeout);
  }, [taskId]);

  return simulatedTyper;
}
