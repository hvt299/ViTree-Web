'use client';

import Image from 'next/image';
import { Handle, Position } from 'reactflow';
import { Gender, LifeStatus, Member } from '@/types/member';
import { User, CalendarDays, Skull, HeartPulse } from 'lucide-react';

interface Props {
    data: { member: Member; isMain?: boolean; isLastChild?: boolean; isSelected?: boolean };
}

function getOrderLabel(order: number, isLastChild?: boolean) {
    if (!order || order === 0) return '';
    if (order === 1) return 'Con trưởng';
    if (isLastChild) return 'Con út';
    if (order === 2) return 'Con thứ 2';
    if (order === 3) return 'Con thứ 3';
    return `Con thứ ${order}`;
}

export default function FamilyMemberNode({ data }: Props) {
    const { member, isMain, isLastChild, isSelected } = data;

    const isDeceased = member.status === LifeStatus.DECEASED;

    const baseColor = isDeceased
        ? 'border-gray-400 bg-gray-100/90 grayscale-[0.6] opacity-90'
        : member.gender === Gender.MALE
            ? 'border-blue-400 bg-blue-50'
            : member.gender === Gender.FEMALE
                ? 'border-pink-400 bg-pink-50'
                : 'border-slate-400 bg-slate-50';

    const borderStyle = isMain ? 'border-solid' : 'border-dashed opacity-90';
    
    const selectedStyle = isSelected ? 'ring-4 ring-orange-500 scale-105 z-50 shadow-2xl' : 'hover:scale-[1.02] shadow-xl hover:shadow-2xl';
    
    const genderStyle = `${baseColor} ${borderStyle} ${selectedStyle}`;

    const statusBadge = member.status === LifeStatus.ALIVE ? 'bg-green-100 text-green-700 border-green-200' : member.status === LifeStatus.DECEASED ? 'bg-gray-200 text-gray-700 border-gray-300' : 'bg-yellow-100 text-yellow-700 border-yellow-200';
    const roleBadge = member.orderInFamily === 1 ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-orange-100 text-orange-700 border-orange-200';
    const roleLabel = getOrderLabel(member.orderInFamily, isLastChild);
    const showOrder = isMain && member.generation > 1 && member.orderInFamily > 0;

    let relationLabel = null;
    if (!isMain) {
        if (member.gender === Gender.FEMALE) relationLabel = 'Dâu';
        else if (member.gender === Gender.MALE) relationLabel = 'Rể';
        else relationLabel = 'Phối ngẫu';
    }

    return (
        <div className={`w-100 rounded-3xl border-[3px] shadow-xl overflow-visible transition-all hover:shadow-2xl duration-300 ${genderStyle}`}>
            <Handle type="target" position={Position.Top} id="top" className="w-3 h-3 bg-blue-500 border-2 border-white" />
            <Handle type="source" position={Position.Bottom} id="bottom" className="w-3 h-3 bg-blue-500 border-2 border-white" />

            <Handle type="source" position={Position.Left} id="left-source" className="opacity-0" />
            <Handle type="target" position={Position.Left} id="left-target" className="opacity-0" />
            <Handle type="source" position={Position.Right} id="right-source" className="opacity-0" />
            <Handle type="target" position={Position.Right} id="right-target" className="opacity-0" />

            <div className="p-6 space-y-4">
                <div className="flex gap-4 items-center">
                    {/* AVATAR CHUYÊN NGHIỆP */}
                    <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-md bg-white shrink-0 flex items-center justify-center">
                        {member.avatarUrl ? (
                            <Image src={member.avatarUrl} alt={member.fullName} fill className="object-cover" />
                        ) : (
                            <User size={36} className={isDeceased ? 'text-gray-400' : 'text-slate-300'} />
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="text-2xl font-black text-gray-800 leading-snug wrap-break-word">{member.fullName}</div>
                        {member.tuName && <div className="text-sm font-medium italic text-gray-500 mt-1">Tự: {member.tuName}</div>}

                        <div className="mt-2 flex flex-wrap gap-2">
                            {isMain && <span className="px-3 py-1 rounded-full text-sm font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">Đời thứ {member.generation}</span>}
                            {showOrder && <span className={`px-3 py-1 rounded-full text-sm font-bold border ${roleBadge}`}>{roleLabel}</span>}
                            {relationLabel && <span className="px-3 py-1 rounded-full text-sm font-bold border bg-purple-100 text-purple-700 border-purple-200">{relationLabel}</span>}
                        </div>
                    </div>
                </div>

                <div className="text-base font-medium text-gray-700 space-y-2 bg-white/60 p-3 rounded-xl border border-white/40">
                    {member.birthDate && <div className="flex items-center gap-2"><CalendarDays size={16} className="text-gray-500" /><span>Sinh: {new Date(member.birthDate).getFullYear()}</span></div>}
                    {member.deathDate && <div className="flex items-center gap-2"><Skull size={16} className="text-gray-500" /><span>Mất: {new Date(member.deathDate).getFullYear()}</span></div>}
                    <div className="pt-1 flex items-center gap-2">
                        <HeartPulse size={16} className="text-gray-500" />
                        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-bold shadow-sm border ${statusBadge}`}>{member.status === LifeStatus.ALIVE ? 'Còn sống' : member.status === LifeStatus.DECEASED ? 'Đã mất' : 'Không rõ'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}