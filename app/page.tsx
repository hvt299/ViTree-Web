'use client';

import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import OverviewHero from '@/components/overview/OverviewHero';
import ClanStatCards from '@/components/overview/ClanStatCards';
import GenerationBreakdown from '@/components/overview/GenerationBreakdown';
import AncestorsHonor from '@/components/overview/AncestorsHonor';
import DeathAnniversaries from '@/components/overview/DeathAnniversaries';

export default function OverviewPage() {
    return (
        <AppLayout>
            <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
                {/* 1. Hero Welcome & Quick Navigation */}
                <OverviewHero />

                {/* 2. Key Heritage Figures & Demographic Breakdown */}
                <ClanStatCards />

                {/* 3. Generations Distribution */}
                <GenerationBreakdown />

                {/* 4. Ancestors & Founders Honor Roll */}
                <AncestorsHonor />

                {/* 5. Lunar Death Anniversaries & Memorial */}
                <DeathAnniversaries />
            </main>
        </AppLayout>
    );
}