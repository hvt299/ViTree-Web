'use client';

import React, { useState, useMemo, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import MemberFilterToolbar from '@/components/members/MemberFilterToolbar';
import MemberTable from '@/components/members/MemberTable';
import MemberGrid from '@/components/members/MemberGrid';
import MemberPagination from '@/components/members/MemberPagination';
import { useMembers } from '@/context/MemberContext';
import { Users, Plus, TableProperties, LayoutGrid } from 'lucide-react';

export default function MembersPage() {
    const {
        members,
        loading,
        maxGeneration,
        openAddModal,
        openEditModal,
        deleteMember,
    } = useMembers();

    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState<'TABLE' | 'GRID'>('TABLE');
    const ITEMS_PER_PAGE = viewMode === 'TABLE' ? 10 : 12;

    const [searchQuery, setSearchQuery] = useState('');
    const [genderFilter, setGenderFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [rootMemberId, setRootMemberId] = useState('');
    const [maxGenFilter, setMaxGenFilter] = useState<number>(0);

    // Root branch candidates (Generations 1 to 3)
    const rootCandidates = useMemo(() => {
        return members
            .filter((m) => (m.generation || 1) <= 3)
            .sort((a, b) => (a.generation || 1) - (b.generation || 1));
    }, [members]);

    // Subtree filtering
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

    // Search and status filters
    const filteredMembers = useMemo(() => {
        return structuralMembers.filter((m) => {
            const matchSearch = m.fullName.toLowerCase().includes(searchQuery.toLowerCase().trim());
            const matchGender = genderFilter ? m.gender === genderFilter : true;
            const matchStatus = statusFilter ? m.status === statusFilter : true;
            return matchSearch && matchGender && matchStatus;
        });
    }, [structuralMembers, searchQuery, genderFilter, statusFilter]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, genderFilter, statusFilter, rootMemberId, maxGenFilter, viewMode]);

    const totalPages = Math.max(1, Math.ceil(filteredMembers.length / ITEMS_PER_PAGE));
    const currentTableData = filteredMembers.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const resetFilters = () => {
        setSearchQuery('');
        setGenderFilter('');
        setStatusFilter('');
        setRootMemberId('');
        setMaxGenFilter(0);
    };

    const hasActiveFilters = Boolean(
        searchQuery || genderFilter || statusFilter || rootMemberId || maxGenFilter > 0
    );

    return (
        <AppLayout>
            <main className="flex-1 flex flex-col p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-4">
                {/* Members Subheader & View Controls (aligned with Tree Page) */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-2xl">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                Danh Sách Thành Viên Dòng Họ
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                    {filteredMembers.length} thành viên
                                </span>
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Quản lý hồ sơ, thông tin thế hệ, ngày sinh mất và chi phái trong gia tộc
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
                        {/* View Mode Toggle: Table vs Grid */}
                        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0 border border-slate-200/60 dark:border-slate-700/60">
                            <button
                                onClick={() => setViewMode('TABLE')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                    viewMode === 'TABLE'
                                        ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs font-extrabold'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                                title="Xem dạng bảng chi tiết"
                            >
                                <TableProperties className="w-3.5 h-3.5" />
                                <span>Bảng</span>
                            </button>
                            <button
                                onClick={() => setViewMode('GRID')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                    viewMode === 'GRID'
                                        ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs font-extrabold'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                                title="Xem dạng lưới thẻ danh bạ"
                            >
                                <LayoutGrid className="w-3.5 h-3.5" />
                                <span>Thẻ</span>
                            </button>
                        </div>

                        <button
                            onClick={openAddModal}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-linear-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-xs shadow-amber-600/20 rounded-xl transition-all cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Thêm thành viên</span>
                        </button>
                    </div>
                </div>

                {/* Filter Toolbar */}
                <MemberFilterToolbar
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    genderFilter={genderFilter}
                    onGenderChange={setGenderFilter}
                    statusFilter={statusFilter}
                    onStatusChange={setStatusFilter}
                    rootMemberId={rootMemberId}
                    onRootMemberChange={setRootMemberId}
                    maxGenFilter={maxGenFilter}
                    onMaxGenChange={setMaxGenFilter}
                    maxGeneration={maxGeneration}
                    rootCandidates={rootCandidates}
                    onReset={resetFilters}
                    hasActiveFilters={hasActiveFilters}
                />

                {/* Members Data Display (Table View or Grid View) */}
                {viewMode === 'TABLE' ? (
                    <MemberTable
                        members={currentTableData}
                        loading={loading}
                        startIndex={(currentPage - 1) * ITEMS_PER_PAGE}
                        onEdit={openEditModal}
                        onDelete={deleteMember}
                    />
                ) : (
                    <MemberGrid
                        members={currentTableData}
                        loading={loading}
                        onEdit={openEditModal}
                        onDelete={deleteMember}
                    />
                )}

                {/* Pagination */}
                <MemberPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredMembers.length}
                    currentItemsCount={currentTableData.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setCurrentPage}
                />
            </main>
        </AppLayout>
    );
}
