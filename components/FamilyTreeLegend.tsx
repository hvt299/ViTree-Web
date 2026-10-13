'use client';

import React from 'react';
import {
    Info,
    GitBranch,
    Heart,
    Sparkles,
    Crown,
    Layers,
    UserMinus,
    Compass,
} from 'lucide-react';

export default function FamilyTreeLegend() {
    return (
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-amber-200/80 dark:border-slate-800 p-4 shadow-sm w-full transition-colors text-xs">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-amber-100 dark:border-slate-800">
                <Info className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">
                    Chú giải quy ước sơ đồ phả hệ (Gia đình 1 Node)
                </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Cột 1: Cấu trúc 1 Node Gia đình */}
                <div className="space-y-2">
                    <p className="font-bold text-amber-900 dark:text-amber-300 text-[11px] uppercase tracking-wide">
                        1. Cụm Gia đình 1 Node
                    </p>
                    <div className="text-slate-600 dark:text-slate-300 space-y-1.5 leading-relaxed text-[11px]">
                        <p>• <strong>Dòng 1:</strong> Thành viên trực hệ dòng họ (kèm Tên tự, năm sinh/mất).</p>
                        <p>• <strong>Dòng phối ngẫu:</strong> Ghi rõ Chánh thất, Thứ thất hoặc Vợ/Chồng.</p>
                        <div className="flex items-center gap-1.5 pt-0.5">
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-300">
                                (Vô tự)
                            </span>
                            <span>Chi không có con cháu nối dõi.</span>
                        </div>
                    </div>
                </div>

                {/* Cột 2: Giới tính & Tình trạng sinh tử */}
                <div className="space-y-2">
                    <p className="font-bold text-amber-900 dark:text-amber-300 text-[11px] uppercase tracking-wide">
                        2. Giới tính & Tình trạng
                    </p>
                    <div className="space-y-1.5 text-slate-600 dark:text-slate-300 text-[11px]">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                                Nam
                            </span>
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                                Nữ
                            </span>
                            <span className="text-[10px] text-slate-400 italic">
                                (chỉ con cái trực hệ, không tính dâu/rể)
                            </span>
                        </div>
                        <div className="flex items-center gap-2 pt-0.5">
                            <Heart className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/20 shrink-0" />
                            <span><strong>Sinh thời:</strong> Thành viên hiện còn sống.</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                            <span><strong>Tiền nhân:</strong> Bậc tiền bối đã quy tiên (†).</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                            <span><strong>Cụ Thủy Tổ:</strong> Khai sinh dòng họ (Đời 1).</span>
                        </div>
                    </div>
                </div>

                {/* Cột 3: Thế hệ & Cửu tộc */}
                <div className="space-y-2">
                    <p className="font-bold text-amber-900 dark:text-amber-300 text-[11px] uppercase tracking-wide">
                        3. Đời & Thứ bậc Cửu Tộc
                    </p>
                    <div className="space-y-1.5 text-slate-600 dark:text-slate-300 text-[11px]">
                        <div className="flex items-center gap-1.5">
                            <span className="font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px]">
                                Đời 1, 2, 3...
                            </span>
                            <span>Số thứ tự thế hệ theo lối mới.</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Compass className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span><strong>Cửu Tộc:</strong> Cao Tổ, Tằng Tổ, Tổ, Khảo, Kỷ Thân, Tử, Tôn, Tằng Tôn, Huyền Tôn.</span>
                        </div>
                    </div>
                </div>

                {/* Cột 4: Đường nối & Vùng thế hệ */}
                <div className="space-y-2">
                    <p className="font-bold text-amber-900 dark:text-amber-300 text-[11px] uppercase tracking-wide">
                        4. Dây Huyết thống & Dải Đời
                    </p>
                    <div className="space-y-2 text-slate-600 dark:text-slate-300 text-[11px]">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-0.5 bg-orange-600 rounded-full shrink-0" />
                            <span>Dây truyền thừa nối vuông góc từ cha mẹ xuống con.</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Layers className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>Dải màu nền nằm ngang xen kẽ phân định ranh giới giữa các đời.</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}