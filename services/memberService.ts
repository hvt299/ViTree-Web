import apiClient from '@/lib/api';
import { Member, PaginatedResponse } from '@/types/member';

export const memberService = {
    getMembers: async (page: number = 1, limit: number = 50, generation?: number) => {
        const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
        if (generation) params.append('generation', generation.toString());
        return apiClient.get<any, PaginatedResponse<Member>>(`/members?${params.toString()}`);
    },

    create: async (data: any) => {
        return apiClient.post<any, Member>('/members', data);
    },

    search: async (keyword: string) => {
        return apiClient.get<any, Member[]>(`/members/search?q=${encodeURIComponent(keyword)}`);
    },

    update: async (id: string, data: any) => {
        return apiClient.patch<any, Member>(`/members/${id}`, data);
    },

    remove: async (id: string) => {
        return apiClient.delete<any, Member>(`/members/${id}`);
    },
};