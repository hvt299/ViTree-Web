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

    const spouseMap = new Map<string, Set<string>>();
    members.forEach(m => spouseMap.set(m._id, new Set()));
    members.forEach(m => {
        m.spouseIds?.forEach(sid => {
            const s = getId(sid);
            if (spouseMap.has(s)) {
                spouseMap.get(m._id)!.add(s);
                spouseMap.get(s)!.add(m._id);
            }
        });
    });

    members.forEach(m => {
        const hasParents = (m.fatherIds?.some(id => memberMap.has(getId(id)))) ||
            (m.motherIds?.some(id => memberMap.has(getId(id))));
        if (hasParents) {
            mainIds.add(m._id);
        }
    });

    let changed = true;
    while (changed) {
        changed = false;
        members.forEach(m => {
            if (mainIds.has(m._id) || inLawIds.has(m._id)) return;

            const spouses = Array.from(spouseMap.get(m._id) || []);
            const hasMainSpouse = spouses.some(sid => mainIds.has(sid));

            if (hasMainSpouse) {
                inLawIds.add(m._id);
                changed = true;
            }
        });
    }

    const remaining = members.filter(m => !mainIds.has(m._id) && !inLawIds.has(m._id));
    remaining.sort((a, b) => {
        if (a.generation !== b.generation) return (a.generation || 1) - (b.generation || 1);
        const aM = a.gender === 'MALE' ? 0 : 1;
        const bM = b.gender === 'MALE' ? 0 : 1;
        if (aM !== bM) return aM - bM;
        return a._id.localeCompare(b._id);
    });

    remaining.forEach(m => {
        if (mainIds.has(m._id) || inLawIds.has(m._id)) return;
        mainIds.add(m._id);

        const spouses = Array.from(spouseMap.get(m._id) || []);
        spouses.forEach(sid => {
            if (!mainIds.has(sid) && !inLawIds.has(sid)) {
                inLawIds.add(sid);
            }
        });
    });

    const isMainMember = (m: Member) => mainIds.has(m._id);

    const childrenMap = new Map<string, Member[]>();
    for (const m of members) {
        const parents = [...(m.fatherIds || []), ...(m.motherIds || [])];
        for (const p of parents) {
            const pId = getId(p);
            if (!childrenMap.has(pId)) childrenMap.set(pId, []);
            childrenMap.get(pId)!.push(m);
        }
    }

    const getOrder = (o?: number) => (!o || o === 0) ? 9999 : o;

    for (const children of childrenMap.values()) {
        children.sort((a, b) => getOrder(a.orderInFamily) - getOrder(b.orderInFamily));
    }

    const roots = members.filter(m =>
        isMainMember(m) &&
        !(m.fatherIds?.some(f => memberMap.has(getId(f)))) &&
        !(m.motherIds?.some(mId => memberMap.has(getId(mId))))
    );

    roots.sort((a, b) => getOrder(a.orderInFamily) - getOrder(b.orderInFamily));

    const lineageOrder = new Map<string, number>();
    let currentIndex = 0;

    function traverseLineage(memberId: string) {
        if (lineageOrder.has(memberId)) return;
        lineageOrder.set(memberId, currentIndex++);
        const children = childrenMap.get(memberId) || [];
        for (const child of children) {
            traverseLineage(child._id);
        }
    }

    for (const root of roots) {
        traverseLineage(root._id);
    }

    for (const m of members) {
        if (isMainMember(m) && !lineageOrder.has(m._id)) {
            traverseLineage(m._id);
        }
    }

    const isLastChildMap = new Map<string, boolean>();
    const validMains = members.filter(m => isMainMember(m) && (m.orderInFamily || 0) > 0);

    for (const m of validMains) {
        const parentsM = [...(m.fatherIds || []), ...(m.motherIds || [])].map(getId);
        if (parentsM.length === 0) continue;

        let isMax = true;
        for (const other of validMains) {
            if (m._id === other._id) continue;
            const parentsOther = [...(other.fatherIds || []), ...(other.motherIds || [])].map(getId);

            const shareParent = parentsM.some(p => parentsOther.includes(p));
            if (shareParent) {
                if ((other.orderInFamily || 0) > (m.orderInFamily || 0)) {
                    isMax = false;
                    break;
                }
            }
        }

        if (isMax && (m.orderInFamily || 0) > 1) {
            isLastChildMap.set(m._id, true);
        }
    }

    const generationMap = new Map<number, Member[]>();
    for (const m of members) {
        const gen = m.generation || 1;
        if (!generationMap.has(gen)) generationMap.set(gen, []);
        generationMap.get(gen)!.push(m);
    }

    const genKeys = [...generationMap.keys()].sort((a, b) => a - b);

    for (let gi = 0; gi < genKeys.length; gi++) {
        const gen = genKeys[gi];
        const list = generationMap.get(gen)!;

        const mainMembers = list.filter(m => isMainMember(m));
        const inLaws = list.filter(m => !isMainMember(m));

        mainMembers.sort((a, b) => {
            const idxA = lineageOrder.get(a._id) ?? 999999;
            const idxB = lineageOrder.get(b._id) ?? 999999;
            return idxA - idxB;
        });

        let currentX = 0;
        const placed = new Set<string>();
        const rowNodes: { id: string, x: number, member: Member, isMain: boolean }[] = [];

        for (const m of mainMembers) {
            if (placed.has(m._id)) continue;

            const spouses = inLaws.filter(s => spouseMap.get(m._id)?.has(s._id));
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
                data: {
                    member: rn.member,
                    isMain: rn.isMain,
                    isLastChild: isLastChildMap.get(rn.id) || false
                },
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