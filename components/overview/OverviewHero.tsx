'use client';

import React from 'react';
import Link from 'next/link';
import { Network, Users, Plus, ShieldCheck, TreePine, ArrowRight } from 'lucide-react';
import { useMembers } from '@/context/MemberContext';

export default function OverviewHero() {
    const { members, maxGeneration, aliveCount, openAddModal, loading } = useMembers();

    return (
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-amber-600 via-amber-700 to-orange-800 text-white p-6 sm:p-8 shadow-xl shadow-amber-900/10">
            {/* Background decorative circles & watermark */}
            <div className="absolute -right-12 -top-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute right-6 -bottom-10 w-48 h-48 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />
            <TreePine className="absolute right-4 bottom-2 w-48 h-48 text-white/5 pointer-events-none stroke-1" />

            <div className="relative z-10 max-w-3xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-amber-100 text-xs font-semibold border border-white/20">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                    <span>Không gian Số hóa Phả hệ & Huyết thống ViTree</span>
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
                        Tổng Quan Gia Tộc & Dòng Họ
                    </h1>
                    <p className="text-amber-100/90 text-xs sm:text-sm leading-relaxed max-w-2xl">
                        Nơi lưu giữ ngọn nguồn gốc rễ, phả hệ truyền đời từ các bậc tiền nhân đến con cháu hậu duệ.
                        Theo dõi huyết thống, thống kê số liệu dòng tộc và kết nối mọi thế hệ.
                    </p>
                </div>

                {/* Quick Action Navigation Buttons */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                    <Link
                        href="/tree"
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-amber-800 font-bold text-xs shadow-md hover:bg-amber-50 active:scale-95 transition-all"
                    >
                        <Network className="w-4 h-4 text-amber-600" />
                        <span>Xem Sơ đồ Cây Phả hệ</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <Link
                        href="/members"
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-white font-semibold text-xs active:scale-95 transition-all"
                    >
                        <Users className="w-4 h-4 text-amber-200" />
                        <span>Danh sách Thành viên ({loading ? '...' : members.length})</span>
                    </Link>

                    <button
                        onClick={openAddModal}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/80 hover:bg-amber-500 border border-amber-300/40 text-white font-semibold text-xs active:scale-95 transition-all cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Thêm thành viên mới</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
