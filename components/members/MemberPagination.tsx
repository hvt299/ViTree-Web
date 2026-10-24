'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MemberPaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    currentItemsCount: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
}

export default function MemberPagination({
    currentPage,
    totalPages,
    totalItems,
    currentItemsCount,
    itemsPerPage,
    onPageChange,
}: MemberPaginationProps) {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
        if (currentPage <= 3) return [1, 2, 3, 4, '...', totalPages - 1, totalPages];
        if (currentPage >= totalPages - 2)
            return [1, 2, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
    };

    return (
        <div className="flex flex-wrap items-center justify-between p-4 border border-slate-200/80 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-xs gap-4 transition-colors">
            <p className="text-xs text-slate-500 dark:text-slate-400">
                Hiển thị{' '}
                <span className="font-bold text-slate-900 dark:text-slate-100">
                    {currentItemsCount > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
                </span>{' '}
                đến{' '}
                <span className="font-bold text-slate-900 dark:text-slate-100">
                    {Math.min(currentPage * itemsPerPage, totalItems)}
                </span>{' '}
                trong tổng số{' '}
                <span className="font-bold text-slate-900 dark:text-slate-100">
                    {totalItems}
                </span>{' '}
                thành viên
            </p>

            <div className="flex items-center gap-1.5">
                <button
                    onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors cursor-pointer disabled:cursor-not-allowed"
                    title="Trang trước"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                {getPageNumbers().map((p, i) =>
                    p === '...' ? (
                        <span key={i} className="px-2 py-1 text-slate-400 text-xs">
                            ...
                        </span>
                    ) : (
                        <button
                            key={i}
                            onClick={() => onPageChange(p as number)}
                            className={`min-w-8 h-8 flex items-center justify-center rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                                currentPage === p
                                    ? 'bg-amber-600 border-amber-600 text-white shadow-xs'
                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                            }`}
                        >
                            {p}
                        </button>
                    )
                )}

                <button
                    onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors cursor-pointer disabled:cursor-not-allowed"
                    title="Trang sau"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
