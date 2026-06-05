'use client';

import { BaseEdge, EdgeProps } from '@xyflow/react';

export default function BloodEdge({
    id, sourceX, sourceY, targetX, targetY, style = {}, markerEnd,
}: EdgeProps) {

    const midY = sourceY + (targetY - sourceY) / 2;

    const path = `M ${sourceX} ${sourceY} L ${sourceX} ${midY} L ${targetX} ${midY} L ${targetX} ${targetY}`;

    return (
        <BaseEdge
            id={id}
            path={path}
            style={{
                ...style,
                fill: 'none',
                stroke: '#94a3b8',
                strokeWidth: 3,
                strokeLinecap: 'round',
                strokeLinejoin: 'round'
            }}
            markerEnd={markerEnd}
        />
    );
}