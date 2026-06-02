'use client';

import { useState, useEffect } from 'react';
import { X, UploadCloud, Loader2 } from 'lucide-react';
import { memberService } from '@/services/memberService';
import { uploadService } from '@/services/uploadService';
import { Member } from '@/types/member';

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

    const [formData, setFormData] = useState({
        fullName: '',
        gender: 'MALE',
        isAlive: true,
        birthDate: '',
        deathDate: '',
        burialPlace: '',
        shortNote: '',
        generation: 1,
        fatherId: '',
        motherId: '',
    });

    useEffect(() => {
        if (isOpen && editData) {
            setFormData({
                fullName: editData.fullName || '',
                gender: editData.gender || 'MALE',
                isAlive: editData.isAlive ?? true,
                birthDate: editData.birthDate ? editData.birthDate.split('T')[0] : '',
                deathDate: editData.deathDate ? editData.deathDate.split('T')[0] : '',
                burialPlace: editData.burialPlace || '',
                shortNote: editData.shortNote || '',
                generation: editData.generation || 1,
                fatherId: typeof editData.fatherId === 'object' ? (editData.fatherId as any)._id : (editData.fatherId || ''),
                motherId: typeof editData.motherId === 'object' ? (editData.motherId as any)._id : (editData.motherId || ''),
            });
            setAvatarFile(null);
        } else if (isOpen && !editData) {
            setFormData({
                fullName: '',
                gender: 'MALE',
                isAlive: true,
                birthDate: '',
                deathDate: '',
                burialPlace: '',
                shortNote: '',
                generation: 1,
                fatherId: '',
                motherId: '',
            });
            setAvatarFile(null);
        }
    }, [isOpen, editData]);

    if (!isOpen) return null;

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
                ...formData,
                generation: Number(formData.generation),
            };

            if (avatarUrl) payload.avatarUrl = avatarUrl;
            if (!payload.fatherId) delete payload.fatherId;
            if (!payload.motherId) delete payload.motherId;
            if (!payload.birthDate) delete payload.birthDate;
            if (!payload.deathDate) delete payload.deathDate;

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
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">
                        {editData ? 'Cập Nhật Thông Tin' : 'Thêm Thành Viên Mới'}
                    </h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Ảnh đại diện */}
                        <div className="md:col-span-2 flex flex-col items-center p-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                            <UploadCloud className="w-8 h-8 text-orange-500 mb-2" />
                            <label className="text-sm font-medium text-orange-600 cursor-pointer hover:underline">
                                {editData?.avatarUrl ? 'Thay đổi ảnh đại diện' : 'Tải ảnh đại diện lên'}
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                                />
                            </label>
                            {avatarFile && <p className="text-xs text-gray-500 mt-2">{avatarFile.name}</p>}
                        </div>

                        {/* Thông tin cơ bản */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên *</label>
                            <input required type="text" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                            <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none">
                                <option value="MALE">Nam</option>
                                <option value="FEMALE">Nữ</option>
                                <option value="UNKNOWN">Chưa rõ</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Đời thứ (Thế hệ) *</label>
                            <input required type="number" min="1" value={formData.generation} onChange={(e) => setFormData({ ...formData, generation: Number(e.target.value) })} className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                            <input type="date" value={formData.birthDate} onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })} className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
                        </div>

                        {/* Tình trạng */}
                        <div className="md:col-span-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <input type="checkbox" checked={formData.isAlive} onChange={(e) => setFormData({ ...formData, isAlive: e.target.checked })} className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500" />
                                Người này hiện vẫn còn sống
                            </label>
                        </div>

                        {!formData.isAlive && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày mất</label>
                                    <input type="date" value={formData.deathDate} onChange={(e) => setFormData({ ...formData, deathDate: e.target.value })} className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nơi an táng</label>
                                    <input type="text" value={formData.burialPlace} onChange={(e) => setFormData({ ...formData, burialPlace: e.target.value })} className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
                                </div>
                            </>
                        )}

                        {/* Quan hệ */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cha</label>
                            <select value={formData.fatherId} onChange={(e) => setFormData({ ...formData, fatherId: e.target.value })} className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none">
                                <option value="">-- Không rõ --</option>
                                {members
                                    .filter(m => m.gender === 'MALE' && m._id !== editData?._id)
                                    .map(m => (
                                        <option key={m._id} value={m._id}>{m.fullName} (Đời {m.generation})</option>
                                    ))
                                }
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mẹ</label>
                            <select value={formData.motherId} onChange={(e) => setFormData({ ...formData, motherId: e.target.value })} className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none">
                                <option value="">-- Không rõ --</option>
                                {members
                                    .filter(m => m.gender === 'FEMALE' && m._id !== editData?._id)
                                    .map(m => (
                                        <option key={m._id} value={m._id}>{m.fullName} (Đời {m.generation})</option>
                                    ))
                                }
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                            Hủy
                        </button>
                        <button type="submit" disabled={loading} className="px-5 py-2.5 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors flex items-center gap-2">
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {loading ? 'Đang lưu...' : 'Lưu Thành Viên'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}