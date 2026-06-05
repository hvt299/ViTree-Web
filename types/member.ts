export enum Gender {
    MALE = 'MALE',
    FEMALE = 'FEMALE',
    UNKNOWN = 'UNKNOWN',
}

export enum LifeStatus {
    ALIVE = 'ALIVE',
    DECEASED = 'DECEASED',
    UNKNOWN = 'UNKNOWN',
}

export interface LunarDeathAnniversary {
    day?: number;
    month?: number;
    isLeapMonth?: boolean;
    displayText?: string;
}

export interface Member {
    _id: string;
    fullName: string;
    tuName?: string;
    gender: Gender;
    status: LifeStatus;

    avatarUrl?: string;
    shortNote?: string;
    isHeirless?: boolean;

    birthDate?: string;
    deathDate?: string;
    lunarDeathAnniversary?: LunarDeathAnniversary;
    burialPlace?: string;

    fatherIds?: (string | Member)[];
    motherIds?: (string | Member)[];
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