'use client';

import { BaseEdge, type EdgeProps } from '@xyflow/react';

export default function BloodEdge({
    id, sourceX, sourceY, targetX, targetY, style = {}, markerEnd,
}: EdgeProps) {
    // Smooth orthogonal step path with rounded corners
    const midY = sourceY + (targetY - sourceY) / 2;
    const path = `M ${sourceX} ${sourceY} L ${sourceX} ${midY} L ${targetX} ${midY} L ${targetX} ${targetY}`;

    return (
        <BaseEdge
            id={id}
            path={path}
            style={{
                fill: 'none',
                stroke: '#64748b',
                strokeWidth: 2.5,
                strokeLinecap: 'round',
                strokeLinejoin: 'round',
                ...style,
            }}
            markerEnd={markerEnd}
        />
    );
}