'use client';

import { BaseEdge, EdgeLabelRenderer, getStraightPath, type EdgeProps } from 'reactflow';

export default function MarriageEdge({
    id, sourceX, sourceY, targetX, targetY, style = {}, markerEnd,
}: EdgeProps) {

    const [edgePath, labelX, labelY] = getStraightPath({
        sourceX, sourceY, targetX, targetY,
    });

    return (
        <>
            <BaseEdge
                id={id}
                path={edgePath}
                style={{ stroke: '#f59e0b', strokeWidth: 4, strokeDasharray: '8 6', ...style }}
                markerEnd={markerEnd}
            />
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
                        pointerEvents: 'all',
                    }}
                    className="px-2 py-1 rounded-full bg-white shadow-md border-2 border-amber-300 text-sm font-bold text-amber-600 select-none cursor-default hover:scale-110 transition"
                >
                    ❤️
                </div>
            </EdgeLabelRenderer>
        </>
    );
}