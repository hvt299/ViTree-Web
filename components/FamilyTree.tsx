'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, { Background, Controls, MiniMap, useReactFlow, ReactFlowProvider, Handle, Position } from 'reactflow';
import { Maximize, Minimize, Map as MapIcon, User, X } from 'lucide-react';
import 'reactflow/dist/style.css';
import { CSSProperties } from 'react';

import FamilyMemberNode from './FamilyMemberNode';
import FamilyTreeLegend from './FamilyTreeLegend';
import MarriageEdge from './MarriageEdge';
import BloodEdge from './BloodEdge';
import { Member } from '@/types/member';
import { buildFamilyLayout } from './family-layout';

interface Props {
    members: Member[];
    searchQuery?: string;
    genderFilter?: string;
    statusFilter?: string;
}

function UnionNode() {
    return (
        <div className="w-px h-px opacity-0 pointer-events-none">
            <Handle type="source" position={Position.Bottom} id="bottom" />
        </div>
    );
}

const nodeTypes = { familyMember: FamilyMemberNode, unionNode: UnionNode };
const edgeTypes = { marriage: MarriageEdge, blood: BloodEdge };

export default function FamilyTree(props: Props) {
    return (
        <ReactFlowProvider>
            <FamilyTreeInner {...props} />
        </ReactFlowProvider>
    );
}

