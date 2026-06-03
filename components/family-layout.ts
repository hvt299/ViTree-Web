import { Edge, Node } from 'reactflow';
import { Member } from '@/types/member';

type MemberMap = Map<string, Member>;

const NODE_WIDTH = 400;
const NODE_HEIGHT = 280;
const X_GAP = 80;
const Y_GAP = 360;

function getId(v: any): string {
    if (!v) return '';
    if (typeof v === 'string') return v;
    return String(v._id ?? v);
}

function buildMemberMap(members: Member[]): MemberMap {
    const map = new Map<string, Member>();
    members.forEach(m => map.set(m._id, m));
    return map;
}

export function buildFamilyLayout(members: Member[]) {
    const memberMap = buildMemberMap(members);
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const mainIds = new Set<string>();
    const inLawIds = new Set<string>();

    const sortedMembers = [...members].sort((a, b) => {
        const aGen = a.gender || 'UNKNOWN';
        const bGen = b.gender || 'UNKNOWN';
        if (aGen === 'MALE' && bGen !== 'MALE') return -1;
        if (aGen !== 'MALE' && bGen === 'MALE') return 1;
        return getId(a).localeCompare(getId(b));
    });

    sortedMembers.forEach(m => {
        if ((m.fatherIds?.length || 0) > 0 || (m.motherIds?.length || 0) > 0) {
            mainIds.add(m._id);
        }
    });

    sortedMembers.forEach(m => {
        if (mainIds.has(m._id)) return;

        if (!m.spouseIds || m.spouseIds.length === 0) {
            mainIds.add(m._id);
            return;
        }

        const spouses = m.spouseIds.map(id => getId(id));
        const hasMainSpouse = spouses.some(sid => mainIds.has(sid));

        if (hasMainSpouse) {
            inLawIds.add(m._id);
        } else {
            mainIds.add(m._id);
        }
    });

    const isMainMember = (m: Member) => mainIds.has(m._id);

    const generationMap = new Map<number, Member[]>();
    for (const m of members) {
        if (!generationMap.has(m.generation)) generationMap.set(m.generation, []);
        generationMap.get(m.generation)!.push(m);
    }

    const genKeys = [...generationMap.keys()].sort((a, b) => a - b);

    for (let gi = 0; gi < genKeys.length; gi++) {
        const gen = genKeys[gi];
        const list = generationMap.get(gen)!;

        const mainMembers = list.filter(m => isMainMember(m));
        const inLaws = list.filter(m => !isMainMember(m));

        mainMembers.sort((a, b) => a.orderInFamily - b.orderInFamily);

        let currentX = 0;
        const placed = new Set<string>();
        const rowNodes: { id: string, x: number, member: Member, isMain: boolean }[] = [];

        for (const m of mainMembers) {
            if (placed.has(m._id)) continue;

            const spouses = inLaws.filter(s =>
                s.spouseIds?.some(id => getId(id) === m._id) ||
                m.spouseIds?.some(id => getId(id) === s._id)
            );

            const unplacedSpouses = spouses.filter(s => !placed.has(s._id));

            const leftSpouses = unplacedSpouses.filter((_, i) => i % 2 === 0).reverse();
            const rightSpouses = unplacedSpouses.filter((_, i) => i % 2 === 1);

            for (const s of leftSpouses) {
                rowNodes.push({ id: s._id, x: currentX, member: s, isMain: false });
                placed.add(s._id);
                currentX += NODE_WIDTH + X_GAP;
            }

            rowNodes.push({ id: m._id, x: currentX, member: m, isMain: true });
            placed.add(m._id);
            currentX += NODE_WIDTH + X_GAP;

            for (const s of rightSpouses) {
                rowNodes.push({ id: s._id, x: currentX, member: s, isMain: false });
                placed.add(s._id);
                currentX += NODE_WIDTH + X_GAP;
            }
        }

        const detachedInLaws = inLaws.filter(law => !placed.has(law._id));
        for (const law of detachedInLaws) {
            rowNodes.push({ id: law._id, x: currentX, member: law, isMain: false });
            placed.add(law._id);
            currentX += NODE_WIDTH + X_GAP;
        }

        const rowWidth = currentX - X_GAP;
        const shiftX = -rowWidth / 2;

        for (const rn of rowNodes) {
            nodes.push({
                id: rn.id,
                type: 'familyMember',
                position: { x: rn.x + shiftX, y: gi * Y_GAP },
                data: { member: rn.member, isMain: rn.isMain },
            });
        }
    }

    const edgeSet = new Set<string>();
    for (const m of members) {
        const childId = m._id;

        for (const f of m.fatherIds || []) {
            const pid = getId(f);
            if (!memberMap.has(pid)) continue;
            const key = `f-${pid}-${childId}`;
            if (edgeSet.has(key)) continue;
            edgeSet.add(key);
            edges.push({
                id: `blood-${key}`, source: pid, target: childId,
                sourceHandle: 'bottom', targetHandle: 'top', type: 'smoothstep',
                style: { stroke: '#3b82f6', strokeWidth: 3 },
            });
        }

        for (const mo of m.motherIds || []) {
            const pid = getId(mo);
            if (!memberMap.has(pid)) continue;
            const key = `m-${pid}-${childId}`;
            if (edgeSet.has(key)) continue;
            edgeSet.add(key);
            edges.push({
                id: `blood-${key}`, source: pid, target: childId,
                sourceHandle: 'bottom', targetHandle: 'top', type: 'smoothstep',
                style: { stroke: '#ec4899', strokeWidth: 3 },
            });
        }
    }

    const marriageSet = new Set<string>();
    for (const m of members) {
        for (const s of m.spouseIds || []) {
            const sid = getId(s);
            if (!memberMap.has(sid)) continue;

            const key = [m._id, sid].sort().join('-');
            if (marriageSet.has(key)) continue;
            marriageSet.add(key);

            const mNode = nodes.find(n => n.id === m._id);
            const sNode = nodes.find(n => n.id === sid);

            let sourceHandle = 'right-source';
            let targetHandle = 'left-target';

            if (mNode && sNode) {
                const isMLeft = mNode.position.x < sNode.position.x;
                sourceHandle = isMLeft ? 'right-source' : 'left-source';
                targetHandle = isMLeft ? 'left-target' : 'right-target';
            }

            edges.push({
                id: `marriage-${key}`, source: m._id, target: sid,
                sourceHandle, targetHandle, type: 'marriage',
            });
        }
    }

    return { nodes, edges };
}