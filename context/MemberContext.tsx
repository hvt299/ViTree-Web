'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import Cookies from 'js-cookie';
import { memberService } from '@/services/memberService';
import { Member, LifeStatus, Gender } from '@/types/member';

interface MemberContextType {
    members: Member[];
    loading: boolean;
    error: string | null;
    maxGeneration: number;
    aliveCount: number;
    deceasedCount: number;
    maleCount: number;
    femaleCount: number;
    unknownGenderCount: number;
    refreshMembers: () => Promise<void>;
    isModalOpen: boolean;
    editingMember: Member | null;
    openAddModal: () => void;
    openEditModal: (member: Member) => void;
    closeModal: () => void;
    deleteMember: (id: string, name: string) => Promise<boolean>;
}

const MemberContext = createContext<MemberContextType | undefined>(undefined);

export function MemberProvider({ children }: { children: React.ReactNode }) {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingMember, setEditingMember] = useState<Member | null>(null);

    const refreshMembers = useCallback(async () => {
        const token = Cookies.get('access_token');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const res = await memberService.getMembers(1, 5000);
            const data = res.data || [];
            setMembers(data);
        } catch (err) {
            console.error('Lỗi khi tải dữ liệu thành viên:', err);
            setError('Không thể tải dữ liệu thành viên.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshMembers();
    }, [refreshMembers]);

    const maxGeneration = useMemo(() => {
        if (members.length === 0) return 0;
        return Math.max(...members.map(m => m.generation || 1));
    }, [members]);

    const aliveCount = useMemo(() => {
        return members.filter(m => m.status === LifeStatus.ALIVE).length;
    }, [members]);

    const deceasedCount = useMemo(() => {
        return members.filter(m => m.status === LifeStatus.DECEASED).length;
    }, [members]);

    const maleCount = useMemo(() => {
        return members.filter(m => m.gender === Gender.MALE).length;
    }, [members]);

    const femaleCount = useMemo(() => {
        return members.filter(m => m.gender === Gender.FEMALE).length;
    }, [members]);

    const unknownGenderCount = useMemo(() => {
        return members.filter(m => m.gender !== Gender.MALE && m.gender !== Gender.FEMALE).length;
    }, [members]);

    const openAddModal = useCallback(() => {
        setEditingMember(null);
        setIsModalOpen(true);
    }, []);

    const openEditModal = useCallback((member: Member) => {
        setEditingMember(member);
        setIsModalOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        setEditingMember(null);
    }, []);

    const deleteMember = useCallback(async (id: string, name: string): Promise<boolean> => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa thành viên "${name}" không? Thao tác này không thể hoàn tác.`)) {
            return false;
        }
        try {
            await memberService.remove(id);
            await refreshMembers();
            return true;
        } catch (err) {
            console.error('Lỗi khi xóa thành viên:', err);
            alert('Có lỗi xảy ra khi xóa thành viên!');
            return false;
        }
    }, [refreshMembers]);

    const value = useMemo<MemberContextType>(() => ({
        members,
        loading,
        error,
        maxGeneration,
        aliveCount,
        deceasedCount,
        maleCount,
        femaleCount,
        unknownGenderCount,
        refreshMembers,
        isModalOpen,
        editingMember,
        openAddModal,
        openEditModal,
        closeModal,
        deleteMember,
    }), [
        members,
        loading,
        error,
        maxGeneration,
        aliveCount,
        deceasedCount,
        maleCount,
        femaleCount,
        unknownGenderCount,
        refreshMembers,
        isModalOpen,
        editingMember,
        openAddModal,
        openEditModal,
        closeModal,
        deleteMember,
    ]);

    return (
        <MemberContext.Provider value={value}>
            {children}
        </MemberContext.Provider>
    );
}

export function useMembers() {
    const context = useContext(MemberContext);
    if (!context) {
        throw new Error('useMembers phải được sử dụng bên trong MemberProvider');
    }
    return context;
}
