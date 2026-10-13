'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    TreePine,
    LayoutDashboard,
    Network,
    Users,
    Plus,
    Sun,
    Moon,
    LogOut,
    Menu,
    X,
} from 'lucide-react';
import Cookies from 'js-cookie';
import { useTheme } from '@/components/ThemeProvider';
import { useMembers } from '@/context/MemberContext';

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();
    const { openAddModal } = useMembers();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        Cookies.remove('access_token');
        router.push('/login');
    };

    const navLinks = [
        {
            href: '/',
            label: 'Tổng quan',
            icon: LayoutDashboard,
            active: pathname === '/',
        },
        {
            href: '/tree',
            label: 'Cây phả hệ',
            icon: Network,
            active: pathname.startsWith('/tree'),
        },
        {
            href: '/members',
            label: 'Danh sách thành viên',
            icon: Users,
            active: pathname.startsWith('/members'),
        },
    ];

    return (
        <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3 sticky top-0 z-40 shadow-xs transition-colors">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                {/* Logo Cluster: Click navigates to Clan Overview ("Trang tổng quan") */}
                <Link
                    href="/"
                    prefetch={true}
                    className="flex items-center gap-3 group shrink-0 focus:outline-none rounded-xl p-1 -m-1"
                    title="Về Trang tổng quan gia tộc"
                >
                    <div className="w-10 h-10 bg-linear-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-md shadow-amber-500/20 text-white transition-transform group-hover:scale-105">
                        <TreePine className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-tight">
                                ViTree
                            </h1>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                Dòng Họ
                            </span>
                        </div>
                        <p className="text-[11px] font-medium text-amber-700 dark:text-amber-400">
                            Quản lý Gia phả & Huyết thống
                        </p>
                    </div>
                </Link>

                {/* Desktop Nav Links */}
                <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/70 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
                    {navLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                                    link.active
                                        ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs font-bold'
                                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
                                }`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                <span>{link.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Right Actions: Theme, Add Member, Logout, Mobile Hamburger */}
                <div className="flex items-center gap-2">
                    {/* Theme Toggle Button */}
                    <button
                        onClick={toggleTheme}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-all"
                        title={theme === 'dark' ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
                        aria-label="Đổi giao diện"
                    >
                        {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
                    </button>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
                        title="Đăng xuất khỏi hệ thống"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng xuất</span>
                    </button>

                    {/* Mobile Menu Toggle Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                        aria-label="Mở menu"
                    >
                        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden pt-3 pb-2 border-t border-slate-200 dark:border-slate-800 mt-3 flex flex-col gap-1.5 animate-in slide-in-from-top-2 duration-200">
                    {navLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                                    link.active
                                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-bold border border-amber-200 dark:border-amber-900'
                                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{link.label}</span>
                            </Link>
                        );
                    })}

                    <div className="pt-2 mt-1 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end">
                        <button
                            onClick={handleLogout}
                            className="w-full justify-center p-2 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Đăng xuất</span>
                        </button>
                    </div>
                </div>
            )}
        </header>
    );
}
