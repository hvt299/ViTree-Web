'use client';

import React, { useState, useMemo } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import FamilyTree from '@/components/FamilyTree';
import { useMembers } from '@/context/MemberContext';
import { Network, Filter, RotateCcw, GitBranch, Layers } from 'lucide-react';

export default function FamilyTreePage() {
    const { members, maxGeneration, openEditModal } = useMembers();

    const [rootMemberId, setRootMemberId] = useState('');
    const [maxGenFilter, setMaxGenFilter] = useState<number>(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [genderFilter, setGenderFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Root branch candidates (Generations 1 to 3)
    const rootCandidates = useMemo(() => {
        return members
            .filter((m) => (m.generation || 1) <= 3)
            .sort((a, b) => (a.generation || 1) - (b.generation || 1));
    }, [members]);

    // Lineage subtree pruning logic
    const structuralMembers = useMemo(() => {
        let result = members;

        if (rootMemberId) {
            const keepIds = new Set<string>();
            const queue = [rootMemberId];

            const addSpouses = (mId: string) => {
                const m = members.find((x) => x._id === mId);
                if (m && m.spouseIds) {
                    m.spouseIds.forEach((s) => keepIds.add(typeof s === 'string' ? s : s._id));
                }
            };

            while (queue.length > 0) {
                const currentId = queue.shift()!;
                if (!keepIds.has(currentId)) {
                    keepIds.add(currentId);
                    addSpouses(currentId);

                    const children = members.filter(
                        (m) =>
                            m.fatherIds?.some((f) => (typeof f === 'string' ? f : f._id) === currentId) ||
                            m.motherIds?.some((mo) => (typeof mo === 'string' ? mo : mo._id) === currentId)
                    );
                    children.forEach((c) => queue.push(c._id));
                }
            }
            result = result.filter((m) => keepIds.has(m._id));
        }

        if (maxGenFilter > 0) {
            result = result.filter((m) => (m.generation || 1) <= maxGenFilter);
        }

        return result;
    }, [members, rootMemberId, maxGenFilter]);

    const activeRootMember = useMemo(() => {
        return members.find((m) => m._id === rootMemberId);
    }, [members, rootMemberId]);

    const resetSubtree = () => {
        setRootMemberId('');
        setMaxGenFilter(0);
        setSearchQuery('');
        setGenderFilter('');
        setStatusFilter('');
    };

    return (
        <AppLayout>
            <main className="flex-1 flex flex-col p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-4">
                {/* Tree Subheader & Quick Branch Controls */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-2xl">
                            <Network className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                Sơ Đồ Cây Phả Hệ Trực Quan
                                {activeRootMember && (
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                        Đang xem chi của: {activeRootMember.fullName}
                                    </span>
                                )}
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Hiển thị cấu trúc huyết thống và phối ngẫu ({structuralMembers.length} thành viên đang hiển thị)
                            </p>
                        </div>
                    </div>

                    {/* Filter controls */}
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Subtree Branch Selector */}
                        <div className="flex items-center gap-1.5">
                            <GitBranch className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            <select
                                value={rootMemberId}
                                onChange={(e) => setRootMemberId(e.target.value)}
                                className="px-3 py-1.5 text-xs border border-amber-300 dark:border-amber-700/80 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-amber-900 dark:text-amber-300 font-semibold cursor-pointer"
                            >
                                <option value="">Toàn bộ dòng họ (Gốc)</option>
                                {rootCandidates.map((m) => (
                                    <option key={m._id} value={m._id}>
                                        Chi của: {m.fullName} (Đời {m.generation})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Generation Filter */}
                        <div className="flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-indigo-500" />
                            <select
                                value={maxGenFilter}
                                onChange={(e) => setMaxGenFilter(Number(e.target.value))}
                                className="px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                            >
                                <option value={0}>Tất cả Đời</option>
                                {Array.from({ length: maxGeneration }, (_, i) => i + 1).map((g) => (
                                    <option key={g} value={g}>
                                        Đến Đời {g}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {(rootMemberId || maxGenFilter > 0) && (
                            <button
                                onClick={resetSubtree}
                                className="p-2 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                                title="Xem toàn bộ cây"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Đặt lại gốc</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Main Interactive Family Tree Canvas */}
                <div className="flex-1 min-h-[750px] w-full">
                    <FamilyTree
                        members={structuralMembers}
                        searchQuery={searchQuery}
                        genderFilter={genderFilter}
                        statusFilter={statusFilter}
                        onEditMember={openEditModal}
                        onSetRootMember={(id) => setRootMemberId(id)}
                    />
                </div>
            </main>
        </AppLayout>
    );
}
