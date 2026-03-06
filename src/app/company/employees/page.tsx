'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useRequireAuth } from '@/lib/use-require-auth';
import { companyApi, bookingsApi } from '@/lib/services';
import type { Booking } from '@/lib/types';
import {
  UserPlus,
  Search,
  Mail,
  PoundSterling,
  Edit3,
  UserX,
  X,
} from 'lucide-react';

/* ───── Employee type ───── */
type Employee = {
  id: number | string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  rides: number;
  totalSpend: string;
  limit: number;
  status: string;
};

const departments = ['All', 'Sales', 'Marketing', 'Engineering', 'Management'];

function getInitials(first: string, last: string) {
  return `${first[0]}${last[0]}`.toUpperCase();
}

export default function CompanyEmployeesPage() {
  const { user } = useRequireAuth();
  const [employeesData, setEmployeesData] = useState<Employee[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [activeDept, setActiveDept] = useState('All');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteFirstName, setInviteFirstName] = useState('');
  const [inviteLastName, setInviteLastName] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState(false);

  // Derive employees from booking data
  const fetchEmployees = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await bookingsApi.getUserBookings(user.id);
      const bookings: Booking[] = Array.isArray(res) ? res : (res as { data?: Booking[] }).data || [];
      const empMap = new Map<string, { rides: number; spent: number }>();
      bookings.filter(b => b.status === 'COMPLETED').forEach(b => {
        const name = b.riderName || 'Unknown';
        const existing = empMap.get(name) || { rides: 0, spent: 0 };
        empMap.set(name, { rides: existing.rides + 1, spent: existing.spent + (b.finalBill || 0) });
      });
      const empList: Employee[] = [...empMap.entries()].map(([name, data], i) => {
        const parts = name.split(' ');
        return {
          id: i + 1,
          firstName: parts[0] || name,
          lastName: parts.slice(1).join(' ') || '',
          email: '',
          department: 'General',
          rides: data.rides,
          totalSpend: `\u00A3${data.spent.toFixed(0)}`,
          limit: 1000,
          status: 'Active',
        };
      });
      setEmployeesData(empList);
    } catch { /* keep empty */ }
  }, [user]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const handleAddEmployee = async () => {
    if (!inviteEmail) return;
    setInviting(true);
    setInviteError('');
    setInviteSuccess(false);
    try {
      await companyApi.inviteDriver(inviteEmail);
      setInviteSuccess(true);
      setInviteEmail('');
      setInviteFirstName('');
      setInviteLastName('');
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : 'Failed to invite employee');
    } finally {
      setInviting(false);
    }
  };

  const filtered = employeesData.filter((emp) => {
    const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
    const matchesSearch =
      fullName.includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase());
    const matchesDept = activeDept === 'All' || emp.department === activeDept;
    return matchesSearch && matchesDept;
  });

  return (
    <DashboardLayout role="company">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Employees</h2>
          <p className="text-white/60 mt-1">
            Manage employee ride privileges and limits
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? <X size={18} /> : <UserPlus size={18} />}
          {showForm ? 'Cancel' : 'Add Employee'}
        </Button>
      </div>

      {/* Expandable Add Employee Form */}
      {showForm && (
        <div className="bg-white/[0.02] rounded-2xl border border-white/[0.06] p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-5">
            Add New Employee
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <Input
              label="First Name"
              placeholder="Enter first name"
              name="firstName"
              required
            />
            <Input
              label="Last Name"
              placeholder="Enter last name"
              name="lastName"
              required
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="employee@company.com"
              icon={Mail}
              name="email"
              required
            />
            <div>
              <label className="block text-sm font-medium text-white mb-1.5">
                Department
              </label>
              <select className="input-field" defaultValue="">
                <option value="" disabled>
                  Select department
                </option>
                {departments
                  .filter((d) => d !== 'All')
                  .map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
              </select>
            </div>
            <Input
              label="Booking Limit (£/month)"
              type="number"
              placeholder="e.g. 500"
              icon={PoundSterling}
              name="limit"
              required
            />
          </div>
          <div className="flex gap-3 mt-6">
            {inviteError && <p className="text-red-400 text-sm self-center">{inviteError}</p>}
            {inviteSuccess && <p className="text-secondary text-sm self-center">Employee invited successfully!</p>}
            <Button variant="green" onClick={handleAddEmployee} disabled={inviting}>
              <UserPlus size={16} /> {inviting ? 'Adding...' : 'Add Employee'}
            </Button>
            <Button variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Search + Department Filter Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setActiveDept(dept)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeDept === dept
                  ? 'bg-secondary text-dark'
                  : 'bg-white/[0.04] text-white/40 hover:bg-white/[0.06]'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((emp) => {
          const spentNum = parseFloat(emp.totalSpend.replace('£', ''));
          const pct = Math.min(100, (spentNum / emp.limit) * 100);

          return (
            <div
              key={emp.id}
              className="bg-white/[0.02] rounded-2xl border border-white/[0.06] p-6 hover:bg-white/[0.04] transition-all"
            >
              {/* Top row: avatar + info + badge */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary/20 to-accent/20 text-secondary flex items-center justify-center text-sm font-bold shrink-0">
                  {getInitials(emp.firstName, emp.lastName)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-semibold text-white truncate">
                    {emp.firstName} {emp.lastName}
                  </h4>
                  <p className="text-sm text-white/60 truncate">{emp.email}</p>
                </div>
                <span
                  className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${
                    emp.status === 'Active'
                      ? 'bg-success/10 text-success'
                      : 'bg-white/[0.06] text-white/40'
                  }`}
                >
                  {emp.status}
                </span>
              </div>

              {/* 3-stat Info Grid */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.04] text-center">
                  <p className="text-xs text-white/40 mb-0.5">Department</p>
                  <p className="text-sm font-semibold text-white">
                    {emp.department}
                  </p>
                </div>
                <div className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.04] text-center">
                  <p className="text-xs text-white/40 mb-0.5">Rides</p>
                  <p className="text-sm font-semibold text-white">{emp.rides}</p>
                </div>
                <div className="bg-white/[0.03] rounded-lg p-3 border border-white/[0.04] text-center">
                  <p className="text-xs text-white/40 mb-0.5">Spent</p>
                  <p className="text-sm font-semibold text-white">
                    {emp.totalSpend}
                  </p>
                </div>
              </div>

              {/* Budget Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-white/40">Budget used</span>
                  <span className="font-semibold text-white">
                    {emp.totalSpend} / £{emp.limit}
                  </span>
                </div>
                <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-white/[0.06]">
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium text-accent hover:bg-accent/[0.06] transition-colors">
                  <Edit3 size={15} /> Edit
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium text-error hover:bg-error/[0.06] transition-colors">
                  <UserX size={15} /> Deactivate
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-white/40 text-lg">No employees match your filters.</p>
        </div>
      )}
    </DashboardLayout>
  );
}
