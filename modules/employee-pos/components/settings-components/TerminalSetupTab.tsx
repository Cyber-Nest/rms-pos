'use client';

import React, { useState, useMemo } from 'react';
import { Search, Eye, EyeOff, Edit2, Trash2, X, Plus, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Terminal } from './settingsTypes';

interface TerminalSetupTabProps {
  terminals: Terminal[];
  setTerminals: React.Dispatch<React.SetStateAction<Terminal[]>>;
  onRefresh: () => Promise<void>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const getBranchId = (): string | undefined => {
  if (typeof window === 'undefined') return undefined;
  try {
    const raw = localStorage.getItem('rms_branch');
    if (raw) return JSON.parse(raw)._id;
  } catch { }
  return undefined;
};

export default function TerminalSetupTab({ terminals, setTerminals, onRefresh }: TerminalSetupTabProps) {

  const [selectedTerminal, setSelectedTerminal] = useState<Terminal | null>(null);
  const [isTerminalModalOpen, setIsTerminalModalOpen] = useState(false);
  const [isTerminalAddOpen, setIsTerminalAddOpen] = useState(false);
  const [isTerminalEditOpen, setIsTerminalEditOpen] = useState(false);
  const [terminalSearch, setTerminalSearch] = useState('');
  const [terminalPage, setTerminalPage] = useState(1);
  const [terminalLimit, setTerminalLimit] = useState(10);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Show/hide API token in form
  const [showAddToken, setShowAddToken] = useState(false);
  const [showEditToken, setShowEditToken] = useState(false);

  const [terminalForm, setTerminalForm] = useState({
    _id: '',
    realDevices: false,
    terminalName: '',
    terminalId: '',
    apiToken: '',
    storeId: '',
  });

  // ── Filtering & Pagination ──────────────────────────────────────────────────
  const filteredTerminals = useMemo(() => {
    return terminals.filter(t =>
      t.terminalName.toLowerCase().includes(terminalSearch.toLowerCase()) ||
      t.terminalId.toLowerCase().includes(terminalSearch.toLowerCase()) ||
      t.storeId.toLowerCase().includes(terminalSearch.toLowerCase())
    );
  }, [terminals, terminalSearch]);

  const paginatedTerminals = useMemo(() => {
    const start = (terminalPage - 1) * terminalLimit;
    return filteredTerminals.slice(start, start + terminalLimit);
  }, [filteredTerminals, terminalPage, terminalLimit]);

  const totalPages = Math.ceil(filteredTerminals.length / terminalLimit);

  const resetForm = () =>
    setTerminalForm({ _id: '', realDevices: false, terminalName: '', terminalId: '', apiToken: '', storeId: '' });

  // ── Refresh ─────────────────────────────────────────────────────────────────
  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  // ── Add Terminal ─────────────────────────────────────────────────────────────
  const handleAddTerminal = async (closeAfter = false) => {
    if (!terminalForm.terminalName || !terminalForm.terminalId || !terminalForm.apiToken || !terminalForm.storeId) {
      toast.error('Please fill in all required fields');
      return;
    }
    const branchId = getBranchId();
    if (!branchId) { toast.error('Branch session invalid'); return; }

    setSaving(true);
    try {
      await axios.post(`${API_URL}/terminals`, {
        branchId,
        terminalName: terminalForm.terminalName.trim(),
        terminalId:   terminalForm.terminalId.trim(),
        apiToken:     terminalForm.apiToken,
        storeId:      terminalForm.storeId.trim(),
        isRealDevice: terminalForm.realDevices,
      });
      toast.success('Terminal added successfully!');
      resetForm();
      setShowAddToken(false);
      await onRefresh();
      if (closeAfter) setIsTerminalAddOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add terminal');
    } finally {
      setSaving(false);
    }
  };

  // ── Edit Terminal ─────────────────────────────────────────────────────────────
  const handleEditTerminalSave = async () => {
    if (!terminalForm.terminalName || !terminalForm.terminalId || !terminalForm.storeId) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        terminalName: terminalForm.terminalName.trim(),
        terminalId:   terminalForm.terminalId.trim(),
        storeId:      terminalForm.storeId.trim(),
        isRealDevice: terminalForm.realDevices,
      };
      // Only send apiToken if user typed a new one (not the masked placeholder)
      if (terminalForm.apiToken && !terminalForm.apiToken.startsWith('••')) {
        payload.apiToken = terminalForm.apiToken;
      }
      await axios.put(`${API_URL}/terminals/${terminalForm._id}`, payload);
      toast.success('Terminal updated successfully!');
      setIsTerminalEditOpen(false);
      setShowEditToken(false);
      resetForm();
      await onRefresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update terminal');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete Terminal ───────────────────────────────────────────────────────────
  const executeDeleteTerminal = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/terminals/${id}`);
      setTerminals(prev => prev.filter(t => t._id !== id));
      toast.success('Terminal deleted successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete terminal');
    }
  };

  const handleDeleteTerminal = (id: string) => {
    toast((t) => (
      <div className="flex flex-col gap-2 p-1 text-xs">
        <p className="font-700 text-neutral-900">Delete this terminal?</p>
        <p className="text-neutral-500">This action cannot be undone.</p>
        <div className="flex items-center justify-end gap-2 mt-1">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-2.5 py-1 font-600 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => { toast.dismiss(t.id); executeDeleteTerminal(id); }}
            className="px-2.5 py-1 font-700 bg-red-600 hover:bg-red-700 text-white rounded-lg cursor-pointer shadow-sm"
          >
            Delete Terminal
          </button>
        </div>
      </div>
    ), { duration: 5000, position: 'top-center' });
  };

  // ── Shared form field component ────────────────────────────────────────────
  const Field = ({
    label, value, onChange, placeholder, type = 'text', showToggle, onToggle, required = true
  }: {
    label: string; value: string; onChange: (v: string) => void;
    placeholder?: string; type?: string; showToggle?: boolean;
    onToggle?: () => void; required?: boolean;
  }) => (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-800 text-neutral-500 uppercase tracking-wider">
        {label} {required && '*'}
      </label>
      <div className="relative">
        <input
          type={showToggle !== undefined ? (showToggle ? 'text' : 'password') : type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-white border border-neutral-300 rounded-xl px-4 py-2.5 text-xs text-neutral-800 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 pr-10"
        />
        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer"
          >
            {showToggle ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        )}
      </div>
    </div>
  );

  // ── Real Devices Toggle ───────────────────────────────────────────────────
  const RealDevicesToggle = () => (
    <div className="flex items-center gap-3 pt-1 col-span-2">
      <button
        type="button"
        onClick={() => setTerminalForm(f => ({ ...f, realDevices: !f.realDevices }))}
        className={`relative w-11 h-6 rounded-full transition-colors duration-250 cursor-pointer flex items-center ${
          terminalForm.realDevices ? 'bg-[#16A34A]' : 'bg-neutral-300'
        }`}
      >
        <span className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-250 ${
          terminalForm.realDevices ? 'translate-x-[22px]' : 'translate-x-[2px]'
        }`} />
      </button>
      <div>
        <span className="text-xs font-750 text-neutral-700">Real Device?</span>
        <p className="text-[10px] text-neutral-400 mt-0.5">
          {terminalForm.realDevices
            ? '⚠ Production mode — real payments will be processed'
            : '✓ Sandbox mode — safe for testing, no real charges'}
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">

