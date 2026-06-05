'use client';

export default function FamilyTreeLegend() {
    return (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200 p-4 shadow-sm w-full lg:w-fit">
            <h3 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wider">
                📌 Chú giải Sơ đồ phả hệ
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3 text-sm">

                {/* Cột 1: Các loại dây */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-0.75 bg-slate-400 rounded-full" />
                        <span className="text-gray-600 font-medium">Đường Huyết thống</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-0.75 border-t-[3px] border-dashed border-orange-400" />
                        <span className="text-gray-600 font-medium">Đường Hôn nhân</span>
                    </div>
                </div>

                {/* Cột 2: Loại Node */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-4 border-[3px] border-gray-400 rounded-md bg-gray-50" />
                        <span className="text-gray-600 font-medium">Máu mủ trong họ</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-4 border-[3px] border-dashed border-gray-400 rounded-md bg-gray-50 opacity-70" />
                        <span className="text-gray-600 font-medium">Ngoại tộc (Dâu/Rể)</span>
                    </div>
                </div>

                {/* Cột 3: Tình trạng */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                            <div className="w-5 h-4 rounded-md bg-blue-100 border-2 border-blue-400" />
                            <div className="w-5 h-4 rounded-md bg-pink-100 border-2 border-pink-400" />
                        </div>
                        <span className="text-gray-600 font-medium">Còn sống</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-4 rounded-md bg-gray-200 border-2 border-gray-400 grayscale" />
                        <span className="text-gray-600 font-medium">Đã khuất</span>
                    </div>
                </div>
            </div>
        </div>
    );
}