function FamilyTreeInner({ members, searchQuery = '', genderFilter = '', statusFilter = '' }: Props) {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const { setCenter, getNodes } = useReactFlow();
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const { nodes, edges } = useMemo(() => {
        const layout = buildFamilyLayout(members);
        return {
            nodes: layout.nodes,
            edges: layout.edges.map(edge => {
                if (edge.id.startsWith('marriage-')) return { ...edge, type: 'marriage' };
                return edge;
            }),
        };
    }, [members]);

    const highlightedNodes = useMemo(() => {
        return nodes.map(n => {
            if (n.type === 'unionNode') return n;
            const m = n.data?.member;
            if (!m) return n;

            const isSearchMatch = !searchQuery || m.fullName.toLowerCase().includes(searchQuery.toLowerCase().trim());
            const isGenderMatch = !genderFilter || m.gender === genderFilter;
            const isStatusMatch = !statusFilter || m.status === statusFilter;

            const isFilterMatch = isSearchMatch && isGenderMatch && isStatusMatch;
            const isFilterActive = searchQuery || genderFilter || statusFilter;

            const isSelected = selectedId === n.id;
            const hasSelection = !!selectedId;

            let opacity = 1;
            if (hasSelection) opacity = isSelected ? 1 : 0.2;
            else if (isFilterActive) opacity = isFilterMatch ? 1 : 0.15;

            return {
                ...n,
                style: { ...(n.style as CSSProperties), opacity },
                data: { ...n.data, isSelected }
            };
        });
    }, [selectedId, nodes, searchQuery, genderFilter, statusFilter]);

    const selectedMember = useMemo(() => members.find(m => m._id === selectedId), [members, selectedId]);

    const familyDetails = useMemo(() => {
        if (!selectedMember) return null;
        const getId = (v: any) => typeof v === 'string' ? v : v?._id;

        const ancestors: Member[][] = [];
        let currentParents = members.filter(m =>
            selectedMember.fatherIds?.map(getId).includes(m._id) || selectedMember.motherIds?.map(getId).includes(m._id)
        );

        let loopLimit = 3;
        while (currentParents.length > 0 && loopLimit > 0) {
            ancestors.unshift(currentParents);
            currentParents = members.filter(m => currentParents.some(p => p.fatherIds?.map(getId).includes(m._id) || p.motherIds?.map(getId).includes(m._id)));
            loopLimit--;
        }

        const spouses = members.filter(m => selectedMember.spouseIds?.map(getId).includes(m._id));
        const children = members.filter(m => m.fatherIds?.map(getId).includes(selectedMember._id) || m.motherIds?.map(getId).includes(selectedMember._id));
        const childIds = children.map(c => c._id);
        const grandchildren = members.filter(m => m.fatherIds?.map(getId).some(id => childIds.includes(id)) || m.motherIds?.map(getId).some(id => childIds.includes(id)));

        return { ancestors, spouses, children, grandchildren };
    }, [selectedMember, members]);

    const toggleFullscreen = () => {
        if (!wrapperRef.current) return;
        if (!document.fullscreenElement) wrapperRef.current.requestFullscreen();
        else document.exitFullscreen();
    };

    const focusOnMember = (id: string) => {
        setSelectedId(id);
        const node = getNodes().find(n => n.id === id);
        if (node) setCenter(node.position.x + 200, node.position.y + 140, { zoom: 0.8, duration: 800 });
    };

    return (
        <div className="space-y-3">
            <div ref={wrapperRef} className="h-[80vh] rounded-2xl border bg-linear-to-br from-amber-50 via-white to-orange-50 overflow-hidden relative shadow-sm border-gray-100">

                <div className="absolute top-4 right-4 z-1 flex items-center gap-2">
                    <button onClick={toggleFullscreen} className="p-2.5 bg-white/90 backdrop-blur-md border border-gray-100 shadow-md rounded-xl text-gray-700 hover:bg-gray-50 hover:text-amber-600 transition-all">
                        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                    </button>
                </div>

                {/* TREE */}
                {selectedId && selectedMember && familyDetails && (
                    <div className="absolute top-0 right-0 h-full w-80 sm:w-96 bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.1)] z-50 flex flex-col border-l border-gray-200 animate-in slide-in-from-right duration-300">
                        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50/50 shrink-0">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2"><MapIcon className="w-5 h-5 text-orange-500" /> Chi tiết Nhánh Trực Hệ</h3>
                            <button onClick={() => setSelectedId(null)} className="p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-500 rounded-lg"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-50">
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 text-center relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-12 bg-linear-to-r from-orange-100 to-amber-100" />
                                <div className="relative w-20 h-20 mx-auto rounded-full bg-white border-4 border-white mb-3 overflow-hidden shadow-md flex items-center justify-center z-10">
                                    {selectedMember.avatarUrl ? <img src={selectedMember.avatarUrl} alt="Avatar" className="object-cover w-full h-full" /> : <User size={40} className="text-slate-300" />}
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">{selectedMember.fullName}</h2>
                                {selectedMember.tuName && <p className="text-sm italic text-gray-500 mt-1">Tự: {selectedMember.tuName}</p>}
                                <div className="flex justify-center gap-2 mt-3">
                                    <p className="inline-block px-3 py-1 bg-amber-50 text-amber-700 font-semibold rounded-full border border-amber-200 text-sm">
                                        Đời thứ {selectedMember.generation}
                                    </p>
                                    {selectedMember.isHeirless && (
                                        <p className="inline-block px-3 py-1 bg-red-50 text-red-600 font-semibold rounded-full border border-red-200 text-sm">
                                            🛑 Vô tự
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* KHỐI TIỂU SỬ & NƠI AN TÁNG */}
                            {(selectedMember.shortNote || selectedMember.lunarDeathAnniversary?.displayText || selectedMember.burialPlace) && (
                                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-3 text-sm">
                                    {selectedMember.shortNote && (
                                        <div>
                                            <span className="font-bold text-gray-700 block mb-1">📖 Tiểu sử / Ghi chú:</span>
                                            <p className="text-gray-600 italic leading-relaxed">{selectedMember.shortNote}</p>
                                        </div>
                                    )}
                                    {selectedMember.lunarDeathAnniversary?.displayText && (
                                        <div className="flex items-start gap-2 pt-2 border-t border-gray-50">
                                            <span className="font-bold text-orange-700 whitespace-nowrap">🌙 Ngày giỗ:</span>
                                            <span className="text-orange-600">{selectedMember.lunarDeathAnniversary.displayText}</span>
                                        </div>
                                    )}
                                    {selectedMember.burialPlace && (
                                        <div className="flex items-start gap-2">
                                            <span className="font-bold text-blue-700 whitespace-nowrap">📍 Mộ phần:</span>
                                            <span className="text-blue-600">{selectedMember.burialPlace}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                                <h4 className="font-bold text-gray-800 text-sm mb-5 border-b pb-2">Sơ đồ Truyền thừa</h4>
                                <div className="space-y-5 relative before:absolute before:inset-0 before:ml-4.5 before:h-full before:w-0.5 before:bg-slate-200">
                                    {familyDetails.ancestors.map((genGroup, idx) => (
                                        <div key={`anc-${idx}`} className="relative pl-10">
                                            <div className="absolute left-0 top-1 w-5 h-5 rounded-full border-4 border-white bg-slate-400 z-10 shadow-sm" />
                                            <div className="text-[10px] font-extrabold text-slate-400 mb-1.5 uppercase tracking-wider">Tổ tiên / Sinh thành</div>
                                            <div className="flex flex-wrap gap-2">
                                                {genGroup.map(p => <span key={p._id} onClick={() => focusOnMember(p._id)} className="px-3 py-1 bg-slate-50 text-slate-700 rounded-lg text-sm border border-slate-200 cursor-pointer hover:bg-slate-200">{p.fullName}</span>)}
                                            </div>
                                        </div>
                                    ))}
                                    <div className="relative pl-10">
                                        <div className="absolute left-0 top-1 w-5 h-5 rounded-full border-4 border-white bg-orange-500 z-10 shadow-sm animate-pulse" />
                                        <div className="text-[10px] font-extrabold text-orange-500 mb-1.5 uppercase tracking-wider">Bản thân</div>
                                        <div className="flex flex-col gap-2 items-start">
                                            <span className="px-3 py-1.5 bg-linear-to-r from-orange-500 to-amber-500 text-white font-bold rounded-lg text-sm shadow-md">{selectedMember.fullName}</span>
                                            {familyDetails.spouses.length > 0 && (
                                                <div className="flex flex-wrap gap-2 items-center mt-1">
                                                    <span className="text-slate-400 text-xs italic">+ Phối ngẫu:</span>
                                                    {familyDetails.spouses.map(s => <span key={s._id} onClick={() => focusOnMember(s._id)} className="px-3 py-1 bg-pink-50 text-pink-700 rounded-lg text-sm border border-pink-200 cursor-pointer hover:bg-pink-100">{s.fullName}</span>)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {familyDetails.children.length > 0 && (
                                        <div className="relative pl-10">
                                            <div className="absolute left-0 top-1 w-5 h-5 rounded-full border-4 border-white bg-blue-500 z-10 shadow-sm" />
                                            <div className="text-[10px] font-extrabold text-blue-500 mb-1.5 uppercase tracking-wider">Hậu duệ (Con)</div>
                                            <div className="flex flex-wrap gap-2">
                                                {familyDetails.children.map(c => <span key={c._id} onClick={() => focusOnMember(c._id)} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm border border-blue-200 cursor-pointer hover:bg-blue-100">{c.fullName}</span>)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <ReactFlow
                    nodes={highlightedNodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    fitView
                    fitViewOptions={{ maxZoom: 1, padding: 0.2 }}
                    minZoom={0.01}
                    maxZoom={2}
                    onNodeClick={(_, node) => { if (node.type !== 'unionNode') focusOnMember(node.id); }}
                    onPaneClick={() => setSelectedId(null)}
                >
                    <Controls />
                    {/* BẢN ĐỒ MINIMAP ĐƯỢC TÔ MÀU THEO GIỚI TÍNH */}
                    <MiniMap
                        nodeColor={(n) => {
                            if (n.type === 'unionNode') return 'transparent';
                            const m = n.data?.member;
                            if (!m) return '#eee';
                            if (m.status === 'DECEASED') return '#cbd5e1';
                            if (m.gender === 'MALE') return '#bfdbfe';
                            if (m.gender === 'FEMALE') return '#fbcfe8';
                            return '#e2e8f0';
                        }}
                        nodeBorderRadius={8}
                        maskColor="rgba(0, 0, 0, 0.1)"
                        className="bg-white/80 backdrop-blur-md border border-gray-200 rounded-xl shadow-md overflow-hidden"
                    />
                    <Background gap={24} size={1} />
                </ReactFlow>
            </div>

            {/* LEGEND */}
            <FamilyTreeLegend />
        </div>
    );
}