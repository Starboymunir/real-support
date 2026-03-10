'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Landmark,
  Plus,
  Check,
  Trash2,
  Edit3,
  Loader2,
  Star,
  Upload,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/ui/button';
import { useRequireAuth } from '@/lib/use-require-auth';
import { bankAccountApi } from '@/lib/services/bank-accounts';
import { documentsApi } from '@/lib/services/documents';
import type { BankAccount } from '@/lib/types';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

function statusBadge(status: string) {
  switch (status) {
    case 'ACTIVE':
    case 'VERIFIED':
      return 'bg-secondary/10 text-secondary border-secondary/20';
    case 'REJECTED':
      return 'bg-red-500/10 text-red-400 border-red-500/20';
    default:
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  }
}

const emptyForm = { bankName: '', accountName: '', accountNumber: '', sortCode: '', isDefault: false };

export default function BankAccountsPage() {
  const { user } = useRequireAuth();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const fetchAccounts = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await bankAccountApi.getByUser(user.id);
      const list = Array.isArray(res) ? res : (res as unknown as { data: BankAccount[] })?.data ?? [];
      setAccounts(list);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const handleSubmit = useCallback(async () => {
    if (!user?.id || !form.bankName.trim() || !form.accountName.trim() || !form.accountNumber.trim() || !form.sortCode.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      let documentUrl = '';
      if (docFile) {
        const uploadRes = await documentsApi.uploadFile(docFile, { type: 'bank-proof', userId: user.id });
        documentUrl = (uploadRes as unknown as { data?: { fileUrl?: string }; fileUrl?: string })?.data?.fileUrl || (uploadRes as unknown as { fileUrl?: string })?.fileUrl || '';
      }
      const payload = { ...form, userId: user.id, ...(documentUrl ? { document: documentUrl } : {}) };
      if (editingId) {
        await bankAccountApi.update(editingId, payload);
      } else {
        await bankAccountApi.create(payload);
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      setDocFile(null);
      fetchAccounts();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save account');
    } finally {
      setSubmitting(false);
    }
  }, [user?.id, form, editingId, docFile, fetchAccounts]);

  const handleDelete = useCallback(async (id: string) => {
    setDeletingId(id);
    try {
      await bankAccountApi.remove(id);
      fetchAccounts();
    } catch {
      /* ignore */
    } finally {
      setDeletingId(null);
    }
  }, [fetchAccounts]);

  const startEdit = (acc: BankAccount) => {
    setForm({
      bankName: acc.bankName,
      accountName: acc.accountName,
      accountNumber: acc.accountNumber,
      sortCode: acc.sortCode,
      isDefault: acc.isDefault,
    });
    setEditingId(acc.id);
    setShowForm(true);
    setDocFile(null);
    setError('');
  };

  return (
    <DashboardLayout role="rider" pageTitle="Bank Accounts">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back */}
        <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
          <Link href="/rider/wallet" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm font-medium transition-colors">
            <ArrowLeft size={16} /> Back to Wallet
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp}>
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-secondary via-accent to-secondary" />

            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Landmark size={20} className="text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Bank Accounts</h2>
                  <p className="text-white/30 text-xs">Manage your bank details for withdrawals</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setForm(emptyForm);
                  setEditingId(null);
                  setDocFile(null);
                  setShowForm(!showForm);
                  setError('');
                }}
                className="px-4 py-2 rounded-xl bg-secondary/10 border border-secondary/20 text-secondary text-sm font-bold hover:bg-secondary/20 transition-all flex items-center gap-1.5"
              >
                {showForm ? <><X size={14} /> Cancel</> : <><Plus size={14} /> Add Account</>}
              </button>
            </div>

            {/* Account List */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-secondary animate-spin" />
              </div>
            ) : accounts.length === 0 && !showForm ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
                  <Landmark size={24} className="text-white/20" />
                </div>
                <p className="text-white/40 text-sm font-medium">No bank accounts</p>
                <p className="text-white/20 text-xs mt-1">Add your bank details for withdrawals</p>
              </div>
            ) : (
              <div className="space-y-3">
                {accounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-white">{acc.accountName}</p>
                          {acc.isDefault && (
                            <span className="px-2 py-0.5 rounded-full bg-secondary/10 text-secondary text-[10px] font-bold border border-secondary/20 flex items-center gap-0.5">
                              <Star size={8} /> Default
                            </span>
                          )}
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge(acc.status)}`}>
                            {acc.status}
                          </span>
                        </div>
                        <p className="text-xs text-white/40 mt-1">{acc.bankName}</p>
                        <div className="flex gap-4 mt-2">
                          <span className="text-xs text-white/30">
                            Acc: ****{acc.accountNumber.slice(-4)}
                          </span>
                          <span className="text-xs text-white/30">
                            Sort: {acc.sortCode}
                          </span>
                          {acc.document && (
                            <span className="text-xs text-secondary/70 flex items-center gap-1">
                              <Upload size={10} /> Doc uploaded
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => startEdit(acc)}
                          className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/30 hover:text-white/60 hover:border-white/[0.12] transition-all"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(acc.id)}
                          disabled={deletingId === acc.id}
                          className="w-8 h-8 rounded-lg bg-red-500/[0.06] border border-red-500/10 flex items-center justify-center text-red-400/50 hover:text-red-400 hover:border-red-500/20 transition-all disabled:opacity-50"
                        >
                          {deletingId === acc.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Add/Edit Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-accent to-blue-500" />

                <h3 className="text-lg font-bold text-white mb-5">
                  {editingId ? 'Edit Bank Account' : 'Add Bank Account'}
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/50 mb-2">Bank Name</label>
                    <input
                      type="text"
                      placeholder="e.g., Barclays, HSBC, Lloyds"
                      value={form.bankName}
                      onChange={(e) => setForm(f => ({ ...f, bankName: e.target.value }))}
                      className="input-dark w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/50 mb-2">Account Holder Name</label>
                    <input
                      type="text"
                      placeholder="Full name on account"
                      value={form.accountName}
                      onChange={(e) => setForm(f => ({ ...f, accountName: e.target.value }))}
                      className="input-dark w-full"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/50 mb-2">Sort Code</label>
                      <input
                        type="text"
                        placeholder="XX-XX-XX"
                        value={form.sortCode}
                        onChange={(e) => setForm(f => ({ ...f, sortCode: e.target.value }))}
                        maxLength={8}
                        className="input-dark w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/50 mb-2">Account Number</label>
                      <input
                        type="text"
                        placeholder="8-digit number"
                        value={form.accountNumber}
                        onChange={(e) => setForm(f => ({ ...f, accountNumber: e.target.value }))}
                        maxLength={8}
                        className="input-dark w-full"
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] cursor-pointer hover:bg-white/[0.04] transition-all">
                    <input
                      type="checkbox"
                      checked={form.isDefault}
                      onChange={(e) => setForm(f => ({ ...f, isDefault: e.target.checked }))}
                      className="w-4 h-4 rounded border-white/20 text-secondary focus:ring-secondary bg-white/[0.06]"
                    />
                    <span className="text-sm text-white/60">Set as default account</span>
                  </label>

                  {/* Proof of Account Upload */}
                  <div>
                    <label className="block text-sm font-medium text-white/50 mb-2">Proof of Account (optional)</label>
                    <p className="text-xs text-white/25 mb-3">Upload a bank statement or screenshot showing your name, sort code and account number</p>
                    <label className="flex flex-col items-center gap-2 p-5 rounded-xl border-2 border-dashed border-white/[0.08] bg-white/[0.02] hover:border-secondary/30 hover:bg-secondary/[0.02] transition-all cursor-pointer">
                      <Upload size={22} className="text-white/20" />
                      {docFile ? (
                        <span className="text-sm text-secondary font-medium truncate max-w-full">{docFile.name}</span>
                      ) : (
                        <span className="text-sm text-white/30">Click to upload document</span>
                      )}
                      <span className="text-[10px] text-white/15">PDF, JPG, PNG up to 5MB</span>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file && file.size <= 5 * 1024 * 1024) setDocFile(file);
                        }}
                      />
                    </label>
                  </div>
                </div>

                {error && (
                  <div className="mt-4 p-4 rounded-xl bg-red-500/[0.08] border border-red-500/20 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <Button variant="outline" size="md" onClick={() => { setShowForm(false); setEditingId(null); }}>
                    Cancel
                  </Button>
                  <Button
                    variant="green"
                    size="lg"
                    className="flex-1"
                    onClick={handleSubmit}
                    disabled={submitting || !form.bankName.trim() || !form.accountName.trim() || !form.accountNumber.trim() || !form.sortCode.trim()}
                  >
                    {submitting ? (
                      <><Loader2 size={16} className="animate-spin" /> Saving...</>
                    ) : (
                      <>{editingId ? <><Check size={16} /> Update Account</> : <><Upload size={16} /> Add Account</>}</>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
