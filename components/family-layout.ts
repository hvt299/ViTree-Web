import { Edge, Node } from '@xyflow/react';
import { Member } from '@/types/member';

export function getNodeDimensions(gen: number): { width: number; height: number } {
    if (gen <= 1) return { width: 140, height: 180 };
    if (gen === 2) return { width: 130, height: 170 };
    return { width: 120, height: 160 };
}

export function getXGap(gen: number): number {
    return gen <= 2 ? 24 : 18;
}

export const DEFAULT_FAMILY_GAP = 36;
export const DEFAULT_Y_GAP = 90;

function getId(v: any): string {
    if (!v) return '';
    if (typeof v === 'string') return v;
    return String(v._id ?? v);
}

const getOrder = (o?: number) => (!o || o === 0 ? 9999 : o);

export function getOrderLabel(order: number, isLastChild?: boolean) {
    if (!order || order === 0) return '';
    if (order === 1) return 'Trưởng';
    if (isLastChild) return 'Út';
    if (order === 2) return 'Thứ 2';
    if (order === 3) return 'Thứ 3';
    return `Thứ ${order}`;
}

export interface FamilyLayoutResult {
    nodes: Node[];
    edges: Edge[];
    bounds: {
        minX: number;
        minY: number;
        maxX: number;
        maxY: number;
        width: number;
        height: number;
    };
}

/**
 * Thuật toán bố cục gia phả truyền thống đơn giản, gọn gàng, trực quan
 */
