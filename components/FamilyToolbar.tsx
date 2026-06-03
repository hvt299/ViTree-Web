'use client';

import { useState } from 'react';

interface Props {
    onSearch: (value: string) => void;
    onFullscreen: () => void;
    onExportPNG: () => void;
    onExportPDF: () => void;
    onClearFocus: () => void;
    hasFocus?: boolean;
}

export default function FamilyToolbar({
    onSearch,
    onFullscreen,
    onExportPNG,
    onExportPDF,
    onClearFocus,
    hasFocus,
}: Props) {
    const [value, setValue] = useState('');

    return (
        <div className="flex flex-wrap items-center gap-2 p-2 bg-white rounded-xl border shadow-sm">

            {/* SEARCH */}
            <input
                value={value}
                onChange={(e) => {
                    setValue(e.target.value);
                    onSearch(e.target.value);
                }}
                placeholder="🔍 Tìm thành viên..."
                className="
                    px-3 py-2
                    border
                    rounded-lg
                    text-sm
                    w-64
                    focus:outline-none
                    focus:ring-2
                    focus:ring-amber-300
                "
            />

            {/* FULLSCREEN */}
            <button
                onClick={onFullscreen}
                className="px-3 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 transition"
            >
                ⛶ Fullscreen
            </button>

            {/* EXPORT PNG */}
            <button
                onClick={onExportPNG}
                className="px-3 py-2 text-sm rounded-lg bg-blue-100 hover:bg-blue-200 transition"
            >
                🖼 PNG
            </button>

            {/* EXPORT PDF */}
            <button
                onClick={onExportPDF}
                className="px-3 py-2 text-sm rounded-lg bg-red-100 hover:bg-red-200 transition"
            >
                📄 PDF
            </button>

            {/* CLEAR FOCUS */}
            {hasFocus && (
                <button
                    onClick={onClearFocus}
                    className="px-3 py-2 text-sm rounded-lg bg-yellow-100 hover:bg-yellow-200 transition"
                >
                    ❌ Clear focus
                </button>
            )}
        </div>
    );
}