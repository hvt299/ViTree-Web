'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    Node,
    Edge,
    useReactFlow,
    ReactFlowProvider,
    Handle,
    Position,
} from 'reactflow';
import { Loader2 } from 'lucide-react';

import 'reactflow/dist/style.css';
import { CSSProperties } from 'react';

import FamilyMemberNode from './FamilyMemberNode';
import FamilyTreeLegend from './FamilyTreeLegend';
import MarriageEdge from './MarriageEdge';

import { Member } from '@/types/member';
import { buildFamilyLayout } from './family-layout';

import {
    toPng,
} from 'html-to-image';

import jsPDF from 'jspdf';
import FamilyToolbar from './FamilyToolbar';
import { memberService } from '@/services/memberService';
import BloodEdge from './BloodEdge';

interface Props {
    members: Member[];
}

function UnionNode() {
    return (
        <div className="w-px h-px opacity-0 pointer-events-none">
            <Handle type="source" position={Position.Bottom} id="bottom" />
        </div>
    );
}

const nodeTypes = {
    familyMember: FamilyMemberNode,
    unionNode: UnionNode,
};

const edgeTypes = {
    marriage: MarriageEdge,
    blood: BloodEdge,
};

export default function FamilyTree(props: Props) {
    return (
        <ReactFlowProvider>
            <FamilyTreeInner {...props} />
        </ReactFlowProvider>
    );
}

function FamilyTreeInner({ members: initialMembers }: Props) {
    const wrapperRef = useRef<HTMLDivElement>(null);

    const { fitView, getNodes } = useReactFlow();

    const [query, setQuery] = useState('');
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const [allMembers, setAllMembers] =
        useState<Member[]>(initialMembers);

    const [isFetching, setIsFetching] =
        useState(false);

    useEffect(() => {
        let isMounted = true;

        setIsFetching(true);

        memberService
            .getMembers(1, 2000)
            .then(res => {
                if (isMounted) {
                    setAllMembers(res.data);
                }
            })
            .catch(err => {
                console.error(
                    'Lỗi tải full gia phả:',
                    err
                );
            })
            .finally(() => {
                if (isMounted) {
                    setIsFetching(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    const { nodes, edges } = useMemo(() => {
        const layout = buildFamilyLayout(allMembers);

        return {
            nodes: layout.nodes,
            edges: layout.edges.map(edge => {
                if (edge.id.startsWith('marriage-')) {
                    return {
                        ...edge,
                        type: 'marriage',
                    };
                }

                return edge;
            }),
        };
    }, [allMembers]);

    const filteredNodes = useMemo(() => {
        if (!query) return nodes;

        return nodes.map(n => {
            if (n.type === 'unionNode') return n;

            const m = n.data.member;
            if (!m) return n;

            const match =
                m.fullName
                    .toLowerCase()
                    .includes(query.toLowerCase());

            return {
                ...n,
                style: {
                    opacity: match ? 1 : 0.15,
                } as CSSProperties
            };
        });
    }, [query, nodes]);

    const highlightedNodes = useMemo(() => {
        if (!selectedId) return filteredNodes;

        return filteredNodes.map(n => {
            if (n.type === 'unionNode') return n;

            const active = n.id === selectedId;

            return {
                ...n,
                style: {
                    ...(n.style as CSSProperties),
                    border: active ? '3px solid #f59e0b' : undefined,
                    opacity: active ? 1 : 0.3,
                    transform: active ? 'scale(1.05)' : undefined,
                } as CSSProperties,
            };
        });
    }, [selectedId, filteredNodes]);

    const exportPNG = async () => {
        if (!wrapperRef.current) return;

        const dataUrl = await toPng(wrapperRef.current);

        const link = document.createElement('a');
        link.download = 'family-tree.png';
        link.href = dataUrl;
        link.click();
    };

    const exportPDF = async () => {
        if (!wrapperRef.current) return;

        const dataUrl = await toPng(wrapperRef.current);

        const pdf = new jsPDF('landscape', 'px', 'a4');

        const width = pdf.internal.pageSize.getWidth();
        const height = pdf.internal.pageSize.getHeight();

        pdf.addImage(dataUrl, 'PNG', 0, 0, width, height);

        pdf.save('family-tree.pdf');
    };

    const toggleFullscreen = () => {
        if (!wrapperRef.current) return;

        if (!document.fullscreenElement) {
            wrapperRef.current.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    return (
        <div className="space-y-3">

            {/* TOOLBAR */}
            {/* <FamilyToolbar
                onSearch={setQuery}
                onFullscreen={toggleFullscreen}
                onExportPNG={exportPNG}
                onExportPDF={exportPDF}
                onClearFocus={() => setSelectedId(null)}
                hasFocus={!!selectedId}
            /> */}

            {/* TREE */}
            <div
                ref={wrapperRef}
                className="
                    h-[80vh]
                    rounded-2xl
                    border
                    bg-linear-to-br
                    from-amber-50
                    via-white
                    to-orange-50
                    overflow-hidden
                    relative
                    shadow-sm
                    border-gray-100
                "
            >
                {isFetching && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm">
                        <div className="flex flex-col items-center gap-3 p-5 bg-white rounded-2xl shadow-xl border border-orange-100">
                            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                            <span className="font-bold text-orange-700">
                                Đang tải toàn bộ sơ đồ gia phả...
                            </span>
                        </div>
                    </div>
                )}

                <ReactFlow
                    nodes={highlightedNodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    fitView
                    fitViewOptions={{ maxZoom: 1 }}
                    minZoom={0.01}
                    maxZoom={2}
                // onNodeClick={(_, node) => {
                //     setSelectedId(node.id);
                //     setTimeout(() => fitView(), 100);
                // }}
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