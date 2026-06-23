import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useLanguage } from '@/hooks/useLanguage';
import { mockDepartments } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function DepartmentsPage() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [departments, setDepartments] = useState<string[]>(mockDepartments.getAll());
  const [newName, setNewName] = useState('');

  const handleAdd = () => {
    if (!newName.trim()) return;
    const added = mockDepartments.insert(newName.trim());
    if (!added) {
      toast({ title: t('error'), description: 'Department already exists', variant: 'destructive' });
      return;
    }
    toast({ title: t('departmentCreated') });
    setNewName('');
    setDepartments(mockDepartments.getAll());
  };

  const handleDelete = (name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    mockDepartments.delete(name);
    toast({ title: t('departmentDeleted') });
    setDepartments(mockDepartments.getAll());
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t('departments')}</h1>
          <p className="text-muted-foreground mt-1">{t('manageDepartments')}</p>
        </div>

        <div className="flex items-center gap-3 max-w-md">
          <Input placeholder={t('newDeptPlaceholder')} value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()} />
          <Button type="button" onClick={handleAdd} className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Plus className="h-4 w-4 mr-2" /> {t('add')}
          </Button>
        </div>

        <div className="rounded-lg border bg-card max-w-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('departmentName')}</TableHead>
                <TableHead className="text-right w-20">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map(name => (
                <TableRow key={name}>
                  <TableCell className="font-medium">{name}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(name)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {departments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">{t('noDepartments')}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
}
