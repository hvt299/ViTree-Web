'use client';

import React from 'react';
import { Search, Filter, RotateCcw, X } from 'lucide-react';
import { Member } from '@/types/member';

interface MemberFilterToolbarProps {
    searchQuery: string;
    onSearchChange: (q: string) => void;
    genderFilter: string;
    onGenderChange: (g: string) => void;
    statusFilter: string;
    onStatusChange: (s: string) => void;
    rootMemberId: string;
    onRootMemberChange: (id: string) => void;
    maxGenFilter: number;
    onMaxGenChange: (gen: number) => void;
    maxGeneration: number;
    rootCandidates: Member[];
    onReset: () => void;
    hasActiveFilters: boolean;
}

export default function MemberFilterToolbar({
    searchQuery,
    onSearchChange,
    genderFilter,
    onGenderChange,
    statusFilter,
    onStatusChange,
    rootMemberId,
    onRootMemberChange,
    maxGenFilter,
    onMaxGenChange,
    maxGeneration,
    rootCandidates,
    onReset,
    hasActiveFilters,
}: MemberFilterToolbarProps) {
    return (
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-800 space-y-3 transition-colors">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        Bộ Lọc & Tìm Kiếm Thành Viên
                    </h3>
                </div>

                {hasActiveFilters && (
                    <button
                        onClick={onReset}
                        className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                    >
                        <RotateCcw className="w-3 h-3" />
                        <span>Đặt lại bộ lọc</span>
                    </button>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
                {/* Search Input */}
                <div className="relative flex-1 min-w-56">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Tìm kiếm theo họ và tên..."
                        className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => onSearchChange('')}
                            className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                {/* Subtree Root Branch Filter */}
                <select
                    value={rootMemberId}
                    onChange={(e) => onRootMemberChange(e.target.value)}
                    className="px-3 py-2 text-xs border border-amber-300 dark:border-amber-700/80 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-amber-900 dark:text-amber-300 font-semibold cursor-pointer"
                >
                    <option value="">Toàn bộ dòng họ (Gốc)</option>
                    {rootCandidates.map((m) => (
                        <option key={m._id} value={m._id}>
                            Chi của: {m.fullName} (Đời {m.generation})
                        </option>
                    ))}
                </select>

                {/* Generation Filter */}
                <select
                    value={maxGenFilter}
                    onChange={(e) => onMaxGenChange(Number(e.target.value))}
                    className="px-3 py-2 text-xs border border-amber-300 dark:border-amber-700/80 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-amber-900 dark:text-amber-300 font-semibold cursor-pointer"
                >
                    <option value={0}>Tất cả các Đời</option>
                    {Array.from({ length: maxGeneration }, (_, i) => i + 1).map((g) => (
                        <option key={g} value={g}>
                            Chỉ hiển thị đến Đời {g}
                        </option>
                    ))}
                </select>

                {/* Gender Filter */}
                <select
                    value={genderFilter}
                    onChange={(e) => onGenderChange(e.target.value)}
                    className="px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
                >
                    <option value="">Tất cả giới tính</option>
                    <option value="MALE">Nam giới</option>
                    <option value="FEMALE">Nữ giới</option>
                </select>

                {/* Status Filter */}
                <select
                    value={statusFilter}
                    onChange={(e) => onStatusChange(e.target.value)}
                    className="px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
                >
                    <option value="">Tất cả tình trạng</option>
                    <option value="ALIVE">Còn sống</option>
                    <option value="DECEASED">Đã mất</option>
                </select>
            </div>
        </div>
    );
}
