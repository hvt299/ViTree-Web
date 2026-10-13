'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Crown, Sparkles, MapPin, Calendar, Heart, ArrowUpRight } from 'lucide-react';
import { useMembers } from '@/context/MemberContext';
import { Gender, LifeStatus, Member } from '@/types/member';

export default function AncestorsHonor() {
    const { members, openEditModal } = useMembers();

    // Ancestors: generation 1 and 2
    const ancestors = useMemo(() => {
        return members
            .filter(m => (m.generation || 1) <= 2)
            .sort((a, b) => (a.generation || 1) - (b.generation || 1));
    }, [members]);

    if (ancestors.length === 0) return null;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-xl">
                        <Crown className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                            Tiền Nhân Khai Sinh & Bậc Tiền Bối
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Tôn vinh cội nguồn tổ tiên đời thứ 1 và thứ 2 của dòng họ
                        </p>
                    </div>
                </div>

                <Link
                    href="/tree"
                    className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                >
                    <span>Xem gốc rễ trên Cây</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ancestors.map((ancestor: Member) => {
                    const isGen1 = (ancestor.generation || 1) === 1;

                    return (
                        <div
                            key={ancestor._id}
                            className={`p-4 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                                isGen1
                                    ? 'bg-linear-to-br from-amber-50/70 to-orange-50/40 dark:from-amber-950/20 dark:to-orange-950/10 border-amber-300 dark:border-amber-800/80 shadow-xs'
                                    : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800'
                            }`}
                        >
                            <div className="space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-3">
                                        {ancestor.avatarUrl ? (
                                            <img
                                                src={ancestor.avatarUrl}
                                                alt={ancestor.fullName}
                                                className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-400 shadow-sm"
                                            />
                                        ) : (
                                            <div
                                                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base shadow-xs ${
                                                    ancestor.gender === Gender.FEMALE
                                                        ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-300'
                                                        : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
                                                }`}
                                            >
                                                {ancestor.fullName.charAt(0)}
                                            </div>
                                        )}
                                        <div>
                                            <div className="flex items-center gap-1.5">
                                                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                                                    {ancestor.fullName}
                                                </h3>
                                                {isGen1 && (
                                                    <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                                                )}
                                            </div>
                                            {ancestor.tuName && (
                                                <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium italic">
                                                    Tự: {ancestor.tuName}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <span
                                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold shrink-0 ${
                                            isGen1
                                                ? 'bg-amber-500 text-white shadow-xs'
                                                : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                                        }`}
                                    >
                                        Đời {ancestor.generation}
                                    </span>
                                </div>

                                <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                                    {(ancestor.birthDate || ancestor.deathDate) && (
                                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                            <Calendar className="w-3 h-3 text-amber-500 shrink-0" />
                                            <span>
                                                {ancestor.birthDate || '???'} - {ancestor.deathDate || 'Hiện tại'}
                                            </span>
                                        </div>
                                    )}

                                    {ancestor.burialPlace && (
                                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                            <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                                            <span className="truncate" title={ancestor.burialPlace}>
                                                Mộ phần: {ancestor.burialPlace}
                                            </span>
                                        </div>
                                    )}

                                    {ancestor.shortNote && (
                                        <p className="text-slate-500 dark:text-slate-400 italic line-clamp-2 pt-1">
                                            "{ancestor.shortNote}"
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="pt-3 mt-3 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between">
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                                    {ancestor.status === LifeStatus.DECEASED ? (
                                        <>
                                            <Sparkles className="w-3 h-3 text-stone-400" />
                                            Tiền nhân (Đã mất)
                                        </>
                                    ) : (
                                        <>
                                            <Heart className="w-3 h-3 text-emerald-500 fill-emerald-500/20" />
                                            Sinh thời
                                        </>
                                    )}
                                </span>

                                <button
                                    onClick={() => openEditModal(ancestor)}
                                    className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                                >
                                    Xem chi tiết
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
