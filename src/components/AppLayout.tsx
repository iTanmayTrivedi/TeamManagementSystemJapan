import { ReactNode, useState } from 'react';
import { AppSidebar } from './AppSidebar';
import { PageTransition } from './PageTransition';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, UserCircle } from 'lucide-react';

export function AppLayout({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const AVATAR_STORAGE_KEY = 'user_avatar_';
  const avatarUrl = profile?.id ? localStorage.getItem(AVATAR_STORAGE_KEY + profile.id) : null;

  if (isMobile) {
    return (
      <div className="flex h-screen flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-border bg-background px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={() => setOpen(true)} className="shrink-0">
              <Menu className="h-5 w-5" />
            </Button>
            <span className="text-sm font-semibold">TeamHub</span>
          </div>
          <button onClick={() => navigate('/profile')} className="shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover border border-border" />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground border border-border">
                {profile?.full_name?.charAt(0)?.toUpperCase() ?? <UserCircle className="h-5 w-5" />}
              </div>
            )}
          </button>
        </header>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="left" className="w-64 p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <AppSidebar onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
        <main className="flex-1 overflow-y-auto p-4">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
}
