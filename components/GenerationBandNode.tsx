'use client';

import React from 'react';
import { Crown } from 'lucide-react';

export interface GenerationBandData extends Record<string, unknown> {
    generation: number;
    width: number;
    height: number;
    isEven: boolean;
}

interface Props {
    data: GenerationBandData;
}

export default function GenerationBandNode({ data }: Props) {
    const { generation, width = 2000, height = 175, isEven = false } = data;

    const isRoot = generation === 1;

    let genTitle = `ĐỜI THỨ ${generation}`;
    if (generation === 1) genTitle = 'ĐỜI I • CỤ KHỞI TỔ';
    else if (generation === 2) genTitle = 'ĐỜI II • BẬC TIỀN BỐI';
    else if (generation === 3) genTitle = 'ĐỜI III • TRỰC HỆ';

    return (
        <div
            style={{ width: `${width}px`, height: `${height}px` }}
            className={`pointer-events-none select-none relative transition-colors ${
                isEven
                    ? 'bg-amber-950/[0.02] dark:bg-amber-400/[0.015] border-y border-amber-900/[0.04] dark:border-amber-400/[0.03]'
                    : 'bg-white/30 dark:bg-transparent'
            }`}
        >
            {/* Generation Tag Ribbon on the left */}
            <div className="absolute left-6 top-3 flex items-center gap-2 pointer-events-none opacity-80">
                <div
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-xs border ${
                        isRoot
                            ? 'bg-linear-to-r from-amber-600 to-orange-600 text-white border-amber-500/50'
                            : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs text-amber-900/80 dark:text-amber-300/80 border-amber-200/60 dark:border-amber-800/50'
                    }`}
                >
                    {isRoot && <Crown className="w-3 h-3 text-amber-200 fill-amber-200" />}
                    <span>{genTitle}</span>
                </div>
                {/* Delicate horizontal guide line */}
                <div className="w-24 h-px bg-linear-to-r from-amber-400/30 dark:from-amber-600/30 to-transparent" />
            </div>
        </div>
    );
}
