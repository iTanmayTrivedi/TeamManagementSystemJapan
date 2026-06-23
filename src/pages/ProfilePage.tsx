import { useState, useRef } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { mockDepartments } from '@/lib/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Camera, Save, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AVATAR_STORAGE_KEY = 'user_avatar_';

export default function ProfilePage() {
  const { profile, role, isDemo, updateProfile } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [department, setDepartment] = useState(profile?.department ?? '');
  const [avatar, setAvatar] = useState<string | null>(() => {
    if (!profile) return null;
    return localStorage.getItem(AVATAR_STORAGE_KEY + profile.id) ?? null;
  });
  const [saving, setSaving] = useState(false);

  const departments = mockDepartments.getAll();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({ title: t('error'), description: t('avatarTooLarge'), variant: 'destructive' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setAvatar(dataUrl);
      localStorage.setItem(AVATAR_STORAGE_KEY + profile.id, dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      await updateProfile({ full_name: fullName, department });
      toast({ title: t('profileUpdated') });
    } catch {
      toast({ title: t('error'), variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const initials = fullName
    .split(' ')
    .map(n => n.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t('profileSettings')}</h1>
          <p className="text-muted-foreground mt-1">{t('profileSettingsDesc')}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <User className="h-4 w-4 text-accent" />
              {t('profileInfo')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-6">
              <div className="relative group">
                {avatar ? (
                  <img
                    src={avatar}
                    alt="Avatar"
                    className="h-20 w-20 rounded-full object-cover border-2 border-border"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted text-xl font-bold text-muted-foreground border-2 border-border">
                    {initials || '?'}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 flex items-center justify-center rounded-full bg-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Camera className="h-5 w-5 text-background" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
              <div>
                <p className="text-sm font-medium">{t('avatar')}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t('avatarHint')}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {t('uploadPhoto')}
                </Button>
              </div>
            </div>

            <Separator />

            {/* Name */}
            <div className="space-y-2">
              <Label>{t('fullName')}</Label>
              <Input
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder={t('fullName')}
              />
            </div>

            {/* Email (read-only) */}
            <div className="space-y-2">
              <Label>{t('email')}</Label>
              <Input value={profile?.email ?? ''} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">{t('emailReadOnly')}</p>
            </div>

            {/* Department */}
            <div className="space-y-2">
              <Label>{t('department')}</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder={t('department')} />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Role (read-only) */}
            <div className="space-y-2">
              <Label>{t('role')}</Label>
              <Input value={role ?? ''} disabled className="bg-muted capitalize" />
              <p className="text-xs text-muted-foreground">{t('roleReadOnly')}</p>
            </div>

            <Separator />

            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? t('loading') : t('saveChanges')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {isDemo && (
          <p className="text-xs text-center text-muted-foreground">
            {t('demoProfileNote')}
          </p>
        )}
      </div>
    </AppLayout>
  );
}
