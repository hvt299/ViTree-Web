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
                style={{
                    stroke: '#d97706',
                    strokeWidth: 2,
                    strokeDasharray: '5 4',
                    ...style,
                }}
                markerEnd={markerEnd}
            />
            {/* Position wrapper: coordinates ONLY, no transform overrides on hover */}
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
                        pointerEvents: 'all',
                    }}
                    className="nodrag nopan"
                >
                    {/* Inner badge: safe hover scaling that doesn't conflict with coordinate transform */}
                    <div
                        className="w-5 h-5 rounded-full bg-white dark:bg-slate-800 shadow-xs border border-amber-300 dark:border-amber-700 text-amber-500 flex items-center justify-center cursor-default select-none transition-transform duration-150 hover:scale-125"
                        title="Quan hệ phối ngẫu"
                    >
                        <Heart size={10} className="fill-amber-500 text-amber-500" />
                    </div>
                </div>
            </EdgeLabelRenderer>
        </>
    );
}