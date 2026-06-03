'use client';

export default function FamilyTreeLegend() {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <h3 className="font-semibold mb-3">
                Chú giải
            </h3>

            <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-[3px] bg-blue-500" />
                    <span>Quan hệ Cha</span>
                </div>

                <div className="flex items-center gap-2">
                    <div className="w-6 h-[3px] bg-pink-500" />
                    <span>Quan hệ Mẹ</span>
                </div>

                <div className="flex items-center gap-2">
                    <div className="w-6 h-[3px] border-t-2 border-dashed border-orange-500" />
                    <span>Hôn nhân</span>
                </div>
            </div>
        </div>
    );
}