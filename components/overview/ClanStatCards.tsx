'use client';

import React, { useMemo } from 'react';
import {
    Users,
    Layers,
    Heart,
    Sparkles,
    UserCheck,
    HeartHandshake,
    Activity,
} from 'lucide-react';
import { useMembers } from '@/context/MemberContext';

export default function ClanStatCards() {
    const {
        members,
        loading,
        maxGeneration,
        aliveCount,
        deceasedCount,
        maleCount,
        femaleCount,
    } = useMembers();

    const total = members.length;
    const malePercent = total > 0 ? Math.round((maleCount / total) * 100) : 0;
    const femalePercent = total > 0 ? Math.round((femaleCount / total) * 100) : 0;
    const alivePercent = total > 0 ? Math.round((aliveCount / total) * 100) : 0;
    const deceasedPercent = total > 0 ? Math.round((deceasedCount / total) * 100) : 0;

    // Number of married members (having spouseIds)
    const marriedCount = useMemo(() => {
        return members.filter(m => m.spouseIds && m.spouseIds.length > 0).length;
    }, [members]);

    return (
        <div className="space-y-4">
            {/* Primary 4 Heritage Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Metric 1: Total Members */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-800 flex items-center gap-4 transition-all hover:border-amber-300 dark:hover:border-amber-700">
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-2xl shrink-0">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tổng thành viên</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-0.5">
                            {loading ? '-' : total}
                        </p>
                        <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">Toàn thể dòng tộc</p>
                    </div>
                </div>

                {/* Metric 2: Generations */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-800 flex items-center gap-4 transition-all hover:border-indigo-300 dark:hover:border-indigo-700">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-2xl shrink-0">
                        <Layers className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Số đời truyền thừa</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-0.5">
                            {maxGeneration === 0 && loading ? '-' : maxGeneration}
                        </p>
                        <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">Thế hệ trực hệ</p>
                    </div>
                </div>

                {/* Metric 3: Alive */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-800 flex items-center gap-4 transition-all hover:border-emerald-300 dark:hover:border-emerald-700">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-2xl shrink-0">
                        <Heart className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Sinh thời (Còn sống)</p>
                        <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                            {loading ? '-' : aliveCount}
                        </p>
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">{alivePercent}% dòng tộc</p>
                    </div>
                </div>

                {/* Metric 4: Deceased */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-800 flex items-center gap-4 transition-all hover:border-stone-400 dark:hover:border-stone-600">
                    <div className="p-3 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 rounded-2xl shrink-0">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tiền nhân (Đã mất)</p>
                        <p className="text-2xl font-black text-stone-700 dark:text-stone-300 mt-0.5">
                            {loading ? '-' : deceasedCount}
                        </p>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">{deceasedPercent}% dòng tộc</p>
                    </div>
                </div>
            </div>

            {/* Secondary Demographic Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Gender Balance */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-sky-500" />
                            Cơ cấu Giới tính
                        </span>
                        <span className="text-xs text-slate-400">Tổng: {total}</span>
                    </div>

                    <div className="flex justify-between text-xs font-semibold">
                        <span className="text-sky-600 dark:text-sky-400">Nam: {maleCount} ({malePercent}%)</span>
                        <span className="text-rose-600 dark:text-rose-400">Nữ: {femaleCount} ({femalePercent}%)</span>
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
                        <div
                            className="bg-sky-500 h-full transition-all duration-500"
                            style={{ width: `${malePercent}%` }}
                            title={`Nam: ${maleCount} (${malePercent}%)`}
                        />
                        <div
                            className="bg-rose-500 h-full transition-all duration-500"
                            style={{ width: `${femalePercent}%` }}
                            title={`Nữ: ${femaleCount} (${femalePercent}%)`}
                        />
                    </div>
                </div>

                {/* Life Status Balance */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5 text-emerald-500" />
                            Tỷ lệ Sinh thời & Tiền nhân
                        </span>
                        <span className="text-xs text-slate-400">Tỷ lệ</span>
                    </div>

                    <div className="flex justify-between text-xs font-semibold">
                        <span className="text-emerald-600 dark:text-emerald-400">Còn sống: {aliveCount} ({alivePercent}%)</span>
                        <span className="text-stone-600 dark:text-stone-400">Đã mất: {deceasedCount} ({deceasedPercent}%)</span>
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
                        <div
                            className="bg-emerald-500 h-full transition-all duration-500"
                            style={{ width: `${alivePercent}%` }}
                            title={`Còn sống: ${aliveCount} (${alivePercent}%)`}
                        />
                        <div
                            className="bg-stone-400 dark:bg-stone-500 h-full transition-all duration-500"
                            style={{ width: `${deceasedPercent}%` }}
                            title={`Đã mất: ${deceasedCount} (${deceasedPercent}%)`}
                        />
                    </div>
                </div>

                {/* Marriage & Kinship */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <HeartHandshake className="w-3.5 h-3.5 text-amber-500" />
                            Hôn nhân & Phối ngẫu
                        </span>
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                            {marriedCount} người có phối ngẫu
                        </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        {marriedCount > 0
                            ? `Đã ghi nhận mối quan hệ vợ chồng cho ${marriedCount} thành viên trong phả hệ.`
                            : 'Chưa có thông tin phối ngẫu được cập nhật.'}
                    </p>

                    <div className="mt-2 text-[11px] font-medium text-amber-700 dark:text-amber-400 flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Liên kết phả hệ chuẩn theo huyết thống & hôn phối</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
