import { Edge, Node } from 'reactflow';
import { Member } from '@/types/member';

type MemberMap = Map<string, Member>;

const NODE_WIDTH = 400;
const NODE_HEIGHT = 280;
const X_GAP = 120;
const Y_GAP = 450;
const FAMILY_GAP = 300;

function getId(v: any): string {
    if (!v) return '';
    if (typeof v === 'string') return v;
    return String(v._id ?? v);
}

interface Cluster {
    main: Member;
    spouses: Member[];
    children: Cluster[];
    width: number;
    x: number;
    y: number;
}

export function buildFamilyLayout(members: Member[]) {
    const memberMap = new Map<string, Member>();
    members.forEach(m => memberMap.set(m._id, m));

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
        if (m.fatherIds?.some(id => memberMap.has(getId(id))) || m.motherIds?.some(id => memberMap.has(getId(id)))) {
            mainIds.add(m._id);
        }
    });

    let changed = true;
    while (changed) {
        changed = false;
        members.forEach(m => {
            if (mainIds.has(m._id) || inLawIds.has(m._id)) return;
            const hasMainSpouse = Array.from(spouseMap.get(m._id) || []).some(sid => mainIds.has(sid));
            if (hasMainSpouse) {
                inLawIds.add(m._id);
                changed = true;
            }
        });
    }

    const remaining = members.filter(m => !mainIds.has(m._id) && !inLawIds.has(m._id));
    remaining.sort((a, b) => (a.generation || 1) - (b.generation || 1));
    remaining.forEach(m => {
        if (!mainIds.has(m._id) && !inLawIds.has(m._id)) {
            mainIds.add(m._id);
            Array.from(spouseMap.get(m._id) || []).forEach(sid => inLawIds.add(sid));
        }
    });

    const isMainMember = (m: Member) => mainIds.has(m._id);
    const getOrder = (o?: number) => (!o || o === 0) ? 9999 : o;

    const isLastChildMap = new Map<string, boolean>();
    const validMains = members.filter(m => isMainMember(m) && (m.orderInFamily || 0) > 0);
    for (const m of validMains) {
        const pM = [...(m.fatherIds || []), ...(m.motherIds || [])].map(getId);
        if (pM.length === 0) continue;
        let isMax = true;
        for (const other of validMains) {
            if (m._id === other._id) continue;
            const pOther = [...(other.fatherIds || []), ...(other.motherIds || [])].map(getId);
            if (pM.some(p => pOther.includes(p)) && (other.orderInFamily || 0) > (m.orderInFamily || 0)) {
                isMax = false; break;
            }
        }
        if (isMax && (m.orderInFamily || 0) > 1) isLastChildMap.set(m._id, true);
    }

    const clusterMap = new Map<string, Cluster>();
    const visited = new Set<string>();

    function createCluster(member: Member): Cluster {
        if (clusterMap.has(member._id)) return clusterMap.get(member._id)!;
        visited.add(member._id);

        const spouses = members.filter(s => !isMainMember(s) && spouseMap.get(member._id)?.has(s._id));
        
        const rawChildren = members.filter(c => 
            isMainMember(c) && (c.fatherIds?.includes(member._id as any) || c.motherIds?.includes(member._id as any))
        );
        rawChildren.sort((a, b) => getOrder(a.orderInFamily) - getOrder(b.orderInFamily));

        const childrenClusters: Cluster[] = [];
        for (const child of rawChildren) {
            if (!visited.has(child._id)) childrenClusters.push(createCluster(child));
        }

        const cluster: Cluster = {
            main: member, spouses, children: childrenClusters,
            width: 0, x: 0, y: ((member.generation || 1) - 1) * Y_GAP
        };
        clusterMap.set(member._id, cluster);
        return cluster;
    }

    const roots = members.filter(m => 
        isMainMember(m) && 
        !(m.fatherIds?.some(f => memberMap.has(getId(f)))) &&
        !(m.motherIds?.some(mId => memberMap.has(getId(mId))))
    ).sort((a, b) => getOrder(a.orderInFamily) - getOrder(b.orderInFamily));

    const rootClusters = roots.map(r => createCluster(r));

    function calcWidth(cluster: Cluster) {
        const parentNodesCount = 1 + cluster.spouses.length;
        const parentsWidth = parentNodesCount * NODE_WIDTH + (parentNodesCount - 1) * X_GAP;
        
        let childrenWidth = 0;
        for (const c of cluster.children) childrenWidth += calcWidth(c);
        if (cluster.children.length > 1) childrenWidth += (cluster.children.length - 1) * X_GAP;
        
        cluster.width = Math.max(parentsWidth, childrenWidth);
        return cluster.width;
    }

    function assignPositions(cluster: Cluster, centerX: number) {
        cluster.x = centerX;
        if (cluster.children.length === 0) return;
        
        const totalChildrenWidth = cluster.children.reduce((sum, c) => sum + c.width, 0) + (cluster.children.length - 1) * X_GAP;
        let currentX = centerX - totalChildrenWidth / 2;
        
        for (const c of cluster.children) {
            const childCenterX = currentX + c.width / 2;
            assignPositions(c, childCenterX);
            currentX += c.width + X_GAP;
        }
    }

    let currentRootX = 0;
    for (const rc of rootClusters) {
        calcWidth(rc);
        const centerX = currentRootX + rc.width / 2;
        assignPositions(rc, centerX);
        currentRootX += rc.width + FAMILY_GAP; 
    }

    const placedNodes = new Set<string>();

    function flattenCluster(cluster: Cluster) {
        if (placedNodes.has(cluster.main._id)) return;
        placedNodes.add(cluster.main._id);
        
        const m = cluster.main;
        const spouses = cluster.spouses;
        
        const totalNodes = 1 + spouses.length;
        const totalWidth = totalNodes * NODE_WIDTH + (totalNodes - 1) * X_GAP;
        let startX = cluster.x - totalWidth / 2 + NODE_WIDTH / 2;
        
        const leftSpouses = spouses.filter((_, i) => i % 2 === 0).reverse();
        const rightSpouses = spouses.filter((_, i) => i % 2 === 1);
        
        const pushNode = (mem: Member, x: number, y: number, isMain: boolean) => {
            nodes.push({
                id: mem._id, type: 'familyMember',
                position: { x: x - NODE_WIDTH / 2, y },
                data: { member: mem, isMain, isLastChild: isLastChildMap.get(mem._id) || false }
            });
        };

        for (const s of leftSpouses) { pushNode(s, startX, cluster.y, false); startX += NODE_WIDTH + X_GAP; }
        pushNode(m, startX, cluster.y, true); 
        startX += NODE_WIDTH + X_GAP;
        for (const s of rightSpouses) { pushNode(s, startX, cluster.y, false); startX += NODE_WIDTH + X_GAP; }
        
        for (const c of cluster.children) flattenCluster(c);
    }

    for (const rc of rootClusters) flattenCluster(rc);

    for (const m of members) {
        if (isMainMember(m) && !placedNodes.has(m._id)) {
            const c = createCluster(m);
            calcWidth(c);
            assignPositions(c, currentRootX + c.width / 2);
            currentRootX += c.width + FAMILY_GAP;
            flattenCluster(c);
        }
    }

    const unionNodeIds = new Set<string>();

    for (const m of members) {
        if (!isMainMember(m)) continue;
        const spouses = members.filter(s => !isMainMember(s) && spouseMap.get(m._id)?.has(s._id));
        
        for (const s of spouses) {
            const unionId = `union-${[m._id, s._id].sort().join('-')}`;
            if (unionNodeIds.has(unionId)) continue;
            unionNodeIds.add(unionId);

            const mNode = nodes.find(n => n.id === m._id);
            const sNode = nodes.find(n => n.id === s._id);

            if (mNode && sNode) {
                nodes.push({
                    id: unionId, type: 'unionNode',
                    position: { 
                        x: (mNode.position.x + sNode.position.x) / 2 + (NODE_WIDTH / 2), 
                        y: mNode.position.y + (NODE_HEIGHT / 2) 
                    },
                    data: {}
                });
            }
        }
    }

    const edgeSet = new Set<string>();
    for (const m of members) {
        const childId = m._id;
        const parentIds = [...(m.fatherIds || []), ...(m.motherIds || [])].map(getId).filter(id => memberMap.has(id));
        if (parentIds.length === 0) continue;

        const parentMembers = parentIds.map(id => memberMap.get(id)!);
        const mainParents = parentMembers.filter(p => isMainMember(p));
        const inLawParents = parentMembers.filter(p => !isMainMember(p));
        let routed = false;

        if (mainParents.length === 1 && inLawParents.length === 1) {
            const unionId = `union-${[mainParents[0]._id, inLawParents[0]._id].sort().join('-')}`;
            if (unionNodeIds.has(unionId)) {
                edges.push({
                    id: `blood-${unionId}-${childId}`, source: unionId, target: childId,
                    sourceHandle: 'bottom', targetHandle: 'top', type: 'blood'
                });
                routed = true;
            }
        }

        if (!routed && mainParents.length === 1) {
            edges.push({
                id: `blood-main-${mainParents[0]._id}-${childId}`, source: mainParents[0]._id, target: childId,
                sourceHandle: 'bottom', targetHandle: 'top', type: 'blood'
            });
            routed = true;
        }

        if (!routed) {
            for (const pid of parentIds) {
                const key = `fallback-${pid}-${childId}`;
                if (edgeSet.has(key)) continue;
                edgeSet.add(key);
                edges.push({
                    id: `blood-${key}`, source: pid, target: childId,
                    sourceHandle: 'bottom', targetHandle: 'top', type: 'blood'
                });
            }
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
            let sHandle = 'right-source', tHandle = 'left-target';

            if (mNode && sNode) {
                const isMLeft = mNode.position.x < sNode.position.x;
                sHandle = isMLeft ? 'right-source' : 'left-source';
                tHandle = isMLeft ? 'left-target' : 'right-target';
            }
            edges.push({
                id: `marriage-${key}`, source: m._id, target: sid,
                sourceHandle: sHandle, targetHandle: tHandle, type: 'marriage',
            });
        }
    }

    return { nodes, edges };
}