import { useState, useRef, useCallback } from 'react';
import { mockComments, DEMO_USERS, type MockComment } from '@/lib/mockData';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useSimulatedTyping } from '@/hooks/usePresence';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ja, enUS } from 'date-fns/locale';

interface TaskCommentsProps {
  taskId: string;
}

function TypingIndicator({ name }: { name: string; dots: number }) {
  return (
    <div className="flex items-center gap-2 py-1 animate-in fade-in slide-in-from-bottom-1 duration-300">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/20 text-xs font-semibold text-accent">
        {name.charAt(0).toUpperCase()}
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground italic">{name}</span>
        <span className="flex gap-0.5">
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '300ms' }} />
        </span>
      </div>
    </div>
  );
}

export function TaskComments({ taskId }: TaskCommentsProps) {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const [comments, setComments] = useState<MockComment[]>(() => mockComments.getForTask(taskId));
  const [newComment, setNewComment] = useState('');
  const dateLocale = lang === 'ja' ? ja : enUS;
  const scrollRef = useRef<HTMLDivElement>(null);
  const simulatedTyper = useSimulatedTyping(taskId);

  const getUserName = (userId: string) => DEMO_USERS.find(u => u.id === userId)?.full_name ?? 'Unknown';
  const getUserInitial = (userId: string) => getUserName(userId).charAt(0).toUpperCase();

  const handleSubmit = useCallback(() => {
    if (!newComment.trim() || !user) return;
    const comment = mockComments.add({ task_id: taskId, user_id: user.id, content: newComment.trim() });
    setComments(prev => [...prev, comment]);
    setNewComment('');
    // Auto-scroll to bottom
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, 50);
  }, [newComment, user, taskId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold">{t('comments')} ({comments.length})</h4>
      <ScrollArea className="max-h-48" ref={scrollRef as any}>
        <div className="space-y-3 pr-2">
          {comments.length === 0 && !simulatedTyper && (
            <p className="text-xs text-muted-foreground text-center py-3">{t('noComments')}</p>
          )}
          {comments.map(c => (
            <div key={c.id} className="flex gap-2.5 animate-in fade-in slide-in-from-bottom-1 duration-200">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                {getUserInitial(c.user_id)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">{getUserName(c.user_id)}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {formatDistanceToNow(new Date(c.created_at), { addSuffix: true, locale: dateLocale })}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{c.content}</p>
              </div>
            </div>
          ))}
          {simulatedTyper && (
            <TypingIndicator name={simulatedTyper.name} dots={simulatedTyper.dots} />
          )}
        </div>
      </ScrollArea>
      <div className="flex gap-2">
        <Textarea
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('addComment')}
          className="min-h-[60px] text-xs resize-none"
        />
        <Button size="icon" onClick={handleSubmit} disabled={!newComment.trim()} className="shrink-0 self-end bg-accent text-accent-foreground hover:bg-accent/90">
          <Send className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