export function buildFamilyLayout(
    members: Member[],
    collapsedIds: Set<string> = new Set()
): FamilyLayoutResult {
    const memberMap = new Map<string, Member>();
    members.forEach(m => memberMap.set(m._id, m));

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

    // Xác định dòng máu chính (mainIds) và dâu/rể (inLawIds)
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

    // Lập bản đồ con trực tiếp
    const directChildrenMap = new Map<string, Member[]>();
    members.forEach(m => {
        const parents = [...(m.fatherIds || []), ...(m.motherIds || [])].map(getId);
        parents.forEach(pId => {
            if (pId) {
                if (!directChildrenMap.has(pId)) directChildrenMap.set(pId, []);
                if (!directChildrenMap.get(pId)!.some(c => c._id === m._id)) {
                    directChildrenMap.get(pId)!.push(m);
                }
            }
        });
    });

    function countTotalDescendants(mId: string, seen = new Set<string>()): number {
        if (seen.has(mId)) return 0;
        seen.add(mId);
        const children = directChildrenMap.get(mId) || [];
        let count = children.length;
        for (const c of children) {
            count += countTotalDescendants(c._id, seen);
        }
        return count;
    }

    // Xử lý các tiền tổ không có cha mẹ trong DB:
    // QUY TẮC GIA PHẢ VIỆT NAM (Nội tộc):
    // Ưu tiên Nam giới làm đại diện huyết thống nội tộc (mainIds).
    // Phối ngẫu của ông là Dâu (inLawIds / Bà Cả / Bà Hai).
    const remaining = members.filter(m => !mainIds.has(m._id) && !inLawIds.has(m._id));
    remaining.sort((a, b) => {
        const genDiff = (a.generation || 1) - (b.generation || 1);
        if (genDiff !== 0) return genDiff;

        // Ưu tiên Nam giới mang họ tộc đứng trước
        const aMale = a.gender === 'MALE';
        const bMale = b.gender === 'MALE';
        if (aMale && !bMale) return -1;
        if (!aMale && bMale) return 1;

        // Nhiều hậu duệ hơn đứng trước
        const descDiff = countTotalDescendants(b._id) - countTotalDescendants(a._id);
        if (descDiff !== 0) return descDiff;

        return (a.orderInFamily || 0) - (b.orderInFamily || 0);
    });

    remaining.forEach(m => {
        if (!mainIds.has(m._id) && !inLawIds.has(m._id)) {
            mainIds.add(m._id);
            Array.from(spouseMap.get(m._id) || []).forEach(sid => inLawIds.add(sid));
        }
    });

    const isMainMember = (m: Member) => mainIds.has(m._id);

    // Xác định con út trong mỗi gia đình
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
                isMax = false;
                break;
            }
        }
        if (isMax && (m.orderInFamily || 0) > 1) isLastChildMap.set(m._id, true);
    }

    function calculateGenerationY(gen: number): number {
        let y = 40;
        for (let g = 1; g < gen; g++) {
            const dim = getNodeDimensions(g);
            y += dim.height + DEFAULT_Y_GAP;
        }
        return y;
    }

    interface Cluster {
        main: Member;
        spouses: Member[];
        children: Cluster[];
        width: number;
        x: number;
        y: number;
        childCount: number;
        descendantCount: number;
        dim: { width: number; height: number };
    }

    const clusterMap = new Map<string, Cluster>();
    const visited = new Set<string>();

    function createCluster(member: Member): Cluster {
        if (clusterMap.has(member._id)) return clusterMap.get(member._id)!;
        visited.add(member._id);

        const gen = member.generation || 1;
        const dim = getNodeDimensions(gen);
        const y = calculateGenerationY(gen);

        const spouses = members.filter(s => !isMainMember(s) && spouseMap.get(member._id)?.has(s._id));
        spouses.sort((a, b) => {
            const idxA = (member.spouseIds || []).map(getId).indexOf(a._id);
            const idxB = (member.spouseIds || []).map(getId).indexOf(b._id);
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            return (a.orderInFamily || 0) - (b.orderInFamily || 0);
        });

        const rawChildren = members.filter(c =>
            isMainMember(c) && (c.fatherIds?.map(getId).includes(member._id) || c.motherIds?.map(getId).includes(member._id))
        );
        rawChildren.sort((a, b) => getOrder(a.orderInFamily) - getOrder(b.orderInFamily));

        const childCount = rawChildren.length;
        const descendantCount = countTotalDescendants(member._id);

        const childrenClusters: Cluster[] = [];
        const isCollapsed = collapsedIds.has(member._id);

        if (!isCollapsed) {
            for (const child of rawChildren) {
                if (!visited.has(child._id)) {
                    childrenClusters.push(createCluster(child));
                }
            }
        }

        const cluster: Cluster = {
            main: member,
            spouses,
            children: childrenClusters,
            width: 0,
            x: 0,
            y,
            childCount,
            descendantCount,
            dim,
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

    function calcClusterWidth(cluster: Cluster): number {
        const gen = cluster.main.generation || 1;
        const xGap = getXGap(gen);
        const parentNodesCount = 1 + cluster.spouses.length;
        const parentsWidth = parentNodesCount * cluster.dim.width + (parentNodesCount - 1) * xGap;

        let childrenWidth = 0;
        const childGen = gen + 1;
        const childXGap = getXGap(childGen);

        for (const c of cluster.children) childrenWidth += calcClusterWidth(c);
        if (cluster.children.length > 1) childrenWidth += (cluster.children.length - 1) * childXGap;

        cluster.width = Math.max(parentsWidth, childrenWidth);
        return cluster.width;
    }

    function assignClusterPositions(cluster: Cluster, centerX: number) {
        cluster.x = centerX;
        if (cluster.children.length === 0) return;

        const childGen = (cluster.main.generation || 1) + 1;
        const childXGap = getXGap(childGen);

        const totalChildrenWidth = cluster.children.reduce((sum, c) => sum + c.width, 0) + (cluster.children.length - 1) * childXGap;
        let currentX = centerX - totalChildrenWidth / 2;

        for (const c of cluster.children) {
            const childCenterX = currentX + c.width / 2;
            assignClusterPositions(c, childCenterX);
            currentX += c.width + childXGap;
        }
    }

    let currentRootX = 40;
    for (const rc of rootClusters) {
        calcClusterWidth(rc);
        const centerX = currentRootX + rc.width / 2;
        assignClusterPositions(rc, centerX);
        currentRootX += rc.width + DEFAULT_FAMILY_GAP;
    }

    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const placedNodes = new Set<string>();
    const unionNodeIds = new Set<string>();

    function flattenCluster(cluster: Cluster) {
        if (placedNodes.has(cluster.main._id)) return;

        const m = cluster.main;
        const gen = m.generation || 1;
        const dim = cluster.dim;
        const xGap = getXGap(gen);
        const spouses = cluster.spouses;

        const totalNodes = 1 + spouses.length;
        const totalWidth = totalNodes * dim.width + (totalNodes - 1) * xGap;
        let currentLeft = cluster.x - totalWidth / 2 + dim.width / 2;

        let leftSpouses: Member[] = [];
        let rightSpouses: Member[] = [];

        if (spouses.length === 0) {
            leftSpouses = [];
            rightSpouses = [];
        } else if (spouses.length === 1) {
            // 1 vợ: Nam tả nữ hữu -> Chồng bên trái, Vợ bên phải
            leftSpouses = [];
            rightSpouses = [spouses[0]];
        } else if (spouses.length === 2) {
            // 2 vợ: Bà Cả bên trái, Chồng ở giữa, Bà Hai bên phải
            // Thứ tự hiển thị: [Bà Cả] — [Chồng] — [Bà Hai]
            leftSpouses = [spouses[0]];
            rightSpouses = [spouses[1]];
        } else {
            // >= 3 vợ: Bà Cả bên trái, Chồng ở giữa, các bà tiếp theo bên phải
            leftSpouses = [spouses[0]];
            rightSpouses = spouses.slice(1);
        }

        const pushNode = (mem: Member, x: number, y: number, isMain: boolean) => {
            if (!mem || placedNodes.has(mem._id)) return;
            placedNodes.add(mem._id);

            const memGen = mem.generation || gen;
            const memDim = getNodeDimensions(memGen);
            const hasChildren = (directChildrenMap.get(mem._id)?.length || 0) > 0 || cluster.childCount > 0;
            const isCollapsed = collapsedIds.has(mem._id);

            let relationLabel: string | null = null;
            if (!isMain) {
                if (mem.gender === 'MALE') {
                    relationLabel = 'Rể';
                } else if (mem.gender === 'FEMALE') {
                    // Xác định danh xưng: Bà Cả / Bà Hai / Dâu
                    const husband = members.find(h => isMainMember(h) && spouseMap.get(h._id)?.has(mem._id));
                    const husbandSpouses = husband
                        ? members.filter(s => !isMainMember(s) && spouseMap.get(husband._id)?.has(s._id))
                        : [];
                    husbandSpouses.sort((a, b) => {
                        const idxA = (husband?.spouseIds || []).map(getId).indexOf(a._id);
                        const idxB = (husband?.spouseIds || []).map(getId).indexOf(b._id);
                        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                        return 0;
                    });
                    const wifeIdx = husbandSpouses.findIndex(s => s._id === mem._id);
                    if (husbandSpouses.length > 1) {
                        relationLabel = wifeIdx === 0 ? 'Bà Cả' : wifeIdx === 1 ? 'Bà Hai' : `Bà ${wifeIdx + 1}`;
                    } else {
                        relationLabel = (husband?.generation || mem.generation || 1) === 1 ? 'Bà Cả' : 'Dâu';
                    }
                } else {
                    relationLabel = 'Phối ngẫu';
                }
            }

            nodes.push({
                id: mem._id,
                type: 'familyMember',
                position: { x: x - memDim.width / 2, y },
                data: {
                    member: mem,
                    isMain,
                    isLastChild: isLastChildMap.get(mem._id) || false,
                    hasChildren: isMain ? hasChildren : false,
                    isCollapsed: isMain ? isCollapsed : false,
                    childCount: isMain ? cluster.childCount : (directChildrenMap.get(mem._id)?.length || 0),
                    descendantCount: isMain ? cluster.descendantCount : 0,
                    width: memDim.width,
                    height: memDim.height,
                    generation: memGen,
                    roleLabel: getOrderLabel(mem.orderInFamily, isLastChildMap.get(mem._id)),
                    relationLabel,
                },
            });
        };

        for (const s of leftSpouses) {
            pushNode(s, currentLeft, cluster.y, false);
            currentLeft += dim.width + xGap;
        }
        pushNode(m, currentLeft, cluster.y, true);
        currentLeft += dim.width + xGap;
        for (const s of rightSpouses) {
            pushNode(s, currentLeft, cluster.y, false);
            currentLeft += dim.width + xGap;
        }

        for (const c of cluster.children) flattenCluster(c);
    }

    for (const rc of rootClusters) flattenCluster(rc);

    for (const m of members) {
        if (isMainMember(m) && !placedNodes.has(m._id)) {
            const c = createCluster(m);
            calcClusterWidth(c);
            assignClusterPositions(c, currentRootX + c.width / 2);
            currentRootX += c.width + DEFAULT_FAMILY_GAP;
            flattenCluster(c);
        }
    }

    // Chuẩn hóa tọa độ minX = 0, minY = 0
    let minObservedX = Infinity;
    let minObservedY = Infinity;
    let maxObservedX = -Infinity;
    let maxObservedY = -Infinity;

    nodes.forEach(n => {
        const w = (n.data as any)?.width || 120;
        const h = (n.data as any)?.height || 160;
        if (n.position.x < minObservedX) minObservedX = n.position.x;
        if (n.position.y < minObservedY) minObservedY = n.position.y;
        if (n.position.x + w > maxObservedX) maxObservedX = n.position.x + w;
        if (n.position.y + h > maxObservedY) maxObservedY = n.position.y + h;
    });

    if (minObservedX === Infinity) {
        minObservedX = 0; minObservedY = 0; maxObservedX = 800; maxObservedY = 600;
    }

    const shiftX = minObservedX - 40;
    const shiftY = minObservedY - 40;

    nodes.forEach(n => {
        n.position.x -= shiftX;
        n.position.y -= shiftY;
    });

    const totalWidth = Math.max(100, maxObservedX - minObservedX + 80);
    const totalHeight = Math.max(100, maxObservedY - minObservedY + 80);

    // Tạo Union Nodes
    for (const m of members) {
        if (!isMainMember(m) || !placedNodes.has(m._id)) continue;
        const spouses = members.filter(s => !isMainMember(s) && spouseMap.get(m._id)?.has(s._id) && placedNodes.has(s._id));

        for (const s of spouses) {
            const unionId = `union-${[m._id, s._id].sort().join('-')}`;
            if (unionNodeIds.has(unionId)) continue;
            unionNodeIds.add(unionId);

            const mNode = nodes.find(n => n.id === m._id);
            const sNode = nodes.find(n => n.id === s._id);

            if (mNode && sNode) {
                const mDim = getNodeDimensions(m.generation || 1);
                nodes.push({
                    id: unionId,
                    type: 'unionNode',
                    position: {
                        x: (mNode.position.x + sNode.position.x) / 2 + mDim.width / 2,
                        y: mNode.position.y + mDim.height / 2,
                    },
                    data: {},
                });
            }
        }
    }

    // Blood Edges
    const bloodEdgeSet = new Set<string>();
    for (const m of members) {
        const childId = m._id;
        if (!placedNodes.has(childId)) continue;

        const parentIds = [...(m.fatherIds || []), ...(m.motherIds || [])]
            .map(getId)
            .filter(id => memberMap.has(id) && placedNodes.has(id));

        if (parentIds.length === 0) continue;

        const parentMembers = parentIds.map(id => memberMap.get(id)!);
        const mainParents = parentMembers.filter(p => isMainMember(p));
        const inLawParents = parentMembers.filter(p => !isMainMember(p));
        let routed = false;

        // Trường hợp 1: Có cha/mẹ chính và có phối ngẫu (in-laws / mẹ)
        if (mainParents.length === 1 && inLawParents.length > 0) {
            for (const inLaw of inLawParents) {
                const unionId = `union-${[mainParents[0]._id, inLaw._id].sort().join('-')}`;
                if (unionNodeIds.has(unionId)) {
                    const edgeId = `blood-${unionId}-${childId}`;
                    if (!bloodEdgeSet.has(edgeId)) {
                        bloodEdgeSet.add(edgeId);
                        edges.push({
                            id: edgeId,
                            source: unionId,
                            target: childId,
                            sourceHandle: 'bottom',
                            targetHandle: 'top',
                            type: 'blood',
                        });
                        routed = true;
                    }
                }
            }
        }

        // Trường hợp 2: Có cha/mẹ chính nhưng không ghi nhận mẹ cụ thể,
        // nếu cha/mẹ chỉ có 1 phối ngẫu trên sơ đồ thì nối từ điểm hôn phối
        if (!routed && mainParents.length === 1) {
            const placedSpouses = Array.from(spouseMap.get(mainParents[0]._id) || [])
                .filter(sid => !isMainMember(memberMap.get(sid)!) && placedNodes.has(sid));

            if (placedSpouses.length === 1) {
                const unionId = `union-${[mainParents[0]._id, placedSpouses[0]].sort().join('-')}`;
                if (unionNodeIds.has(unionId)) {
                    const edgeId = `blood-${unionId}-${childId}`;
                    if (!bloodEdgeSet.has(edgeId)) {
                        bloodEdgeSet.add(edgeId);
                        edges.push({
                            id: edgeId,
                            source: unionId,
                            target: childId,
                            sourceHandle: 'bottom',
                            targetHandle: 'top',
                            type: 'blood',
                        });
                        routed = true;
                    }
                }
            }
        }

        // Trường hợp 3: Nối trực tiếp từ cha/mẹ chính nếu độc thân hoặc không có điểm hôn phối phù hợp
        if (!routed && mainParents.length === 1) {
            const edgeId = `blood-main-${mainParents[0]._id}-${childId}`;
            if (!bloodEdgeSet.has(edgeId)) {
                bloodEdgeSet.add(edgeId);
                edges.push({
                    id: edgeId,
                    source: mainParents[0]._id,
                    target: childId,
                    sourceHandle: 'bottom',
                    targetHandle: 'top',
                    type: 'blood',
                });
                routed = true;
            }
        }

        if (!routed) {
            for (const pid of parentIds) {
                const key = `fallback-${pid}-${childId}`;
                if (bloodEdgeSet.has(key)) continue;
                bloodEdgeSet.add(key);
                edges.push({
                    id: `blood-${key}`,
                    source: pid,
                    target: childId,
                    sourceHandle: 'bottom',
                    targetHandle: 'top',
                    type: 'blood',
                });
            }
        }
    }

    // Marriage Edges
    const marriageEdgeSet = new Set<string>();
    for (const m of members) {
        if (!placedNodes.has(m._id)) continue;

        for (const s of m.spouseIds || []) {
            const sid = getId(s);
            if (!memberMap.has(sid) || !placedNodes.has(sid)) continue;
            const key = [m._id, sid].sort().join('-');
            if (marriageEdgeSet.has(key)) continue;
            marriageEdgeSet.add(key);

            const mNode = nodes.find(n => n.id === m._id);
            const sNode = nodes.find(n => n.id === sid);
            let sHandle = 'right-source', tHandle = 'left-target';

            if (mNode && sNode) {
                const isMLeft = mNode.position.x < sNode.position.x;
                sHandle = isMLeft ? 'right-source' : 'left-source';
                tHandle = isMLeft ? 'left-target' : 'right-target';
            }
            edges.push({
                id: `marriage-${key}`,
                source: m._id,
                target: sid,
                sourceHandle: sHandle,
                targetHandle: tHandle,
                type: 'marriage',
            });
        }
    }

    return {
        nodes,
        edges,
        bounds: {
            minX: 0,
            minY: 0,
            maxX: totalWidth,
            maxY: totalHeight,
            width: totalWidth,
            height: totalHeight,
        },
    };
}