'use client';

import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { useMembers } from '@/context/MemberContext';
import MemberModal from '@/components/MemberModal';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { isModalOpen, closeModal, refreshMembers, members, editingMember } = useMembers();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
            <Header />
            <div className="flex-1 flex flex-col w-full">
                {children}
            </div>
            <Footer />

            {/* Global Member Modal for Add / Edit across all pages */}
            <MemberModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSuccess={() => {
                    closeModal();
                    refreshMembers();
                }}
                members={members}
                editData={editingMember}
            />
        </div>
    );
}
