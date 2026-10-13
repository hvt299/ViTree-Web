'use client';

import React from 'react';
import { Loader2, Edit3, Trash2, Heart, Sparkles } from 'lucide-react';
import { Member, Gender } from '@/types/member';

interface MemberTableProps {
    members: Member[];
    loading: boolean;
    startIndex: number;
    onEdit: (member: Member) => void;
    onDelete: (id: string, name: string) => void;
}

export default function MemberTable({
    members,
    loading,
    startIndex,
    onEdit,
    onDelete,
}: MemberTableProps) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-800 overflow-hidden transition-colors">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            <th className="p-4">STT</th>
                            <th className="p-4">Họ và tên</th>
                            <th className="p-4">Đời thứ</th>
                            <th className="p-4">Giới tính</th>
                            <th className="p-4">Tình trạng</th>
                            <th className="p-4 text-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="p-10 text-center">
                                    <Loader2 className="w-6 h-6 text-amber-500 animate-spin mx-auto" />
                                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                                        Đang tải dữ liệu gia phả...
                                    </p>
                                </td>
                            </tr>
                        ) : members.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-10 text-center text-slate-500 dark:text-slate-400">
                                    Không tìm thấy thành viên nào phù hợp với bộ lọc.
                                </td>
                            </tr>
                        ) : (
                            members.map((member, index) => (
                                <tr
                                    key={member._id}
                                    className="hover:bg-amber-50/40 dark:hover:bg-slate-800/40 transition-colors"
                                >
                                    <td className="p-4 text-slate-400 font-medium">
                                        {startIndex + index + 1}
                                    </td>
                                    <td className="p-4 font-semibold text-slate-900 dark:text-slate-100">
                                        <div className="flex items-center gap-3">
                                            {member.avatarUrl ? (
                                                <img
                                                    src={member.avatarUrl}
                                                    alt="avatar"
                                                    className="w-9 h-9 rounded-xl object-cover shadow-xs border border-white dark:border-slate-800"
                                                />
                                            ) : (
                                                <div
                                                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                                                        member.gender === Gender.FEMALE
                                                            ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300'
                                                            : 'bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-300'
                                                    }`}
                                                >
                                                    {member.fullName.charAt(0)}
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-slate-100">
                                                    {member.fullName}
                                                </p>
                                                {member.tuName && (
                                                    <p className="text-[11px] text-slate-400 italic">
                                                        Tự: {member.tuName}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-600 dark:text-slate-300 font-semibold">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-bold">
                                            Đời {member.generation}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span
                                            className={`inline-flex px-2.5 py-1 rounded-md font-semibold ${
                                                member.gender === 'MALE'
                                                    ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
                                                    : member.gender === 'FEMALE'
                                                    ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                            }`}
                                        >
                                            {member.gender === 'MALE' ? 'Nam' : member.gender === 'FEMALE' ? 'Nữ' : 'Chưa rõ'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span
                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold ${
                                                member.status === 'ALIVE'
                                                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                                    : member.status === 'DECEASED'
                                                    ? 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700'
                                                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                            }`}
                                        >
                                            {member.status === 'ALIVE' && (
                                                <Heart className="w-3 h-3 fill-emerald-500/20 text-emerald-500" />
                                            )}
                                            {member.status === 'DECEASED' && (
                                                <Sparkles className="w-3 h-3 text-stone-400" />
                                            )}
                                            {member.status === 'ALIVE' ? 'Còn sống' : member.status === 'DECEASED' ? 'Đã mất' : 'Chưa rõ'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <button
                                                onClick={() => onEdit(member)}
                                                className="p-1.5 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40 rounded-lg transition-colors cursor-pointer"
                                                title="Chỉnh sửa thông tin"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => onDelete(member._id, member.fullName)}
                                                className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                                                title="Xóa thành viên"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
