'use client';

import { useState, useEffect, useRef } from 'react';
import {
    X,
    UploadCloud,
    Loader2,
    User,
    Heart,
    Sparkles,
    HelpCircle,
    GitBranch,
    ChevronRight,
    ChevronLeft,
    Search,
    Edit3,
    UserPlus,
    Calendar,
    MapPin,
    Moon,
    Users,
    HeartHandshake,
    AlertCircle,
    Check,
} from 'lucide-react';
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
    isLoading,
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

    const selectedOptions = selectedValues
        .map(v => options.find(o => o.value === v))
        .filter(Boolean) as { value: string; label: string }[];
    const filteredOptions = options.filter(
        o => o.label.toLowerCase().includes(search.toLowerCase()) && !selectedValues.includes(o.value)
    );

    const removeOption = (valueToRemove: string) => {
        onChange(selectedValues.filter(v => v !== valueToRemove));
    };

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <div
                className="min-h-11 p-1.5 flex flex-wrap gap-1.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 cursor-text focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-amber-500 transition-all"
                onClick={() => !isLoading && setIsOpen(true)}
            >
                {selectedOptions.map(opt => (
                    <span
                        key={opt.value}
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 rounded-lg text-xs font-semibold animate-in zoom-in-95 duration-100"
                    >
                        {opt.label}
                        <button
                            type="button"
                            onClick={e => {
                                e.stopPropagation();
                                removeOption(opt.value);
                            }}
                            className="p-0.5 hover:bg-amber-200 dark:hover:bg-amber-800 rounded-full text-amber-600 dark:text-amber-400 transition-colors"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </span>
                ))}
                <div className="flex-1 min-w-32 flex items-center px-1.5">
                    {!isOpen && search === '' && selectedValues.length === 0 && (
                        <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                    )}
                    <input
                        type="text"
                        className="w-full bg-transparent outline-none text-xs text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                        placeholder={
                            isLoading
                                ? 'Đang tải dữ liệu...'
                                : selectedValues.length === 0
                                ? placeholder
                                : ''
                        }
                        value={search}
                        onChange={e => {
                            setSearch(e.target.value);
                            setIsOpen(true);
                        }}
                        onFocus={() => setIsOpen(true)}
                        disabled={isLoading}
                    />
                </div>
            </div>

            {isOpen && !isLoading && (
                <div className="absolute z-30 w-full mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl max-h-56 overflow-y-auto animate-in slide-in-from-top-2 duration-150">
                    {filteredOptions.length === 0 ? (
                        <div className="p-4 text-xs text-center text-slate-500 bg-slate-50/50 dark:bg-slate-950/50">
                            Không tìm thấy kết quả phù hợp
                        </div>
                    ) : (
                        <div className="p-1.5 space-y-0.5">
                            {filteredOptions.map(opt => (
                                <div
                                    key={opt.value}
                                    className="px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-700 dark:hover:text-amber-300 rounded-lg cursor-pointer transition-colors flex items-center justify-between"
                                    onClick={() => {
                                        onChange([...selectedValues, opt.value]);
                                        setSearch('');
                                    }}
                                >
                                    <span>{opt.label}</span>
                                    <Check className="w-3.5 h-3.5 text-amber-500 opacity-0 hover:opacity-100" />
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
        fatherIds: [] as string[],
        motherIds: [] as string[],
        spouseIds: [] as string[],
        lunarDay: '',
        lunarMonth: '',
        lunarIsLeap: false,
        lunarText: '',
    });

    useEffect(() => {
        if (isOpen) {
            setActiveTab(1);
            setError('');
            setIsLoadingOptions(true);

            memberService
                .getMembers(1, 2000)
                .then(res => setAllMembers(res.data))
                .catch(err => console.error('Lỗi lấy danh sách All Members:', err))
                .finally(() => setIsLoadingOptions(false));

            if (editData) {
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
                    generation: editData.generation ?? 1,
                    orderInFamily: editData.orderInFamily ?? 1,
                    fatherIds: getParentIds(editData.fatherIds),
                    motherIds: getParentIds(editData.motherIds),
                    spouseIds: getParentIds(editData.spouseIds),
                    lunarDay: editData.lunarDeathAnniversary?.day?.toString() || '',
                    lunarMonth: editData.lunarDeathAnniversary?.month?.toString() || '',
                    lunarIsLeap: editData.lunarDeathAnniversary?.isLeapMonth || false,
                    lunarText: editData.lunarDeathAnniversary?.displayText || '',
                });
            } else {
                setFormData({
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
                    fatherIds: [],
                    motherIds: [],
                    spouseIds: [],
                    lunarDay: '',
                    lunarMonth: '',
                    lunarIsLeap: false,
                    lunarText: '',
                });
            }
            setAvatarFile(null);
        }
    }, [isOpen, editData]);

    if (!isOpen) return null;

    const fatherOptions = allMembers
        .filter(m => m.gender === Gender.MALE && m._id !== editData?._id)
        .map(m => ({ value: m._id, label: `${m.fullName} (Đời ${m.generation})` }));

    const motherOptions = allMembers
        .filter(m => m.gender === Gender.FEMALE && m._id !== editData?._id)
        .map(m => ({ value: m._id, label: `${m.fullName} (Đời ${m.generation})` }));

    const spouseOptions = allMembers
        .filter(m => m._id !== editData?._id)
        .map(m => ({ value: m._id, label: `${m.fullName} (Đời ${m.generation})` }));

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
                fullName: formData.fullName,
                tuName: formData.tuName,
                gender: formData.gender,
                status: formData.status,
                isHeirless: formData.isHeirless,
                generation: Number(formData.generation),
                orderInFamily: Number(formData.orderInFamily),
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
                    displayText: formData.lunarText,
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
        /* Modal Backdrop & Container (Level 40 backdrop, Level 50 dialog) */
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-6 bg-black/60 dark:bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[92vh] overflow-hidden border border-slate-200 dark:border-slate-800 z-50">
                {/* Header & Navigation Tabs */}
                <div className="bg-slate-50/90 dark:bg-slate-950/70 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
                    <div className="px-6 py-4 flex justify-between items-center">
                        <div className="flex items-center gap-2.5">
                            {editData ? (
                                <Edit3 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            ) : (
                                <UserPlus className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            )}
                            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                {editData ? 'Cập nhật thông tin thành viên' : 'Thêm thành viên mới'}
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex px-4 overflow-x-auto no-scrollbar gap-1">
                        <button
                            onClick={() => setActiveTab(1)}
                            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
                                activeTab === 1
                                    ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                        >
                            <User className="w-4 h-4" /> 1. Thông tin cá nhân
                        </button>
                        <button
                            onClick={() => setActiveTab(2)}
                            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
                                activeTab === 2
                                    ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                        >
                            <Calendar className="w-4 h-4" /> 2. Sinh thời & Trực yết
                        </button>
                        <button
                            onClick={() => setActiveTab(3)}
                            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
                                activeTab === 3
                                    ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                        >
                            <GitBranch className="w-4 h-4" /> 3. Huyết thống & Hôn nhân
                        </button>
                    </div>
                </div>

                {/* Form Content Scrollable Area */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
                    {error && (
                        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded-2xl text-xs border border-rose-200 dark:border-rose-800 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" /> {error}
                        </div>
                    )}

                    {/* Tab 1: Personal Information */}
                    {activeTab === 1 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-200">
                            {/* Avatar Upload Box */}
                            <div className="flex flex-col items-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-950/50 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-colors group">
                                <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-amber-500 mb-2 transition-colors" />
                                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 group-hover:text-amber-600 cursor-pointer">
                                    {editData?.avatarUrl || avatarFile ? 'Thay đổi ảnh chân dung' : 'Tải lên ảnh chân dung'}
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={e => setAvatarFile(e.target.files?.[0] || null)}
                                    />
                                </label>
                                {avatarFile && (
                                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
                                        Đã chọn tệp: {avatarFile.name}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                        Họ và tên <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.fullName}
                                        onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                        placeholder="Nguyễn Văn A"
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-amber-500 outline-none text-xs transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                        Tên Tự / Hiệu (Nếu có)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.tuName}
                                        onChange={e => setFormData({ ...formData, tuName: e.target.value })}
                                        placeholder="Tử Đằng"
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-amber-500 outline-none text-xs transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                        Giới tính
                                    </label>
                                    <select
                                        value={formData.gender}
                                        onChange={e => setFormData({ ...formData, gender: e.target.value as Gender })}
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-amber-500 outline-none text-xs transition-all"
                                    >
                                        <option value={Gender.MALE}>Nam giới</option>
                                        <option value={Gender.FEMALE}>Nữ giới</option>
                                        <option value={Gender.UNKNOWN}>Chưa xác định</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                        Ngày sinh (Dương lịch)
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.birthDate}
                                        onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-amber-500 outline-none text-xs transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                        Đời thứ (Thế hệ) <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.generation}
                                        onChange={e => setFormData({ ...formData, generation: Number(e.target.value) })}
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-amber-500 outline-none text-xs transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                        Thứ bậc trong gia đình (1: Trưởng, 2: Thứ...)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.orderInFamily}
                                        onChange={e => setFormData({ ...formData, orderInFamily: Number(e.target.value) })}
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-amber-500 outline-none text-xs transition-all"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                        Tiểu sử / Ghi chú gia phả
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={formData.shortNote}
                                        onChange={e => setFormData({ ...formData, shortNote: e.target.value })}
                                        placeholder="Ví dụ: Đỗ Đệ nhất giáp Tiến sĩ cập đệ năm 20 tuổi, giữ chức Thượng thư..."
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-amber-500 outline-none text-xs transition-all resize-none"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="flex items-center gap-3 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer hover:bg-amber-50/40 dark:hover:bg-amber-950/20 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={formData.isHeirless}
                                            onChange={e => setFormData({ ...formData, isHeirless: e.target.checked })}
                                            className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                                        />
                                        <div>
                                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                                Đánh dấu Vô Tự
                                            </p>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                                Thành viên này không có người con nối dõi trực hệ.
                                            </p>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 2: Life Status, Death & Anniversary */}
                    {activeTab === 2 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-200">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Tình trạng sinh tử
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value as LifeStatus })}
                                    className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-amber-500 outline-none text-xs transition-all"
                                >
                                    <option value={LifeStatus.ALIVE}>Sinh thời (Còn sống)</option>
                                    <option value={LifeStatus.DECEASED}>Đã quy tiên (Đã mất)</option>
                                    <option value={LifeStatus.UNKNOWN}>Chưa xác định</option>
                                </select>
                            </div>

                            {formData.status === LifeStatus.DECEASED && (
                                <div className="p-5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                                Ngày mất (Dương lịch)
                                            </label>
                                            <input
                                                type="date"
                                                value={formData.deathDate}
                                                onChange={e => setFormData({ ...formData, deathDate: e.target.value })}
                                                className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none text-xs transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                                Nơi an táng / Mộ phần
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.burialPlace}
                                                onChange={e => setFormData({ ...formData, burialPlace: e.target.value })}
                                                placeholder="VD: Nghĩa trang gia tộc, khu lăng mộ..."
                                                className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none text-xs transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Lunar Anniversary Group */}
                                    <div className="p-4 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl">
                                        <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 mb-3 flex items-center gap-2">
                                            <Moon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                            Thông tin Ngày Giỗ (Âm Lịch)
                                        </h4>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-end">
                                            <div>
                                                <label className="block text-[11px] font-bold text-amber-800 dark:text-amber-300 mb-1">
                                                    Ngày (1-30)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="30"
                                                    value={formData.lunarDay}
                                                    onChange={e => setFormData({ ...formData, lunarDay: e.target.value })}
                                                    placeholder="15"
                                                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-700 rounded-xl outline-none text-xs focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-slate-100"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-bold text-amber-800 dark:text-amber-300 mb-1">
                                                    Tháng (1-12)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="12"
                                                    value={formData.lunarMonth}
                                                    onChange={e => setFormData({ ...formData, lunarMonth: e.target.value })}
                                                    placeholder="7"
                                                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-700 rounded-xl outline-none text-xs focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-slate-100"
                                                />
                                            </div>
                                            <div className="col-span-2 sm:col-span-2 flex items-center h-10 px-2">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.lunarIsLeap}
                                                        onChange={e => setFormData({ ...formData, lunarIsLeap: e.target.checked })}
                                                        className="w-4 h-4 text-amber-600 rounded"
                                                    />
                                                    <span className="text-xs font-semibold text-amber-900 dark:text-amber-300">
                                                        Là tháng Nhuận
                                                    </span>
                                                </label>
                                            </div>
                                            <div className="col-span-2 sm:col-span-4">
                                                <label className="block text-[11px] font-bold text-amber-800 dark:text-amber-300 mb-1">
                                                    Ghi chú hiển thị (Ưu tiên hiển thị dòng này)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.lunarText}
                                                    onChange={e => setFormData({ ...formData, lunarText: e.target.value })}
                                                    placeholder="VD: Rằm tháng Bảy, Ngày mùng 10 tháng Giêng..."
                                                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-700 rounded-xl outline-none text-xs focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-slate-100"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab 3: Family Relations (Parents & Spouses) */}
                    {activeTab === 3 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-200">
                            {/* Father */}
                            <div className="bg-sky-50/50 dark:bg-sky-950/20 p-5 rounded-2xl border border-sky-100 dark:border-sky-900/40">
                                <label className="block text-xs font-bold text-sky-900 dark:text-sky-300 mb-1.5 flex items-center gap-2">
                                    <Users className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                                    Thân phụ (Cha)
                                </label>
                                <p className="text-[11px] text-sky-600 dark:text-sky-400 mb-3">
                                    Tìm và chọn người đóng vai trò là Cha. Có thể chọn nhiều nếu dữ liệu lịch sử chưa rõ.
                                </p>
                                <SearchableMultiSelect
                                    options={fatherOptions}
                                    selectedValues={formData.fatherIds}
                                    onChange={vals => setFormData({ ...formData, fatherIds: vals })}
                                    placeholder="Gõ tên để tìm Thân phụ..."
                                    isLoading={isLoadingOptions}
                                />
                            </div>

                            {/* Mother */}
                            <div className="bg-rose-50/50 dark:bg-rose-950/20 p-5 rounded-2xl border border-rose-100 dark:border-rose-900/40">
                                <label className="block text-xs font-bold text-rose-900 dark:text-rose-300 mb-1.5 flex items-center gap-2">
                                    <Heart className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                                    Thân mẫu (Mẹ)
                                </label>
                                <p className="text-[11px] text-rose-600 dark:text-rose-400 mb-3">
                                    Tìm và chọn người đóng vai trò là Mẹ. Có thể chọn nhiều nếu dữ liệu lịch sử chưa rõ.
                                </p>
                                <SearchableMultiSelect
                                    options={motherOptions}
                                    selectedValues={formData.motherIds}
                                    onChange={vals => setFormData({ ...formData, motherIds: vals })}
                                    placeholder="Gõ tên để tìm Thân mẫu..."
                                    isLoading={isLoadingOptions}
                                />
                            </div>

                            {/* Spouses */}
                            <div className="bg-amber-50/50 dark:bg-amber-950/20 p-5 rounded-2xl border border-amber-100 dark:border-amber-900/40">
                                <label className="block text-xs font-bold text-amber-900 dark:text-amber-300 mb-1.5 flex items-center gap-2">
                                    <HeartHandshake className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                    Phối ngẫu (Vợ / Chồng)
                                </label>
                                <p className="text-[11px] text-amber-600 dark:text-amber-400 mb-3">
                                    Thứ tự chọn tương ứng với vai trò Chính thất (chọn trước), Thứ thất (chọn sau).
                                </p>
                                <SearchableMultiSelect
                                    options={spouseOptions}
                                    selectedValues={formData.spouseIds}
                                    onChange={vals => setFormData({ ...formData, spouseIds: vals })}
                                    placeholder="Gõ tên để tìm Phối ngẫu..."
                                    isLoading={isLoadingOptions}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="bg-slate-50/90 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors"
                    >
                        Hủy bỏ
                    </button>

                    <div className="flex w-full sm:w-auto gap-2.5">
                        {activeTab > 1 && (
                            <button
                                type="button"
                                onClick={() => setActiveTab(activeTab - 1)}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" /> Quay lại
                            </button>
                        )}

                        {activeTab < 3 ? (
                            <button
                                type="button"
                                onClick={() => setActiveTab(activeTab + 1)}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors"
                            >
                                Tiếp tục <ChevronRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-linear-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-md shadow-amber-600/20 rounded-xl transition-all disabled:opacity-70"
                            >
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