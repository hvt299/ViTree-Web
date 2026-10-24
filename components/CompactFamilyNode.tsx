'use client';

import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Member, Gender, LifeStatus } from '@/types/member';
import {
    Heart,
    Sparkles,
    Crown,
    ChevronDown,
    ChevronUp,
    Users,
} from 'lucide-react';

export interface CompactFamilyNodeData extends Record<string, unknown> {
    primaryMember: Member;
    spouses: Member[];
    childCount: number;
    isCollapsed: boolean;
    isSelected: boolean;
    kyThanDiff?: number | null; // Cửu tộc difference: -4 (Cao Tổ), -3, -2, -1, 0 (Kỷ Thân), 1, 2, 3, 4
    isKyThan?: boolean;
    onToggleCollapse?: (id: string) => void;
    onSelect?: (id: string) => void;
}

interface Props {
    data: CompactFamilyNodeData;
}

export function getOrderText(order?: number): string {
    if (!order || order === 0) return '';
    if (order === 1) return 'Trưởng';
    if (order === 2) return 'Thứ 2';
    if (order === 3) return 'Thứ 3';
    return `Thứ ${order}`;
}

export function getCuuTocTitle(diff?: number | null): string | null {
    if (diff === null || diff === undefined) return null;
    switch (diff) {
        case -4:
            return 'Cao Tổ (Kỵ nội)';
        case -3:
            return 'Tằng Tổ (Cụ nội)';
        case -2:
            return 'Tổ (Ông nội)';
        case -1:
            return 'Khảo (Cha)';
        case 0:
            return 'Kỷ Thân (Chính mình)';
        case 1:
            return 'Tử (Con)';
        case 2:
            return 'Tôn (Cháu)';
        case 3:
            return 'Tằng Tôn (Chắt)';
        case 4:
            return 'Huyền Tôn (Chút)';
        default:
            return null;
    }
}

