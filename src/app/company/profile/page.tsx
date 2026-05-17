'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { useRequireAuth } from '@/lib/use-require-auth';
import { companyApi } from '@/lib/services';
import type { Company } from '@/lib/types';
import { motion } from 'framer-motion';
import { Building2, Save, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function CompanyProfilePage() {
  const { user } = useRequireAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    companyName: '',
    companyEmail: '',
    phone_number: '',
    description: '',
  });

  const fetchCompany = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await companyApi.getById(user.id);
      setCompany(data);
      setForm({
        companyName: data.companyName || '',
        companyEmail: data.companyEmail || '',
        phone_number: data.phone_number || '',
        description: data.description || '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load company info');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCompany();
  }, [fetchCompany]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const updated = await companyApi.update(user.id, form);
      setCompany(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update company info');
    } finally {
      setSaving(false);
    }
  };

  const statusColor: Record<string, string> = {
    ACTIVE: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    PENDING: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    SUSPEND: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    ONHOLD: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  };

  return (
    <DashboardLayout role="company">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-start justify-between gap-4 flex-wrap"
        >
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Company Profile</h1>
              <p className="text-sm text-muted-foreground">Update your company information for approval</p>
            </div>
          </div>
          {company?.status && (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                statusColor[company.status] || statusColor.ONHOLD
              }`}
            >
              {company.status}
            </span>
          )}
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl border border-border bg-card p-5 sm:p-7"
        >
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Loading…
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Company Name</label>
                  <Input
                    value={form.companyName}
                    onChange={(e) => setForm((s) => ({ ...s, companyName: e.target.value }))}
                    placeholder="Acme Ltd."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Company Email</label>
                  <Input
                    type="email"
                    value={form.companyEmail}
                    onChange={(e) => setForm((s) => ({ ...s, companyEmail: e.target.value }))}
                    placeholder="info@company.com"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1.5">Phone Number</label>
                  <Input
                    value={form.phone_number}
                    onChange={(e) => setForm((s) => ({ ...s, phone_number: e.target.value }))}
                    placeholder="+44 ..."
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1.5">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
                    placeholder="Tell us about your company…"
                    rows={4}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50 resize-y"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-400">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>Saved. Changes submitted for approval.</span>
                </div>
              )}

              <div className="flex items-center justify-between gap-3 pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Edits may require admin approval before going live.
                </p>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-1.5" />
                      Save changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
