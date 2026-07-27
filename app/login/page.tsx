'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Store, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function BranchLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/branches/login`, {
        email: email.trim(),
        password: password.trim(),
      });

      if (res.data.success && res.data.data) {
        const branchData = res.data.data;
        if (typeof window !== 'undefined') {
          localStorage.setItem('rms_branch', JSON.stringify(branchData));
          document.cookie = `rms_branch_session=true; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
          if (branchData.token) {
            document.cookie = `rms_branch_token=${branchData.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
          }
        }
        router.push('/');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Branch login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0F0E0D] flex items-center justify-center p-4 font-sans text-neutral-100 select-none">
      <div className="w-full max-w-md bg-[#161412] border border-neutral-800 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Logo & Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary mx-auto shadow-lg shadow-brand-primary/10">
            <Store size={28} />
          </div>
          <h1 className="text-xl font-800 tracking-tight text-white uppercase">
            Chicken Delight
          </h1>
          <p className="text-xs font-600 text-neutral-400">
            Branch POS &amp; Terminal Login
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-600 rounded-xl text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[10px] font-700 uppercase tracking-wider text-neutral-400 mb-1.5">
              Branch Email
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="email"
                required
                placeholder="downtown@chickendelight.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#201D1A] border border-neutral-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-brand-primary transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-700 uppercase tracking-wider text-neutral-400 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#201D1A] border border-neutral-800 rounded-xl pl-10 pr-10 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-brand-primary transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-700 uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              'Authenticating...'
            ) : (
              <>
                Login To Terminal <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-neutral-800/80 text-center">
          <p className="text-[10px] text-neutral-500">
            Contact Super Admin if you forgot branch login credentials.
          </p>
        </div>
      </div>
    </div>
  );
}
