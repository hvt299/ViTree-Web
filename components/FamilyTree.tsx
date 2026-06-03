'use client';

import { useMemo, useRef, useState } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    Node,
    Edge,
    useReactFlow,
    ReactFlowProvider,
} from 'reactflow';

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

interface Props {
    members: Member[];
}

const nodeTypes = {
    familyMember: FamilyMemberNode,
};

const edgeTypes = {
    marriage: MarriageEdge,
};

export default function FamilyTree(props: Props) {
    return (
        <ReactFlowProvider>
            <FamilyTreeInner {...props} />
        </ReactFlowProvider>
    );
}

function FamilyTreeInner({ members }: Props) {
    const wrapperRef = useRef<HTMLDivElement>(null);

    const { fitView, getNodes } = useReactFlow();

    const [query, setQuery] = useState('');
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const { nodes, edges } = useMemo(() => {
        const layout = buildFamilyLayout(members);

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
    }, [members]);

    const filteredNodes = useMemo(() => {
        if (!query) return nodes;

        return nodes.map(n => {
            const m = n.data.member;

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
                    rounded-3xl
                    border
                    bg-linear-to-br
                    from-amber-50
                    via-white
                    to-orange-50
                    overflow-hidden
                "
            >
                <ReactFlow
                    nodes={highlightedNodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    fitView
                    minZoom={0.1}
                    // onNodeClick={(_, node) => {
                    //     setSelectedId(node.id);
                    //     setTimeout(() => fitView(), 100);
                    // }}
                >
                    <Controls />
                    <MiniMap />
                    <Background gap={24} size={1} />
                </ReactFlow>
            </div>

            {/* LEGEND */}
            <FamilyTreeLegend />
        </div>
    );
}