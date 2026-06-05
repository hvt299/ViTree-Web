'use client';

import { useState, useEffect, useRef } from 'react';
import { X, UploadCloud, Loader2, User, HeartPulse, Network, ChevronRight, ChevronLeft, Search } from 'lucide-react';
import { memberService } from '@/services/memberService';
import { uploadService } from '@/services/uploadService';
import { Member, Gender, LifeStatus } from '@/types/member';

interface MultiSelectProps {
    options: { value: string; label: string }[];
    selectedValues: string[];
    onChange: (values: string[]) => void;
    placeholder?: string;
    isLoading?: boolean;
}

function SearchableMultiSelect({
    options,
    selectedValues,
    onChange,
    placeholder,
    isLoading
}: MultiSelectProps) {
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOptions = selectedValues.map(v => options.find(o => o.value === v)).filter(Boolean) as { value: string; label: string }[];
    const filteredOptions = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()) && !selectedValues.includes(o.value));

    const removeOption = (valueToRemove: string) => {
        onChange(selectedValues.filter(v => v !== valueToRemove));
    };

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <div
                className="min-h-11.5-1.5 flex flex-wrap gap-2 border border-gray-300 rounded-lg bg-white cursor-text focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-orange-500 transition-all"
                onClick={() => !isLoading && setIsOpen(true)}
            >
                {selectedOptions.map(opt => (
                    <span key={opt.value} className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-100 border border-orange-200 text-orange-800 rounded-md text-sm font-medium animate-in zoom-in-95 duration-100">
                        {opt.label}
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeOption(opt.value); }}
                            className="p-0.5 hover:bg-orange-200 rounded-full text-orange-600 transition-colors"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </span>
                ))}
                <div className="flex-1 min-w-30 flex items-center px-1">
                    {!isOpen && search === '' && selectedValues.length === 0 && <Search className="w-4 h-4 text-gray-400 mr-2" />}
                    <input
                        type="text"
                        className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-400"
                        placeholder={
                            isLoading
                                ? 'Đang tải dữ liệu...'
                                : (selectedValues.length === 0 ? placeholder : '')
                        }
                        value={search}
                        onChange={e => { setSearch(e.target.value); setIsOpen(true); }}
                        onFocus={() => setIsOpen(true)}
                        disabled={isLoading}
                    />
                </div>
            </div>

            {isOpen && !isLoading && (
                <div className="absolute z-50 w-full mt-1.5 bg-white border border-gray-100 rounded-xl shadow-xl max-h-56 overflow-y-auto animate-in slide-in-from-top-2 duration-150">
                    {filteredOptions.length === 0 ? (
                        <div className="p-4 text-sm text-center text-gray-500 bg-gray-50/50">
                            Không tìm thấy kết quả phù hợp
                        </div>
                    ) : (
                        <div className="p-1.5">
                            {filteredOptions.map(opt => (
                                <div
                                    key={opt.value}
                                    className="px-3 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 rounded-lg cursor-pointer transition-colors flex items-center"
                                    onClick={() => {
                                        onChange([...selectedValues, opt.value]);
                                        setSearch('');
                                    }}
                                >
                                    {opt.label}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    members: Member[];
    editData?: Member | null;
}

export default function MemberModal({ isOpen, onClose, onSuccess, members, editData }: Props) {
    const [activeTab, setActiveTab] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [allMembers, setAllMembers] = useState<Member[]>([]);
    const [isLoadingOptions, setIsLoadingOptions] = useState(false);

    const getParentIds = (parents: any[] | undefined) => {
        if (!parents || !Array.isArray(parents)) return [];
        return parents.map(p => {
            if (typeof p === 'object') return p._id || p.id || '';
            return p;
        });
    };

    const [formData, setFormData] = useState({
        fullName: '', tuName: '', gender: Gender.MALE, status: LifeStatus.ALIVE,
        isHeirless: false, birthDate: '', deathDate: '', burialPlace: '', shortNote: '',
        generation: 1, orderInFamily: 1,
        fatherIds: [] as string[], motherIds: [] as string[], spouseIds: [] as string[],
        lunarDay: '', lunarMonth: '', lunarIsLeap: false, lunarText: ''
    });

    useEffect(() => {
        if (isOpen) {
            setActiveTab(1);
            setError('');

            setIsLoadingOptions(true);

            memberService.getMembers(1, 2000)
                .then(res => setAllMembers(res.data))
                .catch(err => console.error('Lỗi lấy danh sách All Members:', err))
                .finally(() => setIsLoadingOptions(false));
            if (editData) {
                setFormData({
                    fullName: editData.fullName || '', tuName: editData.tuName || '',
                    gender: editData.gender || Gender.MALE, status: editData.status || LifeStatus.ALIVE,
                    isHeirless: editData.isHeirless || false,
                    birthDate: editData.birthDate ? editData.birthDate.split('T')[0] : '',
                    deathDate: editData.deathDate ? editData.deathDate.split('T')[0] : '',
                    burialPlace: editData.burialPlace || '', shortNote: editData.shortNote || '',
                    generation: editData.generation ?? 1, orderInFamily: editData.orderInFamily ?? 1,
                    fatherIds: getParentIds(editData.fatherIds), motherIds: getParentIds(editData.motherIds), spouseIds: getParentIds(editData.spouseIds),
                    lunarDay: editData.lunarDeathAnniversary?.day?.toString() || '',
                    lunarMonth: editData.lunarDeathAnniversary?.month?.toString() || '',
                    lunarIsLeap: editData.lunarDeathAnniversary?.isLeapMonth || false,
                    lunarText: editData.lunarDeathAnniversary?.displayText || '',
                });
            } else {
                setFormData({
                    fullName: '', tuName: '', gender: Gender.MALE, status: LifeStatus.ALIVE,
                    isHeirless: false, birthDate: '', deathDate: '', burialPlace: '', shortNote: '',
                    generation: 1, orderInFamily: 1,
                    fatherIds: [], motherIds: [], spouseIds: [],
                    lunarDay: '', lunarMonth: '', lunarIsLeap: false, lunarText: ''
                });
            }
            setAvatarFile(null);
        }
    }, [isOpen, editData]);

    if (!isOpen) return null;

    const fatherOptions = allMembers.filter(m => m.gender === Gender.MALE && m._id !== editData?._id).map(m => ({ value: m._id, label: `${m.fullName} (Đời ${m.generation})` }));
    const motherOptions = allMembers.filter(m => m.gender === Gender.FEMALE && m._id !== editData?._id).map(m => ({ value: m._id, label: `${m.fullName} (Đời ${m.generation})` }));
    const spouseOptions = allMembers.filter(m => m._id !== editData?._id).map(m => ({ value: m._id, label: `${m.fullName} (Đời ${m.generation})` }));

    const handleSubmit = async () => {
        if (!formData.fullName.trim()) {
            setError('Vui lòng nhập Họ và tên!');
            setActiveTab(1);
            return;
        }
        if (!formData.generation) {
            setError('Vui lòng nhập Đời thứ!');
            setActiveTab(1);
            return;
        }

        setLoading(true);
        setError('');

        try {
            let avatarUrl = undefined;
            if (avatarFile) {
                avatarUrl = await uploadService.uploadImage(avatarFile);
            }

            const payload: any = {
                fullName: formData.fullName, tuName: formData.tuName, gender: formData.gender,
                status: formData.status, isHeirless: formData.isHeirless,
                generation: Number(formData.generation), orderInFamily: Number(formData.orderInFamily),
                shortNote: formData.shortNote, burialPlace: formData.burialPlace,
                fatherIds: formData.fatherIds, motherIds: formData.motherIds, spouseIds: formData.spouseIds,
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-full overflow-hidden">

                {/* HEADER & TABS NAVIGATION */}
                <div className="bg-gray-50/80 backdrop-blur-md border-b border-gray-200">
                    <div className="px-6 py-4 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">
                            {editData ? '✏️ Cập Nhật Thông Tin' : '✨ Thêm Thành Viên Mới'}
                        </h2>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                    </div>

                    <div className="flex px-4 overflow-x-auto no-scrollbar">
                        <button onClick={() => setActiveTab(1)} className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${activeTab === 1 ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                            <User className="w-4 h-4" /> 1. Cá nhân
                        </button>
                        <button onClick={() => setActiveTab(2)} className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${activeTab === 2 ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                            <HeartPulse className="w-4 h-4" /> 2. Sinh tử & Trực yết
                        </button>
                        <button onClick={() => setActiveTab(3)} className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${activeTab === 3 ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                            <Network className="w-4 h-4" /> 3. Huyết thống & Hôn nhân
                        </button>
                    </div>
                </div>

                {/* FORM CONTENT SCROLLABLE AREA */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                    {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-center gap-2"><X className="w-4 h-4" /> {error}</div>}

                    {/* TAB 1: THÔNG TIN CÁ NHÂN */}
                    {activeTab === 1 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="flex flex-col items-center p-6 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 hover:bg-orange-50/50 transition-colors group">
                                <UploadCloud className="w-10 h-10 text-gray-400 group-hover:text-orange-500 mb-3 transition-colors" />
                                <label className="text-sm font-semibold text-gray-600 group-hover:text-orange-600 cursor-pointer">
                                    {editData?.avatarUrl || avatarFile ? 'Đổi ảnh đại diện' : 'Tải ảnh đại diện lên'}
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
                                </label>
                                {avatarFile && <p className="text-xs text-green-600 mt-2 font-medium">Đã chọn: {avatarFile.name}</p>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Họ và tên <span className="text-red-500">*</span></label>
                                    <input type="text" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} placeholder="Nguyễn Văn A" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tên Tự (Nếu có)</label>
                                    <input type="text" value={formData.tuName} onChange={e => setFormData({ ...formData, tuName: e.target.value })} placeholder="Tử Đằng" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Giới tính</label>
                                    <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value as Gender })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all">
                                        <option value={Gender.MALE}>Nam</option>
                                        <option value={Gender.FEMALE}>Nữ</option>
                                        <option value={Gender.UNKNOWN}>Chưa rõ</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ngày sinh (Dương lịch)</label>
                                    <input type="date" value={formData.birthDate} onChange={e => setFormData({ ...formData, birthDate: e.target.value })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Đời thứ (Thế hệ) <span className="text-red-500">*</span></label>
                                    <input type="number" min="1" value={formData.generation} onChange={e => setFormData({ ...formData, generation: Number(e.target.value) })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Thứ bậc (0: Không rõ, 1: Trưởng, 2: Thứ...)</label>
                                    <input type="number" min="0" value={formData.orderInFamily} onChange={e => setFormData({ ...formData, orderInFamily: Number(e.target.value) })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all" />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tiểu sử / Ghi chú ngắn</label>
                                    <textarea rows={3} value={formData.shortNote} onChange={e => setFormData({ ...formData, shortNote: e.target.value })} placeholder="VD: Đỗ Đệ nhất giáp Tiến sĩ cập đệ năm 20 tuổi..." className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all resize-none" />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-orange-50/50 transition-colors">
                                        <input type="checkbox" checked={formData.isHeirless} onChange={e => setFormData({ ...formData, isHeirless: e.target.checked })} className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500" />
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">Đánh dấu Vô Tự</p>
                                            <p className="text-xs text-gray-500">Thành viên này không có con cái nối dõi tông đường.</p>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: TÌNH TRẠNG & NGÀY GIỖ */}
                    {activeTab === 2 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tình trạng sự sống</label>
                                <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as LifeStatus })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all">
                                    <option value={LifeStatus.ALIVE}>🟢 Còn sống</option>
                                    <option value={LifeStatus.DECEASED}>⚫ Đã mất</option>
                                    <option value={LifeStatus.UNKNOWN}>❔ Không rõ (Mất tích/Thất lạc)</option>
                                </select>
                            </div>

                            {formData.status === LifeStatus.DECEASED && (
                                <div className="p-5 bg-gray-50 border border-gray-200 rounded-2xl space-y-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ngày mất (Dương lịch)</label>
                                            <input type="date" value={formData.deathDate} onChange={e => setFormData({ ...formData, deathDate: e.target.value })} className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nơi an táng / Mộ phần</label>
                                            <input type="text" value={formData.burialPlace} onChange={e => setFormData({ ...formData, burialPlace: e.target.value })} placeholder="VD: Nghĩa trang gia tộc" className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all" />
                                        </div>
                                    </div>

                                    {/* Khối Ngày Âm Lịch nổi bật */}
                                    <div className="p-4 bg-orange-50/80 border border-orange-200 rounded-xl">
                                        <h4 className="text-sm font-bold text-orange-900 mb-4 flex items-center gap-2">🌙 Thông tin Ngày Giỗ (Âm Lịch)</h4>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-end">
                                            <div>
                                                <label className="block text-xs font-semibold text-orange-800 mb-1">Ngày (1-30)</label>
                                                <input type="number" min="1" max="30" value={formData.lunarDay} onChange={e => setFormData({ ...formData, lunarDay: e.target.value })} placeholder="VD: 15" className="w-full p-2.5 bg-white border border-orange-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-orange-800 mb-1">Tháng (1-12)</label>
                                                <input type="number" min="1" max="12" value={formData.lunarMonth} onChange={e => setFormData({ ...formData, lunarMonth: e.target.value })} placeholder="VD: 7" className="w-full p-2.5 bg-white border border-orange-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500" />
                                            </div>
                                            <div className="col-span-2 sm:col-span-2 flex items-center h-10.5 px-2">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input type="checkbox" checked={formData.lunarIsLeap} onChange={e => setFormData({ ...formData, lunarIsLeap: e.target.checked })} className="w-4 h-4 text-orange-600 rounded" />
                                                    <span className="text-sm font-semibold text-orange-900">Là tháng Nhuận</span>
                                                </label>
                                            </div>
                                            <div className="col-span-2 sm:col-span-4">
                                                <label className="block text-xs font-semibold text-orange-800 mb-1">Text hiển thị (Sẽ ưu tiên in dòng này ra màn hình)</label>
                                                <input type="text" value={formData.lunarText} onChange={e => setFormData({ ...formData, lunarText: e.target.value })} placeholder="VD: Rằm tháng Bảy, Mùng 10..." className="w-full p-2.5 bg-white border border-orange-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 3: QUAN HỆ GIA ĐÌNH */}
                    {activeTab === 3 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
                                <label className="block text-sm font-bold text-blue-900 mb-2">👨 Cha (Huyết thống / Nuôi dưỡng)</label>
                                <p className="text-xs text-blue-600 mb-3">Tìm và chọn những người đóng vai trò là Cha. Có thể chọn nhiều nếu dữ liệu lịch sử không rõ.</p>
                                <SearchableMultiSelect
                                    options={fatherOptions}
                                    selectedValues={formData.fatherIds}
                                    onChange={vals => setFormData({ ...formData, fatherIds: vals })}
                                    placeholder="Gõ tên để tìm Cha..."
                                    isLoading={isLoadingOptions}
                                />
                            </div>

                            <div className="bg-pink-50/50 p-5 rounded-2xl border border-pink-100">
                                <label className="block text-sm font-bold text-pink-900 mb-2">👩 Mẹ (Huyết thống / Nuôi dưỡng)</label>
                                <p className="text-xs text-pink-600 mb-3">Tìm và chọn những người đóng vai trò là Mẹ. Có thể chọn nhiều nếu dữ liệu lịch sử không rõ.</p>
                                <SearchableMultiSelect
                                    options={motherOptions}
                                    selectedValues={formData.motherIds}
                                    onChange={vals => setFormData({ ...formData, motherIds: vals })}
                                    placeholder="Gõ tên để tìm Mẹ..."
                                    isLoading={isLoadingOptions}
                                />
                            </div>

                            <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-100">
                                <label className="block text-sm font-bold text-amber-900 mb-2">💍 Vợ / Chồng (Phối ngẫu)</label>
                                <p className="text-xs text-amber-600 mb-3">Thứ tự chọn sẽ quyết định ai là Chính thất (chọn trước), ai là Thứ thất (chọn sau).</p>
                                <SearchableMultiSelect
                                    options={spouseOptions}
                                    selectedValues={formData.spouseIds}
                                    onChange={vals => setFormData({ ...formData, spouseIds: vals })}
                                    placeholder="Gõ tên để tìm Vợ/Chồng..."
                                    isLoading={isLoadingOptions}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* FOOTER & ACTIONS */}
                <div className="bg-white border-t border-gray-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <button type="button" onClick={onClose} className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                        Hủy bỏ
                    </button>

                    <div className="flex w-full sm:w-auto gap-3">
                        {activeTab > 1 && (
                            <button type="button" onClick={() => setActiveTab(activeTab - 1)} className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl transition-colors">
                                <ChevronLeft className="w-4 h-4" /> Quay lại
                            </button>
                        )}

                        {activeTab < 3 ? (
                            <button type="button" onClick={() => setActiveTab(activeTab + 1)} className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-5 py-2.5 text-sm font-semibold text-white bg-gray-800 hover:bg-gray-900 rounded-xl transition-colors">
                                Tiếp tục <ChevronRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button type="button" onClick={handleSubmit} disabled={loading} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-md shadow-orange-500/20 rounded-xl transition-all disabled:opacity-70">
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                {loading ? 'Đang lưu...' : 'Lưu Thành Viên'}
                            </button>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}