export default function CompactFamilyNode({ data }: Props) {
    const {
        primaryMember,
        spouses = [],
        childCount = 0,
        isCollapsed = false,
        isSelected = false,
        kyThanDiff,
        isKyThan = false,
        onToggleCollapse,
        onSelect,
    } = data;

    const gen = primaryMember.generation || 1;
    const isRootGen = gen === 1;
    const isDeceased = primaryMember.status === LifeStatus.DECEASED;
    const isHeirless = primaryMember.isHeirless || false;
    const cuuTocTitle = getCuuTocTitle(kyThanDiff);
    const orderText = getOrderText(primaryMember.orderInFamily);

    // Format birth - death year
    const getYears = (m: Member) => {
        const b = m.birthDate ? m.birthDate.split('-')[0] : '';
        const d = m.deathDate ? m.deathDate.split('-')[0] : (m.status === LifeStatus.DECEASED ? '†' : '');
        if (b && d) return `${b} - ${d}`;
        if (b) return `s. ${b}`;
        if (d) return `m. ${d}`;
        return '';
    };

    const primaryYears = getYears(primaryMember);

    return (
        <div
            onClick={() => onSelect && onSelect(primaryMember._id)}
            className={`w-[280px] rounded-2xl border text-xs transition-all duration-200 cursor-pointer select-none overflow-hidden relative ${
                isSelected
                    ? 'border-orange-500 ring-4 ring-orange-500/25 shadow-xl scale-[1.02] z-20 bg-white dark:bg-slate-900'
                    : isRootGen
                    ? 'border-amber-400 dark:border-amber-600 shadow-md shadow-amber-500/10 ring-1 ring-amber-400/40 bg-linear-to-b from-amber-50/90 via-orange-50/30 to-white dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-900'
                    : 'border-amber-200/90 dark:border-amber-900/60 shadow-xs hover:border-amber-400 dark:hover:border-amber-700 hover:shadow-md bg-white dark:bg-slate-900'
            }`}
        >
            {/* Top Connector Handle */}
            <Handle
                type="target"
                position={Position.Top}
                className="w-3 h-3 bg-amber-600! border-2 border-white! dark:border-slate-900! rounded-full -top-1.5 shadow-xs"
            />

            {/* Header: Đời thứ, Thứ tự & Cửu Tộc */}
            <div
                className={`px-3 py-1.5 flex items-center justify-between border-b ${
                    isKyThan
                        ? 'bg-linear-to-r from-amber-600 via-orange-600 to-amber-700 text-white border-amber-600 font-bold'
                        : isRootGen
                        ? 'bg-linear-to-r from-amber-500/25 via-orange-500/25 to-amber-500/25 dark:from-amber-950/70 dark:to-orange-950/70 border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-200 font-bold'
                        : 'bg-amber-50/60 dark:bg-slate-800/60 border-amber-100 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
            >
                <div className="flex items-center gap-1.5">
                    {isRootGen && <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />}
                    <span className="font-extrabold text-[11px] tracking-wide">Đời {gen}</span>
                    {orderText && (
                        <span className="text-[10px] opacity-80 font-medium">({orderText})</span>
                    )}
                </div>

                {/* Chức danh Cửu tộc nếu có */}
                {cuuTocTitle && (
                    <span
                        className={`text-[10px] px-2 py-0.5 rounded-md font-bold whitespace-nowrap shadow-2xs ${
                            isKyThan
                                ? 'bg-white text-amber-700'
                                : 'bg-amber-100/90 dark:bg-amber-950/90 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                        }`}
                        title={cuuTocTitle}
                    >
                        {cuuTocTitle}
                    </span>
                )}
            </div>

            {/* Content: Thành viên chính + Phối ngẫu + Vô tự */}
            <div className="p-3 space-y-2 text-[11px] leading-snug">
                {/* Dòng 1: Thành viên chính */}
                <div className="flex items-start justify-between gap-1.5">
                    <div className="flex items-start gap-1.5 min-w-0">
                        <div className="mt-0.5 shrink-0">
                            {isDeceased ? (
                                <span title="Đã mất"><Sparkles className="w-3.5 h-3.5 text-stone-400" /></span>
                            ) : (
                                <span title="Sinh thời"><Heart className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/20" /></span>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center flex-wrap gap-1">
                                <span className="font-extrabold text-slate-900 dark:text-slate-100 text-[13px] tracking-tight break-words">
                                    {primaryMember.fullName}
                                </span>
                                {primaryMember.gender && (
                                    <span
                                        className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                            primaryMember.gender === Gender.MALE
                                                ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
                                                : primaryMember.gender === Gender.FEMALE
                                                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                                                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                                        }`}
                                    >
                                        {primaryMember.gender === Gender.MALE ? 'Nam' : primaryMember.gender === Gender.FEMALE ? 'Nữ' : ''}
                                    </span>
                                )}
                            </div>
                            {primaryMember.tuName && (
                                <span className="text-amber-700 dark:text-amber-400 italic text-[11px] block mt-0.5 font-medium">
                                    (Tự: {primaryMember.tuName})
                                </span>
                            )}
                            {primaryYears && (
                                <span className="text-slate-400 dark:text-slate-500 text-[10px] block mt-0.5">
                                    {primaryYears}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Vô tự seal badge */}
                    {isHeirless && (
                        <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 shadow-2xs">
                            (Vô tự)
                        </span>
                    )}
                </div>

                {/* Các dòng phối ngẫu (Vợ / Chồng) */}
                {spouses.length > 0 && (
                    <div className="pt-1.5 border-t border-amber-100/80 dark:border-slate-800/80 space-y-1">
                        {spouses.length >= 2 ? (
                            spouses.map((s, idx) => {
                                const roleName = idx === 0 ? 'Chánh thất' : idx === 1 ? 'Thứ thất' : `Kế thất ${idx}`;
                                const sYears = getYears(s);
                                return (
                                    <div key={s._id} className="flex items-start justify-between gap-1 text-[11px] leading-snug">
                                        <span className="text-amber-800 dark:text-amber-300 font-bold shrink-0">
                                            {roleName}:
                                        </span>
                                        <span className="text-slate-800 dark:text-slate-200 font-semibold break-words flex-1 text-right">
                                            {s.fullName}
                                            {sYears && <span className="text-slate-400 text-[10px] ml-1 font-normal inline-block">({sYears})</span>}
                                        </span>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex items-start justify-between gap-1 text-[11px] leading-snug">
                                <span className="text-amber-800 dark:text-amber-300 font-bold shrink-0">
                                    {primaryMember.gender === Gender.FEMALE ? 'Chồng:' : 'Vợ:'}
                                </span>
                                <span className="text-slate-800 dark:text-slate-200 font-semibold break-words flex-1 text-right">
                                    {spouses[0].fullName}
                                    {getYears(spouses[0]) && (
                                        <span className="text-slate-400 text-[10px] ml-1 font-normal inline-block">
                                            ({getYears(spouses[0])})
                                        </span>
                                    )}
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer: Nút thu gọn / mở rộng chi con nếu có con */}
            {childCount > 0 && (
                <div className="px-3 py-1 bg-amber-50/40 dark:bg-slate-800/40 border-t border-amber-100/60 dark:border-slate-800/80 flex items-center justify-between text-[10px]">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">
                        {childCount} người con
                    </span>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onToggleCollapse) onToggleCollapse(primaryMember._id);
                        }}
                        className={`flex items-center gap-0.5 px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
                            isCollapsed
                                ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 hover:bg-amber-200 border border-amber-300 dark:border-amber-800'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 border border-slate-200 dark:border-slate-600'
                        }`}
                        title={isCollapsed ? 'Mở rộng chi con' : 'Thu gọn chi con'}
                    >
                        {isCollapsed ? (
                            <>
                                <span>Mở rộng</span>
                                <ChevronDown className="w-3 h-3" />
                            </>
                        ) : (
                            <>
                                <span>Thu gọn</span>
                                <ChevronUp className="w-3 h-3" />
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Bottom Connector Handle */}
            <Handle
                type="source"
                position={Position.Bottom}
                className="w-3 h-3 bg-amber-600! border-2 border-white! dark:border-slate-900! rounded-full -bottom-1.5 shadow-xs"
            />
        </div>
    );
}
