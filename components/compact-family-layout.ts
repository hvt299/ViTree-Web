import { Node, Edge } from '@xyflow/react';
import { Member, Gender } from '@/types/member';
import { CompactFamilyNodeData } from './CompactFamilyNode';

export const NODE_WIDTH = 280;
export const NODE_HEIGHT = 145;
export const SIBLING_GAP = 55;
export const BRANCH_GAP = 100;
export const LEVEL_Y_GAP = 205;

function getId(v: unknown): string {
    if (!v) return '';
    if (typeof v === 'string') return v;
    if (typeof v === 'object' && v !== null && '_id' in v) {
        return String((v as { _id: unknown })._id ?? '');
    }
    return String(v);
}

export interface CompactLayoutResult {
    nodes: Node[];
    edges: Edge[];
    bounds: {
        minX: number;
        maxX: number;
        minY: number;
        maxY: number;
        width: number;
        height: number;
    };
}

interface FamilyTreeNode {
    id: string;
    primary: Member;
    spouses: Member[];
    children: FamilyTreeNode[];
    x: number;
    y: number;
    subtreeWidth: number;
}

export function buildCompactFamilyLayout({
    members,
    collapsedIds = new Set<string>(),
    rootMemberId,
    kyThanId,
    selectedId,
    onToggleCollapse,
    onSelect,
}: {
    members: Member[];
    collapsedIds?: Set<string>;
    rootMemberId?: string;
    kyThanId?: string;
    selectedId?: string | null;
    onToggleCollapse?: (id: string) => void;
    onSelect?: (id: string) => void;
}): CompactLayoutResult {
    if (members.length === 0) {
        return {
            nodes: [],
            edges: [],
            bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0, width: 0, height: 0 },
        };
    }

    const memberMap = new Map<string, Member>();
    members.forEach((m) => memberMap.set(m._id, m));

    // Helper: kiểm tra thành viên có cha/mẹ trong danh sách họ hay không
    const hasClanParents = (m: Member): boolean => {
        const fIds = (m.fatherIds || []).map(getId);
        const mIds = (m.motherIds || []).map(getId);
        return fIds.some((f) => memberMap.has(f)) || mIds.some((mo) => memberMap.has(mo));
    };

    // 1. Phân loại Chính xác: Thành viên trực hệ chính (Primary Bloodline) và Dâu/Rể (In-laws / Spouses)
    const directIds = new Set<string>();
    const inLawIds = new Set<string>();

    // Bước 1a: Ai có cha mẹ trong họ -> trực hệ
    members.forEach((m) => {
        if (hasClanParents(m)) {
            directIds.add(m._id);
        }
    });

    // Bước 1b: Với những người chưa có cha mẹ trong họ:
    members.forEach((m) => {
        if (directIds.has(m._id) || inLawIds.has(m._id)) return;

        const spouseIds = (m.spouseIds || []).map(getId);
        const spouses = spouseIds.map((id) => memberMap.get(id)).filter(Boolean) as Member[];

        if (spouses.some((s) => directIds.has(s._id))) {
            inLawIds.add(m._id);
            return;
        }

        // Nếu nhóm này đều không có cha mẹ trong họ (Đời 1 gồm 1 ông lớn + 2 bà vợ)
        if (m.gender === Gender.MALE) {
            directIds.add(m._id);
            spouses.forEach((s) => inLawIds.add(s._id));
        } else if (spouses.length > 0 && spouses.some((s) => s.gender === Gender.MALE)) {
            inLawIds.add(m._id);
            const maleSpouse = spouses.find((s) => s.gender === Gender.MALE);
            if (maleSpouse) {
                directIds.add(maleSpouse._id);
                (maleSpouse.spouseIds || []).forEach((sid) => {
                    const sIdStr = getId(sid);
                    if (sIdStr !== maleSpouse._id) inLawIds.add(sIdStr);
                });
            }
        } else {
            directIds.add(m._id);
        }
    });

    inLawIds.forEach((id) => directIds.delete(id));

    // 2. Tìm danh sách phối ngẫu cho từng chủ hộ trực hệ
    const spouseMap = new Map<string, Member[]>();
    directIds.forEach((dId) => {
        const dMember = memberMap.get(dId);
        if (!dMember) return;
        const sps: Member[] = [];
        dMember.spouseIds?.forEach((sid) => {
            const sMember = memberMap.get(getId(sid));
            if (sMember && !sps.some((x) => x._id === sMember._id)) {
                sps.push(sMember);
            }
        });
        spouseMap.set(dId, sps);
    });

    // 3. Tìm con trực hệ của từng chủ hộ
    const childrenMap = new Map<string, Member[]>();
    directIds.forEach((dId) => {
        const dMember = memberMap.get(dId);
        if (!dMember) return;
        const spouseIdSet = new Set((dMember.spouseIds || []).map(getId));

        const kids = Array.from(directIds)
            .map((id) => memberMap.get(id)!)
            .filter((c) => {
                const fIds = (c.fatherIds || []).map(getId);
                const mIds = (c.motherIds || []).map(getId);
                const matchesP = fIds.includes(dId) || mIds.includes(dId);
                const matchesSpouse =
                    fIds.some((f) => spouseIdSet.has(f)) || mIds.some((m) => spouseIdSet.has(m));
                return matchesP || matchesSpouse;
            })
            // Sắp xếp các con theo thứ tự gia đình (con Trưởng -> Thứ 2 -> Thứ 3...)
            .sort((a, b) => {
                const orderA = a.orderInFamily || 999;
                const orderB = b.orderInFamily || 999;
                return orderA - orderB;
            });

        childrenMap.set(dId, kids);
    });

    // 4. Xác định các node gốc (Root Nodes)
    let rootMembers: Member[] = [];
    if (rootMemberId && memberMap.has(rootMemberId)) {
        if (inLawIds.has(rootMemberId)) {
            const husband = Array.from(directIds)
                .map((id) => memberMap.get(id)!)
                .find((d) => (d.spouseIds || []).map(getId).includes(rootMemberId));
            if (husband) {
                rootMembers = [husband];
            } else {
                rootMembers = [memberMap.get(rootMemberId)!];
            }
        } else {
            rootMembers = [memberMap.get(rootMemberId)!];
        }
    } else {
        rootMembers = Array.from(directIds)
            .map((id) => memberMap.get(id)!)
            .filter((m) => !hasClanParents(m))
            .sort((a, b) => (a.generation || 1) - (b.generation || 1));
    }

    if (rootMembers.length === 0 && members.length > 0) {
        const minGen = Math.min(...members.map((m) => m.generation || 1));
        const gen1Males = members.filter(
            (m) => (m.generation || 1) === minGen && m.gender === Gender.MALE
        );
        rootMembers = gen1Males.length > 0 ? [gen1Males[0]] : [members[0]];
    }

    // 5. Đệ quy xây dựng cây phả hệ
    const visitedInTree = new Set<string>();

    function buildNode(member: Member): FamilyTreeNode {
        visitedInTree.add(member._id);
        const spouses = spouseMap.get(member._id) || [];
        const isCollapsed = collapsedIds.has(member._id);

        let childrenNodes: FamilyTreeNode[] = [];
        if (!isCollapsed) {
            const kids = childrenMap.get(member._id) || [];
            childrenNodes = kids
                .filter((k) => !visitedInTree.has(k._id))
                .map((k) => buildNode(k));
        }

        return {
            id: member._id,
            primary: member,
            spouses,
            children: childrenNodes,
            x: 0,
            y: 0,
            subtreeWidth: NODE_WIDTH,
        };
    }

    const treeRoots = rootMembers.map((m) => buildNode(m));

    // 6. Tính toán bề rộng subtreeWidth
    function calcSubtreeWidth(node: FamilyTreeNode): number {
        if (node.children.length === 0) {
            node.subtreeWidth = NODE_WIDTH;
            return node.subtreeWidth;
        }

        let totalChildrenWidth = 0;
        node.children.forEach((child, index) => {
            const cWidth = calcSubtreeWidth(child);
            totalChildrenWidth += cWidth;
            if (index > 0) totalChildrenWidth += SIBLING_GAP;
        });

        node.subtreeWidth = Math.max(NODE_WIDTH, totalChildrenWidth);
        return node.subtreeWidth;
    }

    treeRoots.forEach((r) => calcSubtreeWidth(r));

    // 7. Gán tọa độ X và Y theo từng đời thẳng hàng ngang
    const minGen = Math.min(...members.map((m) => m.generation || 1), 1);

    function assignPositions(node: FamilyTreeNode, leftX: number, depth: number) {
        const gen = node.primary.generation || depth;
        node.y = (gen - minGen) * LEVEL_Y_GAP;

        if (node.children.length === 0) {
            node.x = leftX + (node.subtreeWidth - NODE_WIDTH) / 2;
            return;
        }

        let currentChildX = leftX;
        const childrenSpan =
            node.children.reduce((acc, c) => acc + c.subtreeWidth, 0) +
            (node.children.length - 1) * SIBLING_GAP;

        if (childrenSpan < node.subtreeWidth) {
            currentChildX = leftX + (node.subtreeWidth - childrenSpan) / 2;
        }

        node.children.forEach((child) => {
            assignPositions(child, currentChildX, depth + 1);
            currentChildX += child.subtreeWidth + SIBLING_GAP;
        });

        const firstChild = node.children[0];
        const lastChild = node.children[node.children.length - 1];
        node.x = (firstChild.x + lastChild.x) / 2;
    }

    let currentRootLeftX = 0;
    treeRoots.forEach((root) => {
        assignPositions(root, currentRootLeftX, root.primary.generation || 1);
        currentRootLeftX += root.subtreeWidth + BRANCH_GAP;
    });

    // 8. Chuyển đổi thành React Flow Nodes và Edges
    const familyNodes: Node<CompactFamilyNodeData>[] = [];
    const edges: Edge[] = [];

    // Mốc Kỷ Thân
    let kyThanGen: number | null = null;
    if (kyThanId && memberMap.has(kyThanId)) {
        kyThanGen = memberMap.get(kyThanId)!.generation || 1;
    }

    function collectNodesAndEdges(node: FamilyTreeNode) {
        const isKyThan = node.id === kyThanId;
        let kyThanDiff: number | null = null;
        if (kyThanGen !== null) {
            kyThanDiff = (node.primary.generation || 1) - kyThanGen;
        }

        const isCollapsed = collapsedIds.has(node.id);
        const isSelected =
            selectedId === node.id || node.spouses.some((s) => s._id === selectedId);
        const rawChildCount = (childrenMap.get(node.id) || []).length;

        familyNodes.push({
            id: node.id,
            type: 'compactFamilyNode',
            position: { x: node.x, y: node.y },
            data: {
                primaryMember: node.primary,
                spouses: node.spouses,
                childCount: rawChildCount,
                isCollapsed,
                isSelected,
                kyThanDiff,
                isKyThan,
                onToggleCollapse,
                onSelect,
            },
        });

        // Đường nối từ node cha xuống các node con
        node.children.forEach((child) => {
            const isChildSelected =
                selectedId === child.id || child.spouses.some((s) => s._id === selectedId);
            const isHighlighted = isSelected || isChildSelected;

            edges.push({
                id: `edge-${node.id}-${child.id}`,
                source: node.id,
                target: child.id,
                type: 'smoothstep',
                animated: isHighlighted,
                style: {
                    stroke: isHighlighted ? '#ea580c' : '#c2410c',
                    strokeWidth: isHighlighted ? 2.5 : 1.75,
                    strokeDasharray: isHighlighted ? '4 2' : undefined,
                },
            });

            collectNodesAndEdges(child);
        });
    }

    treeRoots.forEach((r) => collectNodesAndEdges(r));

    // 9. Tính toán Bounds của các Family Nodes
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    familyNodes.forEach((n) => {
        if (n.position.x < minX) minX = n.position.x;
        if (n.position.x + NODE_WIDTH > maxX) maxX = n.position.x + NODE_WIDTH;
        if (n.position.y < minY) minY = n.position.y;
        if (n.position.y + NODE_HEIGHT > maxY) maxY = n.position.y + NODE_HEIGHT;
    });

    if (familyNodes.length === 0) {
        minX = 0;
        maxX = 0;
        minY = 0;
        maxY = 0;
    }

    // 10. Tạo các dải màu nền xen kẽ nhẹ tương ứng giữa các đời (Generation Bands)
    const genList = familyNodes.map((n) => n.data.primaryMember.generation || 1);
    const layoutMinGen = genList.length > 0 ? Math.min(...genList) : 1;
    const layoutMaxGen = genList.length > 0 ? Math.max(...genList) : 1;

    const bandNodes: Node[] = [];
    const bandWidth = Math.max(maxX - minX + 1000, 2600);
    const bandLeftX = minX - 500;

    for (let g = layoutMinGen; g <= layoutMaxGen; g++) {
        bandNodes.push({
            id: `band-${g}`,
            type: 'generationBand',
            position: { x: bandLeftX, y: (g - minGen) * LEVEL_Y_GAP - 25 },
            data: {
                generation: g,
                width: bandWidth,
                height: LEVEL_Y_GAP,
                isEven: g % 2 === 0,
            },
            draggable: false,
            selectable: false,
            focusable: false,
            zIndex: -1,
        });
    }

    return {
        nodes: [...bandNodes, ...familyNodes],
        edges,
        bounds: {
            minX,
            maxX,
            minY,
            maxY,
            width: maxX - minX,
            height: maxY - minY,
        },
    };
}
