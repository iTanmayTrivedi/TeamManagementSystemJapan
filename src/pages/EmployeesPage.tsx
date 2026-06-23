import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { DEMO_USERS, mockDepartments, type AppRole, type MockUser } from '@/lib/mockData';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Search, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { downloadCSV } from '@/lib/csvExport';

interface EmployeeWithRole extends MockUser {}

export default function EmployeesPage() {
  const { role: currentRole } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [employees] = useState<EmployeeWithRole[]>(DEMO_USERS);
  const [departments] = useState<string[]>(mockDepartments.getAll());
  const [search, setSearch] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeWithRole | null>(null);
  const [formData, setFormData] = useState({ full_name: '', department: '', status: 'active', role: 'employee' as AppRole });

  const handleEdit = (emp: EmployeeWithRole) => {
    setEditingEmployee(emp);
    setFormData({ full_name: emp.full_name, department: emp.department, status: emp.status, role: emp.role });
    setEditOpen(true);
  };

  const handleSave = () => {
    toast({ title: t('employeeUpdated'), description: 'Changes saved (demo mode)' });
    setEditOpen(false);
  };

  const filtered = employees.filter(e =>
    e.full_name.toLowerCase().includes(search.toLowerCase()) ||
    e.department.toLowerCase().includes(search.toLowerCase()) ||
    e.email.toLowerCase().includes(search.toLowerCase())
  );

  const isAdmin = currentRole === 'admin';

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">{t('employeeDirectory')}</h1>
            <p className="text-muted-foreground mt-1 text-sm">{employees.length} {t('teamMembers')}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => {
            const csvData = filtered.map(e => ({
              Name: e.full_name,
              Email: e.email,
              Department: e.department,
              Role: e.role,
              Status: e.status,
            }));
            downloadCSV(csvData, 'employees');
          }}>
            <Download className="h-4 w-4 mr-2" /> {t('exportCSV')}
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder={t('searchEmployees')} value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
        </div>

        <div className="rounded-lg border bg-card overflow-x-auto">
          <Table className="min-w-[600px]">
            <TableHeader>
              <TableRow>
                <TableHead>{t('name')}</TableHead>
                <TableHead>{t('email')}</TableHead>
                <TableHead>{t('department')}</TableHead>
                <TableHead>{t('role')}</TableHead>
                <TableHead>{t('status')}</TableHead>
                {isAdmin && <TableHead className="text-right">{t('actions')}</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(emp => (
                <TableRow key={emp.id}>
                  <TableCell className="font-medium">{emp.full_name}</TableCell>
                  <TableCell className="text-muted-foreground">{emp.email}</TableCell>
                  <TableCell>{emp.department}</TableCell>
                  <TableCell><StatusBadge value={emp.role} /></TableCell>
                  <TableCell><StatusBadge value={emp.status} /></TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(emp)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 6 : 5} className="text-center py-8 text-muted-foreground">{t('noEmployees')}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('editEmployee')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>{t('fullName')}</Label>
                <Input value={formData.full_name} onChange={e => setFormData(p => ({ ...p, full_name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>{t('department')}</Label>
                <Select value={formData.department} onValueChange={v => setFormData(p => ({ ...p, department: v }))}>
                  <SelectTrigger><SelectValue placeholder={t('department')} /></SelectTrigger>
                  <SelectContent>
                    {departments.map(d => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('role')}</Label>
                <Select value={formData.role} onValueChange={(v: AppRole) => setFormData(p => ({ ...p, role: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">{t('admin')}</SelectItem>
                    <SelectItem value="manager">{t('manager')}</SelectItem>
                    <SelectItem value="employee">{t('employee')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('status')}</Label>
                <Select value={formData.status} onValueChange={v => setFormData(p => ({ ...p, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t('active')}</SelectItem>
                    <SelectItem value="inactive">{t('inactive')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setEditOpen(false)}>{t('cancel')}</Button>
                <Button onClick={handleSave} className="bg-accent text-accent-foreground hover:bg-accent/90">{t('save')}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
