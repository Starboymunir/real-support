'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import {
  UserPlus,
  Search,
  Mail,
  PoundSterling,
  Edit3,
  UserX,
  X,
} from 'lucide-react';

/* ───── Dummy employees ───── */
const employeesData = [
  {
    id: 1,
    firstName: 'Sarah',
    lastName: 'Mitchell',
    email: 'sarah.m@acmecorp.com',
    department: 'Sales',
    rides: 28,
    totalSpend: '£620',
    limit: 800,
    status: 'Active',
  },
  {
    id: 2,
    firstName: 'James',
    lastName: 'Harlow',
    email: 'james.h@acmecorp.com',
    department: 'Management',
    rides: 22,
    totalSpend: '£510',
    limit: 1000,
    status: 'Active',
  },
  {
    id: 3,
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'priya.s@acmecorp.com',
    department: 'Engineering',
    rides: 19,
    totalSpend: '£380',
    limit: 600,
    status: 'Active',
  },
  {
    id: 4,
    firstName: 'Tom',
    lastName: 'Walker',
    email: 'tom.w@acmecorp.com',
    department: 'Marketing',
    rides: 15,
    totalSpend: '£305',
    limit: 500,
    status: 'Active',
  },
  {
    id: 5,
    firstName: 'Emma',
    lastName: 'Collins',
    email: 'emma.c@acmecorp.com',
    department: 'Sales',
    rides: 12,
    totalSpend: '£240',
    limit: 600,
    status: 'Inactive',
  },
  {
    id: 6,
    firstName: 'David',
    lastName: 'Chen',
    email: 'david.c@acmecorp.com',
    department: 'Engineering',
    rides: 9,
    totalSpend: '£185',
    limit: 600,
    status: 'Active',
  },
];

const departments = ['All', 'Sales', 'Marketing', 'Engineering', 'Management'];

function getInitials(first: string, last: string) {
  return `${first[0]}${last[0]}`.toUpperCase();
}

export default function CompanyEmployeesPage() {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [activeDept, setActiveDept] = useState('All');

  const filtered = employeesData.filter((emp) => {
    const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
    const matchesSearch =
      fullName.includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase());
    const matchesDept = activeDept === 'All' || emp.department === activeDept;
    return matchesSearch && matchesDept;
  });

  return (
    <DashboardLayout role="company" userName="Acme Corp">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Employees</h2>
          <p className="text-text-secondary mt-1">
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="text-lg font-semibold text-text-primary mb-5">
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
              <label className="block text-sm font-medium text-text-primary mb-1.5">
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
            <Button variant="green">
              <UserPlus size={16} /> Add Employee
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
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
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
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
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
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 card-hover"
            >
              {/* Top row: avatar + info + badge */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                  {getInitials(emp.firstName, emp.lastName)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-semibold text-text-primary truncate">
                    {emp.firstName} {emp.lastName}
                  </h4>
                  <p className="text-sm text-text-secondary truncate">{emp.email}</p>
                </div>
                <span
                  className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${
                    emp.status === 'Active'
                      ? 'bg-success/10 text-success'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {emp.status}
                </span>
              </div>

              {/* 3-stat Info Grid */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-text-muted mb-0.5">Department</p>
                  <p className="text-sm font-semibold text-text-primary">
                    {emp.department}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-text-muted mb-0.5">Rides</p>
                  <p className="text-sm font-semibold text-text-primary">{emp.rides}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-text-muted mb-0.5">Spent</p>
                  <p className="text-sm font-semibold text-text-primary">
                    {emp.totalSpend}
                  </p>
                </div>
              </div>

              {/* Budget Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-text-muted">Budget used</span>
                  <span className="font-semibold text-text-primary">
                    {emp.totalSpend} / £{emp.limit}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium text-primary hover:bg-primary/5 transition-colors">
                  <Edit3 size={15} /> Edit
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium text-error hover:bg-error/5 transition-colors">
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
          <p className="text-text-muted text-lg">No employees match your filters.</p>
        </div>
      )}
    </DashboardLayout>
  );
}
