'use client';

import { useState, useEffect } from 'react';
import { X, UploadCloud, Loader2 } from 'lucide-react';
import { memberService } from '@/services/memberService';
import { uploadService } from '@/services/uploadService';
import { Member, Gender, LifeStatus } from '@/types/member';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    members: Member[];
    editData?: Member | null;
}

export default function MemberModal({ isOpen, onClose, onSuccess, members, editData }: Props) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);

    const getParentId = (parent: any) => {
        if (!parent) return '';
        if (typeof parent === 'object') return parent._id || parent.id || '';
        return parent;
    };

    const getParentIds = (parents: any[] | undefined) => {
        if (!parents || !Array.isArray(parents)) return [];
        return parents.map(p => getParentId(p));
    };

    const [formData, setFormData] = useState({
        fullName: '',
        tuName: '',
        gender: Gender.MALE,
        status: LifeStatus.ALIVE,
        isHeirless: false,
        birthDate: '',
        deathDate: '',
        burialPlace: '',
        shortNote: '',
        generation: 1,
        orderInFamily: 1,
        branchId: '',
        fatherIds: [] as string[],
        motherIds: [] as string[],
        spouseIds: [] as string[],
        lunarDay: '',
        lunarMonth: '',
        lunarIsLeap: false,
        lunarText: ''
    });

    useEffect(() => {
        if (isOpen && editData) {
            setFormData({
                fullName: editData.fullName || '',
                tuName: editData.tuName || '',
                gender: editData.gender || Gender.MALE,
                status: editData.status || LifeStatus.ALIVE,
                isHeirless: editData.isHeirless || false,
                birthDate: editData.birthDate ? editData.birthDate.split('T')[0] : '',
                deathDate: editData.deathDate ? editData.deathDate.split('T')[0] : '',
                burialPlace: editData.burialPlace || '',
                shortNote: editData.shortNote || '',
                generation: editData.generation || 1,
                orderInFamily: editData.orderInFamily || 1,
                branchId: editData.branchId || '',
                fatherIds: getParentIds(editData.fatherIds),
                motherIds: getParentIds(editData.motherIds),
                spouseIds: getParentIds(editData.spouseIds),
                lunarDay: editData.lunarDeathAnniversary?.day?.toString() || '',
                lunarMonth: editData.lunarDeathAnniversary?.month?.toString() || '',
                lunarIsLeap: editData.lunarDeathAnniversary?.isLeapMonth || false,
                lunarText: editData.lunarDeathAnniversary?.displayText || '',
            });
            setAvatarFile(null);
        } else if (isOpen && !editData) {
            setFormData({
                fullName: '', tuName: '', gender: Gender.MALE, status: LifeStatus.ALIVE,
                isHeirless: false, birthDate: '', deathDate: '', burialPlace: '',
                shortNote: '', generation: 1, orderInFamily: 1, branchId: '',
                fatherIds: [], motherIds: [], spouseIds: [],
                lunarDay: '', lunarMonth: '', lunarIsLeap: false, lunarText: ''
            });
            setAvatarFile(null);
        }
    }, [isOpen, editData]);

    if (!isOpen) return null;

    const handleMultiSelect = (e: React.ChangeEvent<HTMLSelectElement>, field: 'fatherIds' | 'motherIds' | 'spouseIds') => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
        setFormData(prev => ({ ...prev, [field]: selectedOptions }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let avatarUrl = undefined;
            if (avatarFile) {
                avatarUrl = await uploadService.uploadImage(avatarFile);
            }

            const payload: any = {
                fullName: formData.fullName,
                tuName: formData.tuName,
                gender: formData.gender,
                status: formData.status,
                isHeirless: formData.isHeirless,
                generation: Number(formData.generation),
                orderInFamily: Number(formData.orderInFamily),
                branchId: formData.branchId,
                shortNote: formData.shortNote,
                burialPlace: formData.burialPlace,

                fatherIds: formData.fatherIds,
                motherIds: formData.motherIds,
                spouseIds: formData.spouseIds,
            };

            if (avatarUrl) payload.avatarUrl = avatarUrl;
            if (formData.birthDate) payload.birthDate = formData.birthDate;
            if (formData.deathDate) payload.deathDate = formData.deathDate;

            if (formData.status === LifeStatus.DECEASED && (formData.lunarDay || formData.lunarText)) {
                payload.lunarDeathAnniversary = {
                    day: formData.lunarDay ? Number(formData.lunarDay) : undefined,
                    month: formData.lunarMonth ? Number(formData.lunarMonth) : undefined,
                    isLeapMonth: formData.lunarIsLeap,
                    displayText: formData.lunarText
                };
            }

            if (editData) {
                await memberService.update(editData._id, payload);
            } else {
                await memberService.create(payload);
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Có lỗi xảy ra!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">
                        {editData ? 'Cập Nhật Thông Tin' : 'Thêm Thành Viên Mới'}
                    </h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8">
                    {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">{error}</div>}

                    {/* KHỐI 1: THÔNG TIN CÁ NHÂN */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">I. Thông Tin Cá Nhân</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-3 flex flex-col items-center p-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer">
                                <UploadCloud className="w-8 h-8 text-orange-500 mb-2" />
                                <label className="text-sm font-medium text-orange-600 cursor-pointer hover:underline">
                                    {editData?.avatarUrl ? 'Thay đổi ảnh đại diện' : 'Tải ảnh đại diện lên'}
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
                                </label>
                                {avatarFile && <p className="text-xs text-gray-500 mt-2">{avatarFile.name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Họ và tên *</label>
                                <input required type="text" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Tên Tự (Nếu có)</label>
                                <input type="text" value={formData.tuName} onChange={e => setFormData({ ...formData, tuName: e.target.value })} placeholder="VD: Tử Đằng" className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Giới tính</label>
                                <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value as Gender })} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none">
                                    <option value={Gender.MALE}>Nam</option>
                                    <option value={Gender.FEMALE}>Nữ</option>
                                    <option value={Gender.UNKNOWN}>Chưa rõ</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Đời thứ (Thế hệ) *</label>
                                <input required type="number" min="1" value={formData.generation} onChange={e => setFormData({ ...formData, generation: Number(e.target.value) })} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Thứ bậc trong nhà</label>
                                <input type="number" min="1" value={formData.orderInFamily} onChange={e => setFormData({ ...formData, orderInFamily: Number(e.target.value) })} placeholder="1: Trưởng, 2: Thứ..." className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Chi / Ngành</label>
                                <input type="text" value={formData.branchId} onChange={e => setFormData({ ...formData, branchId: e.target.value })} placeholder="VD: Chi Trưởng" className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Ngày sinh (Dương lịch)</label>
                                <input type="date" value={formData.birthDate} onChange={e => setFormData({ ...formData, birthDate: e.target.value })} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
                            </div>

                            <div className="md:col-span-2 pt-8">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                    <input type="checkbox" checked={formData.isHeirless} onChange={e => setFormData({ ...formData, isHeirless: e.target.checked })} className="w-4 h-4 text-orange-600 rounded" />
                                    Vô Tự (Không có con nối dõi)
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* KHỐI 2: TÌNH TRẠNG SỰ SỐNG & NGÀY GIỖ */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">II. Tình Trạng & Trực Yết</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-1">Tình trạng</label>
                                <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as LifeStatus })} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none">
                                    <option value={LifeStatus.ALIVE}>Còn sống</option>
                                    <option value={LifeStatus.DECEASED}>Đã mất</option>
                                    <option value={LifeStatus.UNKNOWN}>Không rõ (Mất tích)</option>
                                </select>
                            </div>

                            {formData.status === LifeStatus.DECEASED && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Ngày mất (Dương lịch)</label>
                                        <input type="date" value={formData.deathDate} onChange={e => setFormData({ ...formData, deathDate: e.target.value })} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Nơi an táng</label>
                                        <input type="text" value={formData.burialPlace} onChange={e => setFormData({ ...formData, burialPlace: e.target.value })} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
                                    </div>

                                    {/* Sub-form Ngày Âm Lịch */}
                                    <div className="md:col-span-3 bg-orange-50 p-4 rounded-xl border border-orange-100 grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="md:col-span-4"><p className="text-sm font-semibold text-orange-800">Thông tin Ngày Giỗ (Âm Lịch)</p></div>
                                        <div>
                                            <label className="block text-xs font-medium mb-1 text-gray-600">Ngày</label>
                                            <input type="number" min="1" max="30" value={formData.lunarDay} onChange={e => setFormData({ ...formData, lunarDay: e.target.value })} placeholder="VD: 15" className="w-full p-2 border rounded-lg outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium mb-1 text-gray-600">Tháng</label>
                                            <input type="number" min="1" max="12" value={formData.lunarMonth} onChange={e => setFormData({ ...formData, lunarMonth: e.target.value })} placeholder="VD: 7" className="w-full p-2 border rounded-lg outline-none" />
                                        </div>
                                        <div className="flex items-end pb-2">
                                            <label className="flex items-center gap-2 text-xs font-medium text-gray-700">
                                                <input type="checkbox" checked={formData.lunarIsLeap} onChange={e => setFormData({ ...formData, lunarIsLeap: e.target.checked })} className="w-4 h-4 text-orange-600 rounded" />
                                                Tháng Nhuận
                                            </label>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-medium mb-1 text-gray-600">Ghi chú hiển thị (Ưu tiên hiển thị dòng này)</label>
                                            <input type="text" value={formData.lunarText} onChange={e => setFormData({ ...formData, lunarText: e.target.value })} placeholder="VD: Rằm tháng Bảy, Mùng 10..." className="w-full p-2 border rounded-lg outline-none" />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* KHỐI 3: QUAN HỆ GIA ĐÌNH */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">III. Quan Hệ Huyết Thống & Hôn Nhân</h3>
                        <p className="text-xs text-gray-500 mb-4">* Nhấn giữ Ctrl (hoặc Cmd) để chọn nhiều Mẹ hoặc nhiều Vợ/Chồng.</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-1">Cha (Có thể chọn nhiều)</label>
                                <select multiple size={3} value={formData.fatherIds} onChange={e => handleMultiSelect(e, 'fatherIds')} className="w-full p-2.5 border rounded-lg outline-none bg-gray-50">
                                    {members.filter(m => m.gender === Gender.MALE && m._id !== editData?._id).map(m => (
                                        <option key={m._id} value={m._id}>{m.fullName} (Đời {m.generation})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Mẹ (Có thể chọn nhiều)</label>
                                <select multiple size={3} value={formData.motherIds} onChange={e => handleMultiSelect(e, 'motherIds')} className="w-full p-2.5 border rounded-lg outline-none bg-gray-50">
                                    {members.filter(m => m.gender === Gender.FEMALE && m._id !== editData?._id).map(m => (
                                        <option key={m._id} value={m._id}>{m.fullName} (Đời {m.generation})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Vợ / Chồng (Có thể chọn nhiều)</label>
                                <select multiple size={3} value={formData.spouseIds} onChange={e => handleMultiSelect(e, 'spouseIds')} className="w-full p-2.5 border rounded-lg outline-none bg-gray-50">
                                    {members.filter(m => m._id !== editData?._id).map(m => (
                                        <option key={m._id} value={m._id}>{m.fullName}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Hủy</button>
                        <button type="submit" disabled={loading} className="px-5 py-2.5 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg flex items-center gap-2">
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {loading ? 'Đang lưu...' : 'Lưu Thành Viên'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}