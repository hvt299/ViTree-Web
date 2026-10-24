'use client';

import React from 'react';
import {
    Loader2,
    Edit3,
    Trash2,
    Heart,
    Sparkles,
    Crown,
    Moon,
    MapPin,
    Calendar,
    UserMinus,
    User,
} from 'lucide-react';
import { Member, Gender, LifeStatus } from '@/types/member';
import { getOrderText } from '@/components/CompactFamilyNode';

interface MemberGridProps {
    members: Member[];
    loading: boolean;
    onEdit: (member: Member) => void;
    onDelete: (id: string, name: string) => void;
}

export default function MemberGrid({
    members,
    loading,
    onEdit,
    onDelete,
}: MemberGridProps) {
    if (loading) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-xs">
                    Đang tải danh sách thành viên...
                </p>
            </div>
        );
    }

    if (members.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <p className="text-slate-500 dark:text-slate-400 text-xs">
                    Không tìm thấy thành viên nào phù hợp với bộ lọc.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {members.map((member) => {
                const isGen1 = (member.generation || 1) === 1;
                const isDeceased = member.status === LifeStatus.DECEASED;
                const isMale = member.gender === Gender.MALE;
                const orderText = getOrderText(member.orderInFamily);

                const bYear = member.birthDate ? member.birthDate.split('-')[0] : '';
                const dYear = member.deathDate ? member.deathDate.split('-')[0] : (isDeceased ? '†' : '');
                let yearsText = '';
                if (bYear && dYear) yearsText = `${bYear} - ${dYear}`;
                else if (bYear) yearsText = `Sinh: ${bYear}`;
                else if (dYear) yearsText = `Mất: ${dYear}`;

                return (
                    <div
                        key={member._id}
                        className={`rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                            isGen1
                                ? 'bg-linear-to-b from-amber-50/90 via-orange-50/30 to-white dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-900 border-amber-300 dark:border-amber-700/80'
                                : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-700'
                        }`}
                    >
                        {/* Card Top: Generation & Status Badge */}
                        <div className="p-3.5 pb-0 flex items-center justify-between gap-1.5">
                            <div className="flex items-center gap-1.5">
                                <span
                                    className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold flex items-center gap-1 ${
                                        isGen1
                                            ? 'bg-amber-500 text-white shadow-2xs'
                                            : 'bg-amber-100/80 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                    }`}
                                >
                                    {isGen1 && <Crown className="w-3 h-3 text-white fill-white" />}
                                    <span>Đời {member.generation}</span>
                                </span>
                                {orderText && (
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                                        ({orderText})
                                    </span>
                                )}
                            </div>

                            <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                    isDeceased
                                        ? 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700'
                                        : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                }`}
                            >
                                {isDeceased ? (
                                    <>
                                        <Sparkles className="w-2.5 h-2.5 text-stone-400" />
                                        <span>Tiền nhân</span>
                                    </>
                                ) : (
                                    <>
                                        <Heart className="w-2.5 h-2.5 fill-emerald-500/20 text-emerald-500" />
                                        <span>Sinh thời</span>
                                    </>
                                )}
                            </span>
                        </div>

                        {/* Card Center: Avatar & Info */}
                        <div className="p-3.5 space-y-2.5">
                            <div className="flex items-center gap-3">
                                {member.avatarUrl ? (
                                    <img
                                        src={member.avatarUrl}
                                        alt={member.fullName}
                                        className="w-12 h-12 rounded-2xl object-cover border-2 border-white dark:border-slate-800 shadow-xs shrink-0"
                                    />
                                ) : (
                                    <div
                                        className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base shadow-xs shrink-0 ${
                                            member.gender === Gender.FEMALE
                                                ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-300'
                                                : 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300'
                                        }`}
                                    >
                                        {member.fullName.charAt(0)}
                                    </div>
                                )}

                                <div className="min-w-0 flex-1">
                                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 truncate">
                                        {member.fullName}
                                    </h3>
                                    {member.tuName && (
                                        <p className="text-[11px] text-amber-700 dark:text-amber-400 italic truncate font-medium">
                                            Tự: {member.tuName}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span
                                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                                isMale
                                                    ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
                                                    : member.gender === Gender.FEMALE
                                                    ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                            }`}
                                        >
                                            {isMale ? 'Nam' : member.gender === Gender.FEMALE ? 'Nữ' : 'Chưa rõ'}
                                        </span>
                                        {member.isHeirless && (
                                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                                                Vô tự
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Additional Dates & Memorial */}
                            <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-100 dark:border-slate-800">
                                {yearsText && (
                                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                        <Calendar className="w-3 h-3 text-amber-500 shrink-0" />
                                        <span>{yearsText}</span>
                                    </div>
                                )}
                                {member.lunarDeathAnniversary?.displayText && (
                                    <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-medium">
                                        <Moon className="w-3 h-3 text-amber-500 shrink-0" />
                                        <span className="truncate">Giỗ: {member.lunarDeathAnniversary.displayText}</span>
                                    </div>
                                )}
                                {member.burialPlace && (
                                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                        <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                                        <span className="truncate">Mộ: {member.burialPlace}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Card Bottom: Action Buttons */}
                        <div className="px-3.5 py-2.5 bg-slate-50/80 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-1">
                            <button
                                onClick={() => onEdit(member)}
                                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-950/60 rounded-lg transition-colors cursor-pointer"
                                title="Chỉnh sửa thông tin"
                            >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Sửa</span>
                            </button>
                            <button
                                onClick={() => onDelete(member._id, member.fullName)}
                                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-colors cursor-pointer"
                                title="Xóa thành viên"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Xóa</span>
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
