'use client';

import Image from 'next/image';
import { Handle, Position } from '@xyflow/react';
import { Gender, LifeStatus, Member } from '@/types/member';
import {
    User,
    UserMinus,
    Heart,
    Sparkles,
    ChevronDown,
    ChevronUp,
    Crown,
} from 'lucide-react';

interface Props {
    data: {
        member: Member;
        isMain?: boolean;
        isLastChild?: boolean;
        isSelected?: boolean;
        hasChildren?: boolean;
        isCollapsed?: boolean;
        childCount?: number;
        descendantCount?: number;
        width?: number;
        height?: number;
        roleLabel?: string;
        relationLabel?: string | null;
        onToggleCollapse?: (memberId: string) => void;
    };
}

function getOrderLabel(order: number, isLastChild?: boolean) {
    if (!order || order === 0) return '';
    if (order === 1) return 'Trưởng';
    if (isLastChild) return 'Út';
    if (order === 2) return 'Thứ 2';
    if (order === 3) return 'Thứ 3';
    return `Thứ ${order}`;
}

export default function FamilyMemberNode({ data }: Props) {
    const {
        member,
        isMain,
        isLastChild,
        isSelected,
        hasChildren,
        isCollapsed,
        childCount = 0,
        descendantCount = 0,
        width = 115,
        height = 155,
        onToggleCollapse,
    } = data;

    const gen = member.generation || 1;
    const isDeceased = member.status === LifeStatus.DECEASED;
    const isMale = member.gender === Gender.MALE;
    const isFemale = member.gender === Gender.FEMALE;

    // Generation 1 royal ancestral styling
    const isRootGen = gen === 1;

    // Vertical card theme
    let cardTheme = '';
    if (isRootGen) {
        cardTheme = 'bg-linear-to-b from-amber-50 to-orange-50/80 dark:from-amber-950/70 dark:to-orange-950/70 border-amber-500 shadow-md ring-1 ring-amber-400/50';
    } else if (isDeceased) {
        cardTheme = 'bg-stone-50/95 dark:bg-stone-900/95 border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200';
    } else if (isMale) {
        cardTheme = 'bg-sky-50/95 dark:bg-sky-950/80 border-sky-300 dark:border-sky-800 text-slate-800 dark:text-slate-100';
    } else if (isFemale) {
        cardTheme = 'bg-rose-50/95 dark:bg-rose-950/80 border-rose-300 dark:border-rose-800 text-slate-800 dark:text-slate-100';
    } else {
        cardTheme = 'bg-slate-50/95 dark:bg-slate-900/95 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100';
    }

    const borderStyle = isMain ? 'border-2' : 'border-2 border-dashed';

    const selectedStyle = isSelected
        ? 'ring-3 ring-amber-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-950 scale-[1.03] shadow-lg z-20'
        : 'hover:shadow-md hover:scale-[1.01] shadow-2xs';

    // In-law relation
    let relationLabel: string | null = null;
    if (!isMain) {
        if (data.relationLabel !== undefined) {
            relationLabel = data.relationLabel;
        } else if (member.gender === Gender.FEMALE) {
            relationLabel = 'Dâu';
        } else if (member.gender === Gender.MALE) {
            relationLabel = 'Rể';
        } else {
            relationLabel = 'Phối ngẫu';
        }
    }

    const roleLabel = data.roleLabel || getOrderLabel(member.orderInFamily, isLastChild);
    const showOrder = isMain && member.generation > 1 && member.orderInFamily > 0;

    const birthYear = member.birthDate ? new Date(member.birthDate).getFullYear() : null;
    const deathYear = member.deathDate ? new Date(member.deathDate).getFullYear() : null;

    // Avatar sizing based on generational hierarchy
    const avatarPx = gen <= 1 ? 44 : gen === 2 ? 38 : gen === 3 ? 32 : 28;

    return (
        <div
            style={{ width, height }}
            className={`rounded-2xl transition-all duration-150 relative select-none cursor-pointer flex flex-col justify-between items-center p-2 text-center overflow-visible print:border-black print:bg-white print:text-black ${cardTheme} ${borderStyle} ${selectedStyle}`}
        >
            {/* Top connection handle for bloodline incoming */}
            <Handle
                type="target"
                position={Position.Top}
                id="top"
                className="w-2.5 h-2.5 bg-amber-500 border-2 border-white dark:border-slate-900 rounded-full"
            />
            {/* Bottom connection handle for bloodline outgoing */}
            <Handle
                type="source"
                position={Position.Bottom}
                id="bottom"
                className="w-2.5 h-2.5 bg-amber-500 border-2 border-white dark:border-slate-900 rounded-full"
            />

            {/* Marriage lateral handles */}
            <Handle type="source" position={Position.Left} id="left-source" className="opacity-0 pointer-events-none" />
            <Handle type="target" position={Position.Left} id="left-target" className="opacity-0 pointer-events-none" />
            <Handle type="source" position={Position.Right} id="right-source" className="opacity-0 pointer-events-none" />
            <Handle type="target" position={Position.Right} id="right-target" className="opacity-0 pointer-events-none" />

            {/* Top: Generational Badge */}
            <div className="w-full flex items-center justify-between gap-1 leading-none pt-0.5">
                <span className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] font-black ${
                    isRootGen && isMain
                        ? 'bg-amber-500 text-white shadow-2xs'
                        : 'bg-amber-100/80 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300'
                }`}>
                    <Crown className="w-2.5 h-2.5" />
                    <span>{isRootGen && isMain ? 'TIỀN TỔ' : `Đời ${gen}`}</span>
                </span>

                <div className="flex items-center gap-0.5">
                    {showOrder && (
                        <span className="text-[8px] font-semibold bg-white/80 dark:bg-slate-800 px-1 py-0.2 rounded text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {roleLabel}
                        </span>
                    )}
                    {relationLabel && (
                        <span className="text-[8px] font-semibold bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 px-1 py-0.2 rounded">
                            {relationLabel}
                        </span>
                    )}
                    {member.isHeirless && (
                        <span className="text-[8px] font-semibold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 px-0.5 py-0.2 rounded">
                            <UserMinus className="w-2 h-2 inline" />
                        </span>
                    )}
                </div>
            </div>

            {/* Middle: Portrait Avatar */}
            <div
                style={{ width: avatarPx, height: avatarPx }}
                className="relative rounded-xl overflow-hidden border border-white dark:border-slate-800 shadow-2xs bg-white dark:bg-slate-800 shrink-0 flex items-center justify-center my-0.5"
            >
                {member.avatarUrl ? (
                    <Image
                        src={member.avatarUrl}
                        alt={member.fullName}
                        fill
                        className={`object-cover ${isDeceased ? 'grayscale-[0.5]' : ''}`}
                    />
                ) : (
                    <div
                        className={`w-full h-full flex items-center justify-center font-bold text-[11px] ${
                            isDeceased
                                ? 'bg-stone-100 dark:bg-stone-800 text-stone-500'
                                : isMale
                                ? 'bg-sky-100 dark:bg-sky-900/60 text-sky-600 dark:text-sky-300'
                                : 'bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300'
                        }`}
                    >
                        {member.fullName ? member.fullName.charAt(0).toUpperCase() : <User size={14} />}
                    </div>
                )}
                {/* Status Dot */}
                <div
                    className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white dark:border-slate-900 ${
                        isDeceased
                            ? 'bg-stone-400'
                            : member.status === LifeStatus.ALIVE
                            ? 'bg-emerald-500'
                            : 'bg-amber-400'
                    }`}
                />
            </div>

            {/* Name (Vertical Layout: bold, readable, centered) */}
            <div className="w-full px-0.5 leading-tight">
                <p className="text-[11px] font-bold text-slate-900 dark:text-slate-100 line-clamp-2">
                    {member.fullName}
                </p>
                <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                    {birthYear || deathYear ? (
                        <span>
                            {birthYear || '?'} - {isDeceased ? (deathYear || 'mất') : 'nay'}
                        </span>
                    ) : isDeceased ? (
                        'Đã mất'
                    ) : (
                        'Sinh thời'
                    )}
                </p>
            </div>

            {/* Bottom: Subtree Collapse Pill OR Status Badge */}
            <div className="w-full flex justify-center items-center pt-0.5 border-t border-black/5 dark:border-white/5">
                {hasChildren && onToggleCollapse ? (
                    <button
                        type="button"
                        onClick={e => {
                            e.stopPropagation();
                            onToggleCollapse(member._id);
                        }}
                        className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-bold transition-all shadow-2xs ${
                            isCollapsed
                                ? 'bg-amber-500 hover:bg-amber-600 text-white animate-pulse-subtle'
                                : 'bg-slate-200/90 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                        title={isCollapsed ? 'Mở rộng nhánh hậu duệ' : 'Thu gọn nhánh hậu duệ'}
                    >
                        {isCollapsed ? (
                            <>
                                <ChevronDown className="w-2 h-2" />
                                <span>+{descendantCount || childCount}</span>
                            </>
                        ) : (
                            <>
                                <ChevronUp className="w-2 h-2" />
                                <span>Thu</span>
                            </>
                        )}
                    </button>
                ) : (
                    <div className="text-[8px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-0.5">
                        {isDeceased ? (
                            <span className="flex items-center gap-0.5 text-stone-500">
                                <Sparkles className="w-2 h-2 text-stone-400" /> Quy tiên
                            </span>
                        ) : member.status === LifeStatus.ALIVE ? (
                            <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
                                <Heart className="w-2 h-2 fill-emerald-500/20 text-emerald-500" /> Sinh thời
                            </span>
                        ) : (
                            <span>Chưa rõ</span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}