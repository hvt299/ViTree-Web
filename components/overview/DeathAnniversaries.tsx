'use client';

import React, { useMemo } from 'react';
import { Calendar, Moon, Sparkles, MapPin, Heart, Plus } from 'lucide-react';
import { useMembers } from '@/context/MemberContext';
import { LifeStatus, Member } from '@/types/member';

export default function DeathAnniversaries() {
    const { members, openEditModal } = useMembers();

    // Members who have passed away and have lunar anniversary or death date info
    const memorialMembers = useMemo(() => {
        return members
            .filter(m => m.status === LifeStatus.DECEASED)
            .sort((a, b) => (a.generation || 1) - (b.generation || 1));
    }, [members]);

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 rounded-xl">
                        <Moon className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                            Tưởng Nhớ & Ngày Giỗ Tiền Nhân
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Theo dõi ngày giỗ âm lịch và nơi an táng của các bậc tiền bối
                        </p>
                    </div>
                </div>

                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                    {memorialMembers.length} tiền nhân
                </span>
            </div>

            {memorialMembers.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                    Chưa có thông tin tiền nhân đã mất trong hệ thống.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {memorialMembers.slice(0, 6).map((m: Member) => {
                        const lunar = m.lunarDeathAnniversary;
                        let lunarText = lunar?.displayText;
                        if (!lunarText && lunar?.day && lunar?.month) {
                            lunarText = `Ngày ${lunar.day} tháng ${lunar.month}${lunar.isLeapMonth ? ' (nhuận)' : ''} Âm lịch`;
                        }

                        return (
                            <div
                                key={m._id}
                                className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between hover:border-amber-300 dark:hover:border-amber-700/80 transition-all"
                            >
                                <div className="space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                                                {m.fullName}
                                            </h3>
                                            {m.tuName && (
                                                <p className="text-[10px] text-amber-600 dark:text-amber-400 italic">
                                                    Tự: {m.tuName}
                                                </p>
                                            )}
                                        </div>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-200/80 dark:bg-stone-700 text-stone-700 dark:text-stone-300 shrink-0">
                                            Đời {m.generation}
                                        </span>
                                    </div>

                                    <div className="space-y-1 text-[11px]">
                                        <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 font-medium">
                                            <Moon className="w-3 h-3 text-amber-500 shrink-0" />
                                            <span>{lunarText || (m.deathDate ? `Mất: ${m.deathDate}` : 'Chưa ghi nhận ngày giỗ')}</span>
                                        </div>

                                        {m.burialPlace && (
                                            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                                <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                                                <span className="truncate" title={m.burialPlace}>
                                                    An táng: {m.burialPlace}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-2 mt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex justify-end">
                                    <button
                                        onClick={() => openEditModal(m)}
                                        className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                                    >
                                        Chỉnh sửa / Bổ sung
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
