export interface Member {
    _id: string;
    fullName: string;
    gender: 'MALE' | 'FEMALE' | 'UNKNOWN';
    avatarUrl?: string;
    shortNote?: string;
    isAlive: boolean;
    birthDate?: string;
    deathDate?: string;
    burialPlace?: string;

    fatherId?: string | Member;
    motherId?: string | Member;
    spouseIds?: (string | Member)[];

    orderInFamily: number;
    generation: number;

    createdAt?: string;
    updatedAt?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    totalPages: number;
}