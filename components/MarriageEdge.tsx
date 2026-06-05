'use client';

import { BaseEdge, EdgeLabelRenderer, getStraightPath, type EdgeProps } from '@xyflow/react';
import { Heart } from 'lucide-react';

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
                style={{ stroke: '#f59e0b', strokeWidth: 3, strokeDasharray: '6 6', ...style }}
                markerEnd={markerEnd}
            />
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
                        pointerEvents: 'all',
                    }}
                    className="p-1.5 rounded-full bg-white shadow-sm border border-amber-200 text-amber-500 flex items-center justify-center cursor-default"
                >
                    <Heart size={14} fill="currentColor" />
                </div>
            </EdgeLabelRenderer>
        </>
    );
}