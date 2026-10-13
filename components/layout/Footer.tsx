import React from 'react';

export default function Footer() {
    return (
        <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 py-6 px-6 mt-auto text-center text-xs text-slate-500 dark:text-slate-400 transition-colors">
            <div className="max-w-7xl mx-auto space-y-1">
                <p>ViTree © 2026 • Hệ thống Quản lý Gia phả & Huyết thống Dòng họ</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    Gìn giữ cội nguồn • Phát huy truyền thống gia tộc • Kết nối các thế hệ
                </p>
            </div>
        </footer>
    );
}
