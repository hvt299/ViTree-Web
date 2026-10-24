'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import apiClient from '@/lib/api';
import { TreePine, User, Lock, Loader2, ArrowRight, Eye, EyeOff, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res: any = await apiClient.post('/api/auth/login', { username, password });
            Cookies.set('access_token', res.access_token, { expires: 1 });

            router.push('/');
            router.refresh();
        } catch (err: any) {
            setError(
                err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản và mật khẩu!'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-amber-50/70 via-stone-50 to-orange-50/60 dark:from-slate-950 dark:via-slate-900 dark:to-stone-950 p-4 relative overflow-hidden transition-colors">
            {/* Theme Toggle Button at top right */}
            <div className="absolute top-5 right-5 z-20">
                <button
                    onClick={toggleTheme}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-all shadow-xs"
                    title={theme === 'dark' ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
                >
                    {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
                </button>
            </div>

            {/* Decorative background ambient lighting */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-[15%] -left-[10%] w-[50%] h-[50%] rounded-full bg-amber-400/10 dark:bg-amber-500/10 blur-3xl" />
                <div className="absolute -bottom-[15%] -right-[10%] w-[50%] h-[50%] rounded-full bg-orange-400/10 dark:bg-orange-500/10 blur-3xl" />
            </div>

            {/* Login Card (Level 10) */}
            <div className="w-full max-w-md p-8 sm:p-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-2xl rounded-3xl border border-slate-200/80 dark:border-slate-800 relative z-10 transition-colors">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-linear-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-amber-500/25 text-white">
                        <TreePine className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                        ViTree
                    </h1>
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mt-1">
                        Hệ thống Quản lý Gia phả & Huyết thống
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/40 border-l-4 border-rose-500 rounded-r-xl text-rose-700 dark:text-rose-300 text-xs font-medium animate-in fade-in duration-200">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            Tên đăng nhập
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <User className="h-4 w-4" />
                            </div>
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                className="block w-full pl-10 pr-3.5 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-800/60 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
                                placeholder="Nhập tài khoản quản trị..."
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            Mật khẩu
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <Lock className="h-4 w-4" />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="block w-full pl-10 pr-10 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-800/60 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
                                placeholder="Nhập mật khẩu..."
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-xs font-bold text-white bg-linear-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-amber-600/25 hover:shadow-lg"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                Đăng nhập hệ thống
                                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <p className="mt-8 text-center text-[11px] text-slate-400 dark:text-slate-500">
                    ViTree • Hệ thống quản lý gia phả dòng họ
                </p>
            </div>
        </div>
    );
}