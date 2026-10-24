'use client';

import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
    ReactFlow,
    Background,
    useReactFlow,
    useViewport,
    ReactFlowProvider,
    Node,
} from '@xyflow/react';
import {
    Maximize,
    Minimize,
    User,
    X,
    ZoomIn,
    ZoomOut,
    Maximize2,
    MapPin,
    Moon,
    UserMinus,
    Crown,
    Sparkles,
    BookOpen,
    Edit3,
    Filter,
    Users,
    ListFilter,
    Search,
    ChevronRight,
    Info,
    Compass,
    Heart,
    Calendar,
    ArrowUpRight,
} from 'lucide-react';
import '@xyflow/react/dist/style.css';

import CompactFamilyNode, { getCuuTocTitle, getOrderText } from './CompactFamilyNode';
import GenerationBandNode from './GenerationBandNode';
import FamilyTreeLegend from './FamilyTreeLegend';
import { Member, Gender, LifeStatus } from '@/types/member';
import { buildCompactFamilyLayout } from './compact-family-layout';
import { useTheme } from './ThemeProvider';

interface Props {
    members: Member[];
    searchQuery?: string;
    genderFilter?: string;
    statusFilter?: string;
    onEditMember?: (member: Member) => void;
    onSetRootMember?: (memberId: string) => void;
}

const nodeTypes = {
    compactFamilyNode: CompactFamilyNode,
    generationBand: GenerationBandNode,
};

type FilterPreset = 'GEN_2' | 'GEN_3' | 'GEN_4' | 'ALL' | 'CUSTOM';

export default function FamilyTree(props: Props) {
    return (
        <ReactFlowProvider>
            <FamilyTreeInner {...props} />
        </ReactFlowProvider>
    );
}

