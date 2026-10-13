'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Layers, ArrowRight, UserCheck, Heart, Sparkles } from 'lucide-react';
import { useMembers } from '@/context/MemberContext';
import { Gender, LifeStatus } from '@/types/member';

export default function GenerationBreakdown() {
    const { members, maxGeneration } = useMembers();

    const generationStats = useMemo(() => {
        if (maxGeneration === 0) return [];

        const stats = [];
        for (let g = 1; g <= maxGeneration; g++) {
            const genMembers = members.filter(m => (m.generation || 1) === g);
            const count = genMembers.length;
            const alive = genMembers.filter(m => m.status === LifeStatus.ALIVE).length;
            const deceased = genMembers.filter(m => m.status === LifeStatus.DECEASED).length;
            const male = genMembers.filter(m => m.gender === Gender.MALE).length;
            const female = genMembers.filter(m => m.gender === Gender.FEMALE).length;

            let title = `Đời ${g}`;
            if (g === 1) title = `Đời 1 (Cụ Khởi Tổ / Cụ Tổ)`;
            else if (g === 2) title = `Đời 2 (Bậc Tiền bối)`;
            else if (g === 3) title = `Đời 3 (Hậu duệ trực hệ)`;

            stats.push({
                generation: g,
                title,
                count,
                alive,
                deceased,
                male,
                female,
                percent: members.length > 0 ? Math.round((count / members.length) * 100) : 0,
            });
        }
        return stats;
    }, [members, maxGeneration]);

    if (generationStats.length === 0) return null;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
                        <Layers className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                            Phân Bố Dòng Tộc Theo Thế Hệ
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Thống kê số lượng thành viên phân chia theo từng đời truyền thừa
                        </p>
                    </div>
                </div>

                <Link
                    href="/members"
                    className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                >
                    <span>Xem toàn bộ danh sách</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                </Link>
            </div>

            {/* Grid of Generations */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {generationStats.map((item) => (
                    <div
                        key={item.generation}
                        className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between hover:border-amber-300 dark:hover:border-amber-700/80 transition-all group"
                    >
                        <div>
                            <div className="flex items-center justify-between">
                                <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                    {item.title}
                                </span>
                                <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                                    {item.count} người
                                </span>
                            </div>

                            <p className="text-[11px] text-slate-400 mt-1">
                                Chiếm {item.percent}% tổng nhân khẩu dòng tộc
                            </p>

                            {/* Progress bar */}
                            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-3">
                                <div
                                    className="bg-amber-500 h-full rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(item.percent * 2, 100)}%` }}
                                />
                            </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-2">
                                <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
                                    <Heart className="w-3 h-3 fill-emerald-500/20" /> {item.alive} sống
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-0.5 text-stone-500 dark:text-stone-400">
                                    <Sparkles className="w-3 h-3" /> {item.deceased} mất
                                </span>
                            </div>

                            <div className="flex items-center gap-1.5 font-medium">
                                <span className="text-sky-600 dark:text-sky-400">{item.male} nam</span>
                                <span>/</span>
                                <span className="text-rose-600 dark:text-rose-400">{item.female} nữ</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
