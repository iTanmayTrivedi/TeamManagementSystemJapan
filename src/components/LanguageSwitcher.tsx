import { useLanguage, Language } from '@/hooks/useLanguage';
import { Globe } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function LanguageSwitcher({ variant = 'sidebar' }: { variant?: 'sidebar' | 'page' }) {
  const { lang, setLang } = useLanguage();

  if (variant === 'page') {
    return (
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4 text-muted-foreground" />
        <Select value={lang} onValueChange={(v) => setLang(v as Language)}>
          <SelectTrigger className="w-32 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="ja">日本語</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5">
      <Globe className="h-4 w-4 text-sidebar-muted" />
      <Select value={lang} onValueChange={(v) => setLang(v as Language)}>
        <SelectTrigger className="h-8 text-xs bg-sidebar-accent border-sidebar-border text-sidebar-accent-foreground flex-1">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">English</SelectItem>
          <SelectItem value="ja">日本語</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
