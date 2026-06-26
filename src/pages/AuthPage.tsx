import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Users, ClipboardList, UserCog } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { DEMO_USERS, type AppRole } from '@/lib/mockData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AuthShowcase } from '@/components/auth/AuthShowcase';
import { supabase } from '@/integrations/supabase/client';

const roleIcons: Record<AppRole, typeof Shield> = {
  admin: UserCog,
  manager: ClipboardList,
  employee: Users,
};

type AuthMode = 'signin' | 'signup' | 'forgot';

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState<AppRole>('employee');
  const [loading, setLoading] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { signIn, signUp, loginAsDemo, resetPassword, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'forgot') {
        const { error } = await resetPassword(email);
        if (error) throw error;
        setResetSent(true);
        toast({ title: 'Reset link sent!', description: 'Check your email for a password reset link.' });
      } else if (mode === 'signup') {
        const { error } = await signUp(email, password, fullName, selectedRole);
        if (error) throw error;
        setSignUpSuccess(true);
        toast({ title: 'Verification email sent!', description: 'Please check your inbox and verify your email to complete sign up.' });
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        navigate('/dashboard');
      }
    } catch (err: any) {
      toast({ title: t('error'), description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (userId: string) => {
    loginAsDemo(userId);
    navigate('/dashboard');
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/dashboard` },
      });
      if (error) throw error;
    } catch (err: any) {
      toast({ title: t('error'), description: err.message, variant: 'destructive' });
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left side - form */}
      <div className="flex w-full flex-col justify-between px-6 py-8 min-[960px]:w-1/2 min-[960px]:px-12 xl:px-24">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/favicon.png" alt="TeamHub" className="h-8 w-8 rounded-lg" />
            <span className="text-lg font-bold text-foreground">TeamHub</span>
          </div>
          <LanguageSwitcher variant="page" />
        </div>

        {/* Center content */}
        <div className="mx-auto w-full max-w-md">
          <h1 className="mb-2 text-center text-3xl font-bold tracking-tight text-foreground min-[960px]:text-4xl xl:text-5xl" style={{ fontFamily: "'Inter', sans-serif" }}>
            {mode === 'signin' ? 'Welcome back' : mode === 'signup' ? 'Get started' : 'Reset password'}
          </h1>
          <p className="mb-8 text-center text-base text-muted-foreground">
            {mode === 'signin' ? 'Manage your team, track progress effortlessly' : mode === 'signup' ? 'Create your account and start collaborating' : 'Enter your email to receive a reset link'}
          </p>

          {/* Demo login buttons */}
          <div className="mb-4 space-y-2">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Quick Demo Login</span>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_USERS.filter(u => ['admin', 'manager', 'employee'].includes(u.role)).slice(0, 3).map(u => {
                const Icon = roleIcons[u.role];
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleDemoLogin(u.id)}
                    className={cn(
                      'group flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-card p-3 text-center',
                      'transition-all duration-200 hover:border-accent/40 hover:shadow-[0_4px_24px_0_hsl(var(--accent)/0.1)]'
                    )}
                  >
                    <Icon className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
                    <span className="text-xs font-semibold capitalize text-foreground">{u.role}</span>
                    <span className="text-[10px] leading-tight text-muted-foreground">{u.full_name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-3 text-muted-foreground">OR</span>
            </div>
          </div>

          {/* Google sign-in */}
          {!signUpSuccess && !resetSent && mode !== 'forgot' && (
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="mb-4 w-full h-11 rounded-xl border-border bg-card hover:bg-card hover:border-foreground/30 text-foreground hover:text-foreground font-medium text-sm gap-2 transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>
          )}

          {/* Form or success states */}
          {signUpSuccess ? (
            <div className="rounded-2xl border border-border bg-card p-6 text-center space-y-3">
              <p className="text-sm font-medium text-foreground">Check your email!</p>
              <p className="text-xs text-muted-foreground">
                We sent a verification link to <strong>{email}</strong>. Click the link to verify your account, then come back and sign in.
              </p>
              <Button variant="outline" className="w-full rounded-xl" onClick={() => { setSignUpSuccess(false); setMode('signin'); }}>
                Back to Sign In
              </Button>
            </div>
          ) : resetSent ? (
            <div className="rounded-2xl border border-border bg-card p-6 text-center space-y-3">
              <p className="text-sm font-medium text-foreground">Check your email!</p>
              <p className="text-xs text-muted-foreground">
                We sent a password reset link to <strong>{email}</strong>.
              </p>
              <Button variant="outline" className="w-full rounded-xl" onClick={() => { setResetSent(false); setMode('signin'); }}>
                Back to Sign In
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="text-xs font-medium text-foreground">Full Name</Label>
                  <Input id="fullName" type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="John Doe" required className="rounded-xl border-border bg-card h-11" />
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium text-foreground">{t('email')}</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required className="rounded-xl border-border bg-card h-11" />
              </div>
              {mode !== 'forgot' && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-xs font-medium text-foreground">{t('password')}</Label>
                    {mode === 'signin' && (
                      <button type="button" onClick={() => setMode('forgot')} className="text-[11px] text-accent hover:text-accent/80 underline underline-offset-2">
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} className="rounded-xl border-border bg-card h-11" />
                </div>
              )}
              {mode === 'signup' && (
                <div className="space-y-1.5">
                  <Label htmlFor="role" className="text-xs font-medium text-foreground">Role</Label>
                  <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as AppRole)}>
                    <SelectTrigger className="rounded-xl border-border bg-card h-11">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="employee">Employee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <Button type="submit" className="w-full h-11 rounded-xl bg-foreground text-background hover:bg-foreground/90 font-semibold text-sm" disabled={loading}>
                {loading ? t('loading') : mode === 'signin' ? t('signIn') : mode === 'signup' ? 'Sign Up' : 'Send Reset Link'}
              </Button>
            </form>
          )}

          {/* Mode switch */}
          {!signUpSuccess && !resetSent && (
            <p className="mt-5 text-center text-xs text-muted-foreground">
              {mode === 'signin' ? (
                <>Don't have an account?{' '}<button type="button" onClick={() => setMode('signup')} className="font-medium text-accent hover:text-accent/80 underline underline-offset-2">Sign up</button></>
              ) : mode === 'signup' ? (
                <>Already have an account?{' '}<button type="button" onClick={() => setMode('signin')} className="font-medium text-accent hover:text-accent/80 underline underline-offset-2">Sign in</button></>
              ) : (
                <>Remember your password?{' '}<button type="button" onClick={() => setMode('signin')} className="font-medium text-accent hover:text-accent/80 underline underline-offset-2">Sign in</button></>
              )}
            </p>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-muted-foreground">
          Demo mode — use quick login buttons for instant access
        </p>
      </div>

      {/* Right side - showcase (hidden on mobile) */}
      <div className="hidden min-[960px]:flex min-[960px]:w-1/2 items-center justify-center p-6">
        <AuthShowcase />
      </div>
    </div>
  );
}