function FamilyTreeInner({
    members,
    onEditMember,
    onSetRootMember,
}: Props) {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const hasInitialFit = useRef(false);
    const { setCenter, zoomIn, zoomOut, zoomTo, fitView } = useReactFlow();
    const { zoom } = useViewport();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showDirectory, setShowDirectory] = useState(false);
    const [showLegend, setShowLegend] = useState(true);
    const [directorySearch, setDirectorySearch] = useState('');

    // Mốc Kỷ Thân (đối chiếu Cửu Tộc)
    const [kyThanId, setKyThanId] = useState<string>('');

    // Sơ đồ cây phả hệ mặc định là Đời 1 - 3
    const [activePreset, setActivePreset] = useState<FilterPreset>('GEN_3');

    // Mặc định thu gọn các nhánh từ đời 3 trở đi để hiển thị gọn gàng Đời 1 - 3
    const [collapsedIds, setCollapsedIds] = useState<Set<string>>(() => {
        const initial = new Set<string>();
        members.forEach((m) => {
            if ((m.generation || 1) >= 3) {
                initial.add(m._id);
            }
        });
        return initial;
    });

    const isInitialCollapsedSet = useRef(false);
    useEffect(() => {
        if (!isInitialCollapsedSet.current && members.length > 0) {
            isInitialCollapsedSet.current = true;
            const initial = new Set<string>();
            members.forEach((m) => {
                if ((m.generation || 1) >= 3) {
                    initial.add(m._id);
                }
            });
            setCollapsedIds(initial);
        }
    }, [members]);

    // Ref kích hoạt chuyển động camera khi đổi preset hoặc lần đầu vào trang
    const triggerCameraPreset = useRef<FilterPreset | null>('GEN_3');

    useEffect(() => {
        const handleFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // Phím tắt bàn phím: +, -, F, Esc
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;

            if (e.key === '+' || e.key === '=') {
                e.preventDefault();
                zoomIn({ duration: 200 });
            } else if (e.key === '-' || e.key === '_') {
                e.preventDefault();
                zoomOut({ duration: 200 });
            } else if (e.key === 'f' || e.key === 'F') {
                e.preventDefault();
                fitView({ padding: 0.16, duration: 400 });
            } else if (e.key === 'Escape') {
                setSelectedId(null);
                setShowDirectory(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [zoomIn, zoomOut, fitView]);

    // Khi thu gọn/mở rộng nhánh: giữ nguyên camera tránh giật màn hình
    const toggleCollapse = useCallback((memberId: string) => {
        setActivePreset('CUSTOM');
        setCollapsedIds((prev) => {
            const next = new Set(prev);
            if (next.has(memberId)) next.delete(memberId);
            else next.add(memberId);
            return next;
        });
    }, []);

    // Ref lưu trữ nodes để tránh vòng lặp phụ thuộc (TDZ)
    const nodesRef = useRef<Node[]>([]);

    // Khi click chọn 1 thành viên trên sơ đồ: Zoom mượt mà và định tâm để xem rõ
    const handleSelectMember = useCallback((memberId: string) => {
        setSelectedId(memberId);
        const targetNode = nodesRef.current.find(
            (n) => n.id === memberId || (n.data as any)?.spouses?.some((s: any) => s._id === memberId)
        );
        if (targetNode) {
            setCenter(targetNode.position.x + 140, targetNode.position.y + 70, {
                zoom: 1.12,
                duration: 500,
            });
        }
    }, [setCenter]);

    // Tính toán bố cục với Compact 1-Node Family Layout Engine
    const { nodes, edges } = useMemo(() => {
        return buildCompactFamilyLayout({
            members,
            collapsedIds,
            kyThanId: kyThanId || undefined,
            selectedId,
            onToggleCollapse: toggleCollapse,
            onSelect: handleSelectMember,
        });
    }, [members, collapsedIds, kyThanId, selectedId, toggleCollapse, handleSelectMember]);

    // Cập nhật nodesRef ngay sau khi nodes được tính toán
    nodesRef.current = nodes;

    // Focus thành viên từ danh bạ hoặc quan hệ: zoom và định tâm tối ưu
    const focusOnMember = useCallback(
        (memberId: string) => {
            setSelectedId(memberId);
            const targetNode = nodes.find(
                (n) => n.id === memberId || (n.data as any)?.spouses?.some((s: any) => s._id === memberId)
            );
            if (targetNode) {
                setCenter(targetNode.position.x + 140, targetNode.position.y + 70, {
                    zoom: 1.15,
                    duration: 600,
                });
            }
        },
        [nodes, setCenter]
    );

    // Zoom và định tâm tối ưu vào Thủy Tổ (Đời 1)
    const focusOnRootAncestor = useCallback(() => {
        const familyNodes = nodes.filter((n) => n.type === 'compactFamilyNode');
        if (familyNodes.length === 0) return;
        const minGen = Math.min(...familyNodes.map((n) => (n.data as any)?.primaryMember?.generation || 1));
        const gen1Nodes = familyNodes.filter((n) => (n.data as any)?.primaryMember?.generation === minGen);
        const rootNode = gen1Nodes[0] || familyNodes[0];
        if (rootNode) {
            setCenter(rootNode.position.x + 140, rootNode.position.y + 160, {
                zoom: 1.05,
                duration: 650,
            });
        }
    }, [nodes, setCenter]);

    // Lần đầu vào trang: Zoom và định tâm trực tiếp vào Đời 1
    useEffect(() => {
        if (!hasInitialFit.current && nodes.length > 0) {
            hasInitialFit.current = true;
            const familyNodes = nodes.filter((n) => n.type === 'compactFamilyNode');
            const minGen = Math.min(...familyNodes.map((n) => (n.data as any)?.primaryMember?.generation || 1));
            const gen1Nodes = familyNodes.filter((n) => (n.data as any)?.primaryMember?.generation === minGen);
            const rootNode = gen1Nodes[0] || familyNodes[0];

            const timer = setTimeout(() => {
                if (rootNode) {
                    setCenter(rootNode.position.x + 140, rootNode.position.y + 170, {
                        zoom: 0.98,
                        duration: 700,
                    });
                } else {
                    fitView({ padding: 0.16, duration: 500 });
                }
            }, 180);
            return () => clearTimeout(timer);
        }
    }, [nodes, setCenter, fitView]);

    // Khi chuyển giữa các chế độ lọc: Zoom và di chuyển camera mượt mà đến vị trí tốt nhất, ưu tiên Đời 1
    useEffect(() => {
        if (triggerCameraPreset.current && nodes.length > 0) {
            const preset = triggerCameraPreset.current;
            triggerCameraPreset.current = null;

            const familyNodes = nodes.filter((n) => n.type === 'compactFamilyNode');
            if (familyNodes.length === 0) return;
            const minGen = Math.min(...familyNodes.map((n) => (n.data as any)?.primaryMember?.generation || 1));
            const gen1Nodes = familyNodes.filter((n) => (n.data as any)?.primaryMember?.generation === minGen);
            const rootNode = gen1Nodes[0] || familyNodes[0];

            const targetX = rootNode.position.x + 140;
            let targetY = rootNode.position.y + 170;
            let targetZoom = 0.98;

            if (preset === 'GEN_2') {
                targetZoom = 1.15;
                targetY = rootNode.position.y + 130;
            } else if (preset === 'GEN_3') {
                targetZoom = 0.98;
                targetY = rootNode.position.y + 170;
            } else if (preset === 'GEN_4') {
                targetZoom = 0.82;
                targetY = rootNode.position.y + 220;
            } else if (preset === 'ALL') {
                targetZoom = 0.72;
                targetY = rootNode.position.y + 240;
            }

            const timer = setTimeout(() => {
                setCenter(targetX, targetY, { zoom: targetZoom, duration: 650 });
            }, 90);
            return () => clearTimeout(timer);
        }
    }, [nodes, setCenter]);

    // Điều khiển bộ lọc thế hệ: cập nhật nhánh & kích hoạt camera zoom vào Đời 1
    const handleSetDepth = (maxGen: number, preset: FilterPreset) => {
        setActivePreset(preset);
        const newCollapsed = new Set<string>();
        members.forEach((m) => {
            if ((m.generation || 1) >= maxGen) {
                newCollapsed.add(m._id);
            }
        });
        setCollapsedIds(newCollapsed);
        triggerCameraPreset.current = preset;
    };

    const handleExpandAll = () => {
        setActivePreset('ALL');
        setCollapsedIds(new Set());
        triggerCameraPreset.current = 'ALL';
    };

    // Thành viên đang được chọn
    const selectedMember = useMemo(() => {
        return members.find((m) => m._id === selectedId) || null;
    }, [members, selectedId]);

    // Thông tin thân tộc đầy đủ của thành viên được chọn
    const selectedFamily = useMemo(() => {
        if (!selectedMember) return null;

        const spouseIds = (selectedMember.spouseIds || []).map((s) => (typeof s === 'string' ? s : s._id));
        const spouses = members.filter((m) => spouseIds.includes(m._id));

        const children = members
            .filter((m) => {
                const fIds = (m.fatherIds || []).map((f) => (typeof f === 'string' ? f : f._id));
                const mIds = (m.motherIds || []).map((mo) => (typeof mo === 'string' ? mo : mo._id));
                return fIds.includes(selectedMember._id) || mIds.includes(selectedMember._id);
            })
            .sort((a, b) => (a.orderInFamily || 999) - (b.orderInFamily || 999));

        // Thân phụ & Thân mẫu
        const fatherIds = (selectedMember.fatherIds || []).map((f) => (typeof f === 'string' ? f : f._id));
        const motherIds = (selectedMember.motherIds || []).map((mo) => (typeof mo === 'string' ? mo : mo._id));
        const fathers = members.filter((m) => fatherIds.includes(m._id));
        const mothers = members.filter((m) => motherIds.includes(m._id));

        return { spouses, children, fathers, mothers };
    }, [members, selectedMember]);

    // Danh bạ theo từng đời
    const directoryByGen = useMemo(() => {
        const query = directorySearch.toLowerCase().trim();
        const filtered = members.filter((m) => {
            if (!query) return true;
            return (
                m.fullName.toLowerCase().includes(query) ||
                (m.tuName && m.tuName.toLowerCase().includes(query))
            );
        });

        const grouped = new Map<number, Member[]>();
        filtered.forEach((m) => {
            const g = m.generation || 1;
            if (!grouped.has(g)) grouped.set(g, []);
            grouped.get(g)!.push(m);
        });

        return Array.from(grouped.entries()).sort((a, b) => a[0] - b[0]);
    }, [members, directorySearch]);

    const toggleFullscreen = () => {
        if (!wrapperRef.current) return;
        if (!document.fullscreenElement) {
            wrapperRef.current.requestFullscreen().catch(() => {});
        } else {
            document.exitFullscreen().catch(() => {});
        }
    };

    return (
        <div className="space-y-3 w-full">
            {/* Tree Canvas Wrapper: Nền màu đỏ cam / kem ngọc phả hệ gia tộc ấm cúng */}
            <div
                ref={wrapperRef}
                className={`h-[76vh] sm:h-[82vh] rounded-3xl border border-amber-300/80 dark:border-slate-800 ${
                    isDark ? 'bg-[#0a0d14]' : 'bg-[#fffaf5]'
                } overflow-hidden relative shadow-xs transition-colors`}
            >
                {/* Thanh điều khiển nhanh trên đầu sơ đồ cây */}
                <div className="absolute top-3 left-3 right-3 sm:right-auto z-10 flex items-center gap-1.5 p-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-amber-200/90 dark:border-slate-800 rounded-2xl shadow-xs text-xs overflow-x-auto max-w-[calc(100%-24px)] no-scrollbar">
                    {/* Nút Mở/Đóng Danh Bạ (Bên trái) */}
                    <button
                        onClick={() => setShowDirectory(!showDirectory)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                            showDirectory
                                ? 'bg-linear-to-r from-amber-600 to-orange-600 text-white shadow-xs'
                                : 'bg-amber-50 dark:bg-slate-800 text-amber-950 dark:text-slate-200 hover:bg-amber-100 dark:hover:bg-slate-700'
                        }`}
                        title="Bật/Tắt Danh bạ thành viên (Bên trái)"
                    >
                        <ListFilter className="w-3.5 h-3.5" />
                        <span>Danh bạ ({members.length})</span>
                    </button>

                    <div className="h-4 w-px bg-amber-200 dark:bg-slate-700 mx-0.5" />

                    {/* Nút Zoom & Định tâm ngay vào Thủy Tổ (Đời 1) */}
                    <button
                        onClick={focusOnRootAncestor}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold text-[11px] bg-amber-100/70 hover:bg-amber-200/80 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200 transition-colors cursor-pointer border border-amber-300 dark:border-amber-800"
                        title="Phóng to & Định tâm ngay vào Thủy Tổ (Đời 1)"
                    >
                        <Crown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 fill-amber-500/20" />
                        <span>Về Đời 1</span>
                    </button>

                    <div className="h-4 w-px bg-amber-200 dark:bg-slate-700 mx-0.5" />

                    {/* Bộ lọc thế hệ nhanh */}
                    <button
                        onClick={() => handleSetDepth(2, 'GEN_2')}
                        className={`px-2.5 py-1 rounded-xl font-bold text-[11px] transition-all cursor-pointer ${
                            activePreset === 'GEN_2'
                                ? 'bg-linear-to-r from-amber-600 to-orange-600 text-white shadow-xs font-extrabold'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                        title="Hiển thị Đời 1 và Đời 2"
                    >
                        Đời 1 - 2
                    </button>

                    <button
                        onClick={() => handleSetDepth(3, 'GEN_3')}
                        className={`px-2.5 py-1 rounded-xl font-bold text-[11px] transition-all cursor-pointer ${
                            activePreset === 'GEN_3'
                                ? 'bg-linear-to-r from-amber-600 to-orange-600 text-white shadow-xs font-extrabold'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                        title="Hiển thị Đời 1 đến Đời 3 (Mặc định)"
                    >
                        Đời 1 - 3
                    </button>

                    <button
                        onClick={() => handleSetDepth(4, 'GEN_4')}
                        className={`px-2.5 py-1 rounded-xl font-bold text-[11px] transition-all cursor-pointer ${
                            activePreset === 'GEN_4'
                                ? 'bg-linear-to-r from-amber-600 to-orange-600 text-white shadow-xs font-extrabold'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                        title="Hiển thị Đời 1 đến Đời 4"
                    >
                        Đời 1 - 4
                    </button>

                    <button
                        onClick={handleExpandAll}
                        className={`px-3 py-1 rounded-xl font-bold text-[11px] transition-all cursor-pointer ${
                            activePreset === 'ALL'
                                ? 'bg-linear-to-r from-amber-600 to-orange-600 text-white shadow-xs font-extrabold'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                        title="Hiển thị toàn bộ tất cả các đời"
                    >
                        Tất cả
                    </button>

                    <div className="h-4 w-px bg-amber-200 dark:bg-slate-700 mx-0.5" />

                    {/* Bộ chọn Mốc Kỷ Thân (Đối chiếu Cửu Tộc) */}
                    <div className="flex items-center gap-1">
                        <Compass className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                        <select
                            value={kyThanId}
                            onChange={(e) => setKyThanId(e.target.value)}
                            className="px-2 py-1 text-[11px] font-semibold border border-amber-300 dark:border-amber-800/80 bg-amber-50/70 dark:bg-amber-950/40 rounded-xl text-amber-900 dark:text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer max-w-[170px]"
                            title="Chọn mốc Kỷ Thân (chính mình) để xem thứ bậc Cửu Tộc"
                        >
                            <option value="">Mốc Cửu Tộc (Tự do)</option>
                            {members.map((m) => (
                                <option key={m._id} value={m._id}>
                                    Kỷ Thân: {m.fullName} (Đời {m.generation})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="h-4 w-px bg-amber-200 dark:bg-slate-700 mx-0.5" />

                    {/* Nút bật/tắt chú giải */}
                    <button
                        onClick={() => setShowLegend(!showLegend)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-semibold text-[11px] transition-all cursor-pointer ${
                            showLegend
                                ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                        title="Bật/Tắt bảng chú thích quy ước"
                    >
                        <Info className="w-3.5 h-3.5 text-amber-500" />
                        <span>Chú giải</span>
                    </button>
                </div>

                {/* ========================================================================= */}
                {/* 1. DANH BẠ THÀNH VIÊN: NẰM HOÀN TOÀN Ở BÊN TRÁI (LEFT DRAWER)            */}
                {/* ========================================================================= */}
                {showDirectory && (
                    <div className="absolute top-0 left-0 h-full w-72 sm:w-80 bg-white/98 dark:bg-slate-900/98 backdrop-blur-xl shadow-2xl z-20 flex flex-col border-r border-amber-200/80 dark:border-slate-800 animate-in slide-in-from-left duration-200 transition-colors">
                        <div className="flex justify-between items-center p-3.5 border-b border-amber-100 dark:border-slate-800 bg-amber-50/60 dark:bg-slate-900/80 shrink-0">
                            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-xs flex items-center gap-1.5">
                                <Users className="w-4 h-4 text-amber-500" />
                                <span>Danh bạ Thành viên ({members.length})</span>
                            </h3>
                            <button
                                onClick={() => setShowDirectory(false)}
                                className="p-1 text-slate-400 hover:text-rose-500 rounded-lg cursor-pointer transition-colors"
                                title="Đóng danh bạ"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Ô tìm kiếm trong danh bạ */}
                        <div className="p-2.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
                            <div className="relative">
                                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                                <input
                                    type="text"
                                    value={directorySearch}
                                    onChange={(e) => setDirectorySearch(e.target.value)}
                                    placeholder="Tìm tên hoặc tên tự..."
                                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-1 focus:ring-amber-500 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        {/* Danh sách thành viên gom theo đời */}
                        <div className="flex-1 overflow-y-auto p-2 space-y-3">
                            {directoryByGen.length === 0 ? (
                                <p className="text-center text-xs text-slate-400 py-6">Không tìm thấy ai</p>
                            ) : (
                                directoryByGen.map(([genNum, genMembers]) => (
                                    <div key={genNum} className="space-y-1">
                                        <div className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider px-2 py-0.5 bg-amber-50 dark:bg-amber-950/40 rounded flex justify-between items-center">
                                            <span>Đời thứ {genNum}</span>
                                            <span>{genMembers.length} người</span>
                                        </div>
                                        <div className="space-y-0.5">
                                            {genMembers.map((m) => (
                                                <button
                                                    key={m._id}
                                                    onClick={() => focusOnMember(m._id)}
                                                    className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                                                        selectedId === m._id
                                                            ? 'bg-linear-to-r from-amber-600 to-orange-600 text-white font-bold'
                                                            : 'text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-slate-800'
                                                    }`}
                                                >
                                                    <span className="break-words flex-1 text-left leading-snug">
                                                        {m.fullName}
                                                        {m.tuName && (
                                                            <span className="opacity-75 italic text-[11px] ml-1 font-normal">
                                                                (Tự: {m.tuName})
                                                            </span>
                                                        )}
                                                    </span>
                                                    <ChevronRight className="w-3.5 h-3.5 opacity-40 shrink-0" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* 2. CHI TIẾT THÀNH VIÊN ĐẦY ĐỦ: NẰM HOÀN TOÀN Ở BÊN PHẢI (RIGHT DRAWER)     */}
                {/* ========================================================================= */}
                {selectedId && selectedMember && (
                    <div className="absolute top-0 right-0 h-full w-84 sm:w-[400px] bg-white/98 dark:bg-slate-900/98 backdrop-blur-xl shadow-2xl z-20 flex flex-col border-l border-amber-200/80 dark:border-slate-800 animate-in slide-in-from-right duration-200 transition-colors">
                        <div className="flex justify-between items-center px-4 py-3 border-b border-amber-100 dark:border-slate-800 bg-amber-50/60 dark:bg-slate-900/80 shrink-0">
                            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-xs flex items-center gap-1.5">
                                <Users className="w-4 h-4 text-amber-500" />
                                <span>Hồ Sơ Chi Tiết Thành Viên</span>
                            </h3>
                            <button
                                onClick={() => setSelectedId(null)}
                                className="p-1 text-slate-400 hover:text-rose-500 rounded-lg cursor-pointer transition-colors"
                                title="Đóng chi tiết"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/40 dark:bg-slate-950/40 text-xs">
                            {/* Profile Card Chính */}
                            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-xs border border-amber-200/80 dark:border-slate-800 text-center relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-12 bg-linear-to-r from-amber-500/20 via-orange-500/25 to-amber-500/20" />
                                <div className="relative w-16 h-16 mx-auto rounded-2xl bg-white dark:bg-slate-800 border-2 border-white dark:border-slate-800 mb-2 overflow-hidden shadow-xs flex items-center justify-center z-10">
                                    {selectedMember.avatarUrl ? (
                                        <img
                                            src={selectedMember.avatarUrl}
                                            alt={selectedMember.fullName}
                                            className="object-cover w-full h-full"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center font-bold text-xl text-amber-600 dark:text-amber-400">
                                            {selectedMember.fullName ? selectedMember.fullName.charAt(0) : <User size={24} />}
                                        </div>
                                    )}
                                </div>

                                <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                                    {selectedMember.fullName}
                                </h2>
                                {selectedMember.tuName && (
                                    <p className="text-[11px] italic text-amber-700 dark:text-amber-400 mt-0.5 font-medium">
                                        Tự / Hiệu: {selectedMember.tuName}
                                    </p>
                                )}

                                <div className="flex flex-wrap justify-center gap-1.5 mt-2.5">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold rounded-full border border-amber-200 dark:border-amber-800 text-[10px]">
                                        <Crown className="w-3 h-3" /> Đời {selectedMember.generation}
                                    </span>
                                    <span
                                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 font-bold rounded-full text-[10px] ${
                                            selectedMember.status === LifeStatus.DECEASED
                                                ? 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700'
                                                : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                        }`}
                                    >
                                        {selectedMember.status === LifeStatus.DECEASED ? (
                                            <>
                                                <Sparkles className="w-2.5 h-2.5 text-stone-400" /> Tiền nhân
                                            </>
                                        ) : (
                                            <>
                                                <Heart className="w-2.5 h-2.5 fill-emerald-500/20 text-emerald-500" /> Sinh thời
                                            </>
                                        )}
                                    </span>
                                    <span
                                        className={`inline-flex px-2 py-0.5 font-bold rounded-full text-[10px] ${
                                            selectedMember.gender === Gender.MALE
                                                ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
                                                : selectedMember.gender === Gender.FEMALE
                                                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                                                : 'bg-slate-100 text-slate-600'
                                        }`}
                                    >
                                        {selectedMember.gender === Gender.MALE ? 'Nam giới' : selectedMember.gender === Gender.FEMALE ? 'Nữ giới' : 'Chưa rõ'}
                                    </span>
                                    {selectedMember.orderInFamily ? (
                                        <span className="inline-flex px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-full text-[10px]">
                                            {getOrderText(selectedMember.orderInFamily)}
                                        </span>
                                    ) : null}
                                    {selectedMember.isHeirless && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 font-bold rounded-full border border-rose-200 dark:border-rose-800 text-[10px]">
                                            <UserMinus className="w-3 h-3" /> Vô tự
                                        </span>
                                    )}
                                    {kyThanId && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold rounded-full border border-indigo-200 dark:border-indigo-800 text-[10px]">
                                            {getCuuTocTitle((selectedMember.generation || 1) - ((members.find((x) => x._id === kyThanId)?.generation) || 1)) || 'Cửu tộc'}
                                        </span>
                                    )}
                                </div>

                                {/* Các nút hành động */}
                                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                    <button
                                        onClick={() => setKyThanId(selectedMember._id)}
                                        className="flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 rounded-xl transition-colors border border-indigo-200 dark:border-indigo-800 cursor-pointer"
                                        title="Đặt làm mốc Kỷ Thân (đối chiếu Cửu Tộc)"
                                    >
                                        <Compass className="w-3.5 h-3.5" /> Mốc Kỷ Thân
                                    </button>

                                    {onSetRootMember && (
                                        <button
                                            onClick={() => onSetRootMember(selectedMember._id)}
                                            className="flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 rounded-xl transition-colors border border-amber-200 dark:border-amber-800 cursor-pointer"
                                            title="Xem riêng chi của thành viên này"
                                        >
                                            <Filter className="w-3.5 h-3.5" /> Xem chi này
                                        </button>
                                    )}
                                </div>

                                {onEditMember && (
                                    <button
                                        onClick={() => onEditMember(selectedMember)}
                                        className="w-full mt-2 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-linear-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 rounded-xl transition-all shadow-xs cursor-pointer"
                                    >
                                        <Edit3 className="w-3.5 h-3.5" /> Chỉnh sửa hồ sơ
                                    </button>
                                )}
                            </div>

                            {/* Niên đại & Sinh tử */}
                            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl shadow-xs border border-amber-200/80 dark:border-slate-800 space-y-2">
                                <h4 className="font-bold text-amber-900 dark:text-amber-300 text-xs pb-1 border-b border-slate-100 dark:border-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                                    Niên Đại & Mộ Phần
                                </h4>
                                <div className="space-y-1.5 text-[11px] leading-relaxed">
                                    <div className="flex items-start justify-between">
                                        <span className="text-slate-500 dark:text-slate-400">Ngày / Năm sinh:</span>
                                        <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedMember.birthDate || 'Chưa ghi nhận'}</span>
                                    </div>
                                    <div className="flex items-start justify-between">
                                        <span className="text-slate-500 dark:text-slate-400">Ngày / Năm mất:</span>
                                        <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedMember.deathDate || (selectedMember.status === LifeStatus.DECEASED ? 'Đã mất (chưa rõ năm)' : 'Sinh thời')}</span>
                                    </div>
                                    {selectedMember.lunarDeathAnniversary?.displayText && (
                                        <div className="flex items-start justify-between text-amber-800 dark:text-amber-300 font-semibold pt-1 border-t border-slate-100 dark:border-slate-800">
                                            <span className="flex items-center gap-1"><Moon className="w-3 h-3 text-amber-500" /> Giỗ Âm lịch:</span>
                                            <span>{selectedMember.lunarDeathAnniversary.displayText}</span>
                                        </div>
                                    )}
                                    {selectedMember.burialPlace && (
                                        <div className="flex items-start justify-between text-slate-700 dark:text-slate-300 pt-1 border-t border-slate-100 dark:border-slate-800">
                                            <span className="flex items-center gap-1 text-slate-500"><MapPin className="w-3 h-3 text-rose-500" /> Nơi an táng:</span>
                                            <span className="font-medium text-right max-w-[200px]">{selectedMember.burialPlace}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Tiểu sử & Ghi chú */}
                            {selectedMember.shortNote && (
                                <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl shadow-xs border border-amber-200/80 dark:border-slate-800 space-y-1.5">
                                    <h4 className="font-bold text-amber-900 dark:text-amber-300 text-xs pb-1 border-b border-slate-100 dark:border-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                        <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                                        Tiểu Sử & Lời Dặn Của Tiền Nhân
                                    </h4>
                                    <p className="text-slate-600 dark:text-slate-300 italic leading-relaxed text-[11px] pt-1">
                                        "{selectedMember.shortNote}"
                                    </p>
                                </div>
                            )}

                            {/* Quan hệ Thân tộc: Thân phụ, Thân mẫu, Phối ngẫu & Con cái */}
                            {selectedFamily && (
                                <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl shadow-xs border border-amber-200/80 dark:border-slate-800 space-y-3">
                                    <h4 className="font-bold text-amber-900 dark:text-amber-300 text-xs pb-1.5 border-b border-slate-100 dark:border-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                        Quan Hệ Thân Tộc
                                    </h4>

                                    {/* Thân phụ & Thân mẫu */}
                                    {(selectedFamily.fathers.length > 0 || selectedFamily.mothers.length > 0) && (
                                        <div className="space-y-1.5">
                                            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                                Song thân (Cha & Mẹ):
                                            </p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                                {selectedFamily.fathers.map((f) => (
                                                    <button
                                                        key={f._id}
                                                        onClick={() => focusOnMember(f._id)}
                                                        className="text-left px-2.5 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 border border-sky-200 dark:border-sky-900 text-[11px] font-semibold text-sky-800 dark:text-sky-300 flex justify-between items-center transition-colors cursor-pointer"
                                                    >
                                                        <span>Thân phụ: {f.fullName}</span>
                                                        <ArrowUpRight className="w-3 h-3 opacity-60" />
                                                    </button>
                                                ))}
                                                {selectedFamily.mothers.map((mo) => (
                                                    <button
                                                        key={mo._id}
                                                        onClick={() => focusOnMember(mo._id)}
                                                        className="text-left px-2.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 border border-rose-200 dark:border-rose-900 text-[11px] font-semibold text-rose-800 dark:text-rose-300 flex justify-between items-center transition-colors cursor-pointer"
                                                    >
                                                        <span>Thân mẫu: {mo.fullName}</span>
                                                        <ArrowUpRight className="w-3 h-3 opacity-60" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Phối ngẫu */}
                                    {selectedFamily.spouses.length > 0 && (
                                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                                            <p className="text-[11px] font-bold text-amber-800 dark:text-amber-300">
                                                Phối ngẫu ({selectedFamily.spouses.length}):
                                            </p>
                                            <div className="space-y-1">
                                                {selectedFamily.spouses.map((s, idx) => (
                                                    <button
                                                        key={s._id}
                                                        onClick={() => focusOnMember(s._id)}
                                                        className="w-full text-left px-2.5 py-1.5 rounded-xl bg-amber-50/70 dark:bg-slate-800/60 hover:bg-amber-100/80 border border-amber-200/80 dark:border-slate-700 text-[11px] font-semibold text-amber-950 dark:text-amber-200 flex justify-between items-center transition-colors cursor-pointer"
                                                    >
                                                        <div>
                                                            <span className="font-bold text-amber-700 dark:text-amber-400">
                                                                {selectedFamily.spouses.length >= 2
                                                                    ? idx === 0 ? 'Chánh thất: ' : 'Thứ thất: '
                                                                    : 'Vợ/Chồng: '}
                                                            </span>
                                                            <span>{s.fullName}</span>
                                                        </div>
                                                        <ChevronRight className="w-3 h-3 opacity-50" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Con cái */}
                                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                                        <p className="text-[11px] font-bold text-sky-700 dark:text-sky-400">
                                            Hậu duệ trực hệ ({selectedFamily.children.length} người con):
                                        </p>
                                        {selectedFamily.children.length > 0 ? (
                                            <div className="space-y-1">
                                                {selectedFamily.children.map((c) => (
                                                    <button
                                                        key={c._id}
                                                        onClick={() => focusOnMember(c._id)}
                                                        className="w-full text-left px-2.5 py-1.5 rounded-xl bg-sky-50/60 dark:bg-sky-950/30 hover:bg-sky-100/80 border border-sky-200/80 dark:border-sky-900 text-[11px] font-semibold text-sky-900 dark:text-sky-200 flex justify-between items-center transition-colors cursor-pointer"
                                                    >
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-[10px] text-sky-600 dark:text-sky-400 font-bold">
                                                                {getOrderText(c.orderInFamily) || `Con`}
                                                            </span>
                                                            <span>{c.fullName}</span>
                                                        </div>
                                                        <ChevronRight className="w-3 h-3 opacity-50" />
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-[11px] text-slate-400 italic">
                                                {selectedMember.isHeirless ? 'Chi này vô tự (không có con nối dõi).' : 'Chưa có thông tin con cái.'}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ReactFlow Canvas */}
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    minZoom={0.15}
                    maxZoom={1.8}
                    zoomOnScroll={false}
                    panOnScroll={true}
                    panOnDrag={true}
                    nodesDraggable={false}
                    onlyRenderVisibleElements={true}
                    onPaneClick={() => setSelectedId(null)}
                >
                    <Background
                        gap={28}
                        size={1.5}
                        color={isDark ? '#9a3412' : '#f97316'}
                        className="opacity-25"
                    />
                </ReactFlow>

                {/* Thanh điều khiển nổi ở góc dưới bên phải: Kéo thả zoom mượt mà */}
                <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 p-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-amber-200/90 dark:border-slate-800 rounded-2xl shadow-lg text-slate-700 dark:text-slate-200">
                    {/* Nút Zoom Out */}
                    <button
                        onClick={() => zoomOut({ duration: 250 })}
                        className="p-1.5 hover:bg-amber-50 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer text-slate-600 dark:text-slate-300"
                        title="Thu nhỏ (-)"
                    >
                        <ZoomOut size={15} />
                    </button>

                    {/* Thanh kéo Zoom Slider */}
                    <div className="flex items-center gap-1.5 px-1">
                        <input
                            type="range"
                            min={0.15}
                            max={1.8}
                            step={0.05}
                            value={Number((zoom || 1).toFixed(2))}
                            onChange={(e) => {
                                const newZoom = parseFloat(e.target.value);
                                zoomTo(newZoom);
                            }}
                            className="w-16 sm:w-24 h-1.5 bg-slate-200 dark:bg-slate-700 accent-amber-600 rounded-lg cursor-pointer appearance-none"
                            title={`Kéo để phóng to / thu nhỏ: ${Math.round((zoom || 1) * 100)}%`}
                        />
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 min-w-[32px] text-right select-none">
                            {Math.round((zoom || 1) * 100)}%
                        </span>
                    </div>

                    {/* Nút Zoom In */}
                    <button
                        onClick={() => zoomIn({ duration: 250 })}
                        className="p-1.5 hover:bg-amber-50 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer text-slate-600 dark:text-slate-300"
                        title="Phóng to (+)"
                    >
                        <ZoomIn size={15} />
                    </button>

                    <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-0.5" />

                    <button
                        onClick={() => fitView({ padding: 0.16, duration: 400 })}
                        className="p-1.5 hover:bg-amber-50 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer text-slate-600 dark:text-slate-300"
                        title="Vừa vặn màn hình (F)"
                    >
                        <Maximize2 size={15} />
                    </button>

                    <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-0.5" />

                    <button
                        onClick={toggleFullscreen}
                        className="p-1.5 hover:bg-amber-50 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer text-slate-600 dark:text-slate-300"
                        title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
                    >
                        {isFullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
                    </button>
                </div>
            </div>

            {/* Bảng Chú giải quy ước sơ đồ phả hệ */}
            {showLegend && (
                <div className="animate-in fade-in duration-200">
                    <FamilyTreeLegend />
                </div>
            )}
        </div>
    );
}