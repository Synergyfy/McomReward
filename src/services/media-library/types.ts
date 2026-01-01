export enum AssetType {
    IMAGE = 'IMAGE',
    VIDEO = 'VIDEO',
    DOCUMENT = 'DOCUMENT',
    OTHER = 'OTHER',
}

export enum AssetSource {
    MINE = 'MINE',
    ADMIN = 'ADMIN',
    ALL = 'ALL',
}

export interface CreateLibraryAssetDto {
    url: string;
    title: string;
    description?: string;
    type: AssetType;
    sectorId?: string;
    categoryId?: string;
    subCategoryId?: string;
}

export interface LibraryAsset {
    id: string;
    url: string;
    title: string;
    description: string | null;
    type: AssetType;
    sectorId: string | null;
    categoryId: string | null;
    subCategoryId: string | null;
    source: 'MINE' | 'ADMIN';
    createdAt: string;
    updatedAt: string;
    size?: string; // Optional if backend returns it, or handled on frontend
}

export interface LibraryAssetsQueryData {
    page?: number;
    limit?: number;
    search?: string;
    type?: AssetType;
    sectorId?: string;
    categoryId?: string;
    subCategoryId?: string;
    source?: AssetSource;
}

export interface PaginatedLibraryResponse {
    data: LibraryAsset[];
    total: number;
    page: number;
    limit: number;
    nextPage: number | null;
}