      {/* Search & Add Action */}
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div className="relative w-full sm:w-[260px]">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={terminalSearch}
            onChange={(e) => { setTerminalSearch(e.target.value); setTerminalPage(1); }}
            placeholder="Search by Keyword"
            className="w-full bg-neutral-50 border border-neutral-200 rounded-lg pl-9.5 pr-4 py-2 text-[12px] text-neutral-700 focus:outline-none focus:border-brand-primary"
          />
          {terminalSearch && (
            <button onClick={() => setTerminalSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
              <X size={12} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-[12px] font-700 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            title="Refresh terminals"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => { resetForm(); setShowAddToken(false); setIsTerminalAddOpen(true); }}
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#e31837] hover:bg-[#b9142d] text-white text-[12px] font-800 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <Plus size={14} strokeWidth={2.5} />
            Add Terminal Setup
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-neutral-100 rounded-xl">
        <table className="w-full border-collapse text-left text-xs font-medium text-neutral-700">
          <thead className="bg-neutral-900 text-white font-800 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-5 py-3 border-b border-neutral-200">Mode</th>
              <th className="px-5 py-3 border-b border-neutral-200">Terminal Name</th>
              <th className="px-5 py-3 border-b border-neutral-200">Terminal ID</th>
              <th className="px-5 py-3 border-b border-neutral-200">API Token</th>
              <th className="px-5 py-3 border-b border-neutral-200">Store ID</th>
              <th className="px-5 py-3 border-b border-neutral-200">Created Date</th>
              <th className="px-5 py-3 border-b border-neutral-200 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {paginatedTerminals.length > 0 ? (
              paginatedTerminals.map((term) => (
                <tr key={term._id} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-800 uppercase ${
                      term.realDevices === 'Yes'
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-blue-50 text-blue-600 border border-blue-200'
                    }`}>
                      {term.realDevices === 'Yes' ? '🟢 Production' : '🔵 Sandbox'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap font-800">{term.terminalName}</td>
                  <td className="px-5 py-3.5 whitespace-nowrap font-mono text-[11px]">{term.terminalId}</td>
                  <td className="px-5 py-3.5 whitespace-nowrap font-mono text-neutral-400 text-[11px]">
                    ••••••••••••••••
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-neutral-500">{term.storeId}</td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-neutral-400">{term.createdDate}</td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => { setSelectedTerminal(term); setIsTerminalModalOpen(true); }}
                        className="w-8 h-8 rounded-full bg-neutral-800 text-white hover:bg-neutral-900 flex items-center justify-center transition-all duration-150 active:scale-90 cursor-pointer shadow-xs"
                        title="View details"
                      >
                        <Eye size={13} strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={() => {
                          setTerminalForm({
                            _id: term._id,
                            realDevices: term.realDevices === 'Yes',
                            terminalName: term.terminalName,
                            terminalId: term.terminalId,
                            apiToken: '', // blank — user must re-enter to change
                            storeId: term.storeId,
                          });
                          setShowEditToken(false);
                          setIsTerminalEditOpen(true);
                        }}
                        className="w-8 h-8 rounded-full bg-[#e31837] text-white hover:bg-[#b9142d] flex items-center justify-center transition-all duration-150 active:scale-90 cursor-pointer shadow-xs"
                        title="Edit"
                      >
                        <Edit2 size={13} strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={() => handleDeleteTerminal(term._id)}
                        className="w-8 h-8 rounded-full bg-red-650 text-white hover:bg-red-750 flex items-center justify-center transition-all duration-150 active:scale-90 cursor-pointer shadow-xs"
                        title="Delete"
                      >
                        <Trash2 size={13} strokeWidth={2.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-neutral-400">
                  No terminals configured yet. Click "Add Terminal Setup" to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 text-[11px] text-neutral-500 font-600">
        <div className="flex items-center gap-2">
          <span>Show</span>
          <select
            value={terminalLimit}
            onChange={(e) => { setTerminalLimit(Number(e.target.value)); setTerminalPage(1); }}
            className="border border-neutral-200 rounded px-1.5 py-0.5 bg-neutral-50 focus:outline-none focus:border-brand-primary cursor-pointer"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span>entries</span>
        </div>

        <div>
          Showing {filteredTerminals.length > 0 ? (terminalPage - 1) * terminalLimit + 1 : 0} to{' '}
          {Math.min(terminalPage * terminalLimit, filteredTerminals.length)} of {filteredTerminals.length} entries{' '}
          {filteredTerminals.length !== terminals.length && `(filtered from ${terminals.length} total entries)`}
        </div>

        <div className="flex items-center gap-1.5 select-none text-[10.5px]">
          <button
            disabled={terminalPage === 1}
            onClick={() => setTerminalPage(p => Math.max(1, p - 1))}
            className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors cursor-pointer active:scale-95 shadow-3xs ${
              terminalPage === 1 ? 'bg-transparent text-neutral-300 cursor-not-allowed' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            <ChevronLeft size={13} strokeWidth={2.5} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setTerminalPage(p)}
              className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors cursor-pointer active:scale-95 shadow-3xs ${
                terminalPage === p
                  ? 'bg-brand-primary text-white font-800 border border-brand-primary'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            disabled={terminalPage >= totalPages}
            onClick={() => setTerminalPage(p => p + 1)}
            className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors cursor-pointer active:scale-95 shadow-3xs ${
              terminalPage >= totalPages ? 'bg-transparent text-neutral-300 cursor-not-allowed' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            <ChevronRight size={13} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* A. Terminal Detail Modal */}
      {isTerminalModalOpen && selectedTerminal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-up font-sans">
            <div className="bg-neutral-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-850 text-sm uppercase tracking-wider">Terminal Details</h3>
              <button onClick={() => setIsTerminalModalOpen(false)} className="text-neutral-400 hover:text-white transition-colors cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 border-b border-neutral-100 pb-3">
                <div>
                  <span className="font-800 text-neutral-450 uppercase text-[9px] tracking-wide block">Terminal Name</span>
                  <span className="font-800 text-neutral-800 text-sm">{selectedTerminal.terminalName}</span>
                </div>
                <div>
                  <span className="font-800 text-neutral-450 uppercase text-[9px] tracking-wide block">Mode</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-800 uppercase ${
                    selectedTerminal.realDevices === 'Yes'
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-blue-50 text-blue-600 border border-blue-200'
                  }`}>
                    {selectedTerminal.realDevices === 'Yes' ? '🟢 Production' : '🔵 Sandbox'}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="font-800 text-neutral-450 uppercase text-[9px] tracking-wide block">Terminal ID</span>
                  <span className="font-mono text-neutral-800 text-sm font-700 bg-neutral-50 px-2 py-1 rounded border border-neutral-200/50 block mt-1">{selectedTerminal.terminalId}</span>
                </div>
                <div>
                  <span className="font-800 text-neutral-450 uppercase text-[9px] tracking-wide block">API Token</span>
                  <span className="font-mono text-neutral-400 bg-neutral-50 px-2 py-1 rounded border border-neutral-200/50 block mt-1">
                    •••••••••••••••• (hidden for security)
                  </span>
                </div>
                <div>
                  <span className="font-800 text-neutral-450 uppercase text-[9px] tracking-wide block">Store ID</span>
                  <span className="text-neutral-700 font-750 block mt-1">{selectedTerminal.storeId}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-neutral-100 text-[10px] text-neutral-450 font-600">
                <div>
                  <span>Created: {selectedTerminal.createdDate}</span>
                  <span className="block">By: {selectedTerminal.createdBy}</span>
                </div>
                <div className="text-right">
                  <span>Updated: {selectedTerminal.updatedDate}</span>
                </div>
              </div>
            </div>
            <div className="bg-neutral-50 px-6 py-4 flex justify-end">
              <button
                onClick={() => { setSelectedTerminal(null); setIsTerminalModalOpen(false); }}
                className="px-6 py-2 rounded-lg bg-[#e31837] text-white hover:bg-[#b9142d] text-xs font-800 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* B. Add Terminal Setup Modal */}
      {isTerminalAddOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-up font-sans">
            <div className="bg-neutral-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-850 text-sm uppercase tracking-wider">Add Terminal Setup</h3>
              <button onClick={() => setIsTerminalAddOpen(false)} className="text-neutral-400 hover:text-white transition-colors cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Sandbox info banner */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-[10.5px] text-blue-700">
                <strong>💡 First time?</strong> Register at <a href="https://developer.moneris.com" target="_blank" rel="noreferrer" className="underline font-700">developer.moneris.com</a> to get free Sandbox credentials (Store ID, API Token, Terminal ID).
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Terminal Name"
                  value={terminalForm.terminalName}
                  onChange={v => setTerminalForm(f => ({ ...f, terminalName: v }))}
                  placeholder="e.g. Front Counter"
                />
                <Field
                  label="Terminal ID"
                  value={terminalForm.terminalId}
                  onChange={v => setTerminalForm(f => ({ ...f, terminalId: v }))}
                  placeholder="e.g. E00000000010001"
                />
                <Field
                  label="API Token"
                  value={terminalForm.apiToken}
                  onChange={v => setTerminalForm(f => ({ ...f, apiToken: v }))}
                  placeholder="Moneris API Token"
                  showToggle={showAddToken}
                  onToggle={() => setShowAddToken(s => !s)}
                />
                <Field
                  label="Store ID"
                  value={terminalForm.storeId}
                  onChange={v => setTerminalForm(f => ({ ...f, storeId: v }))}
                  placeholder="e.g. store1"
                />
                <RealDevicesToggle />
              </div>
            </div>
            <div className="bg-neutral-50 px-6 py-4 flex justify-end gap-2.5">
              <button
                onClick={() => handleAddTerminal(false)}
                disabled={saving}
                className="px-5 py-2 rounded-lg border border-[#e31837] text-[#e31837] hover:bg-[#e31837]/10 text-xs font-800 transition-colors cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Submit'}
              </button>
              <button
                onClick={() => handleAddTerminal(true)}
                disabled={saving}
                className="px-5 py-2 rounded-lg bg-[#e31837] hover:bg-[#b9142d] text-white text-xs font-800 transition-colors cursor-pointer disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Submit & Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* C. Edit Terminal Setup Modal */}
      {isTerminalEditOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-up font-sans">
            <div className="bg-neutral-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-850 text-sm uppercase tracking-wider">Edit Terminal Setup</h3>
              <button onClick={() => setIsTerminalEditOpen(false)} className="text-neutral-400 hover:text-white transition-colors cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[10.5px] text-amber-700">
                ⚠ Leave <strong>API Token</strong> blank to keep the existing token unchanged.
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Terminal Name"
                  value={terminalForm.terminalName}
                  onChange={v => setTerminalForm(f => ({ ...f, terminalName: v }))}
                />
                <Field
                  label="Terminal ID"
                  value={terminalForm.terminalId}
                  onChange={v => setTerminalForm(f => ({ ...f, terminalId: v }))}
                />
                <Field
                  label="API Token (leave blank to keep)"
                  value={terminalForm.apiToken}
                  onChange={v => setTerminalForm(f => ({ ...f, apiToken: v }))}
                  placeholder="Enter new token to replace"
                  required={false}
                  showToggle={showEditToken}
                  onToggle={() => setShowEditToken(s => !s)}
                />
                <Field
                  label="Store ID"
                  value={terminalForm.storeId}
                  onChange={v => setTerminalForm(f => ({ ...f, storeId: v }))}
                />
                <RealDevicesToggle />
              </div>
            </div>
            <div className="bg-neutral-50 px-6 py-4 flex justify-end gap-2.5">
              <button
                onClick={() => { setIsTerminalEditOpen(false); resetForm(); }}
                className="px-5 py-2 rounded-lg border border-neutral-300 text-neutral-600 hover:bg-neutral-100 text-xs font-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleEditTerminalSave}
                disabled={saving}
                className="px-6 py-2 rounded-lg bg-[#e31837] hover:bg-[#b9142d] text-white text-xs font-800 transition-colors cursor-pointer disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
