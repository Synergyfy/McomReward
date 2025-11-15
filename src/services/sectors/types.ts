export interface CreateSectorRequest {
  name: string;
  imageUrl: string;
}

export interface CategoryInSector {
  id: string;
  name: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface SectorResponse {
  id: string;
  name: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  categories: CategoryInSector[];
}

export interface CreateCategoryRequest {
  name: string;
  sectorId: string;
  imageUrl: string;
}

export interface SubCategoryInCategory {
  id: string;
  name: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CategoryResponse {
  id: string;
  name: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  subCategories: SubCategoryInCategory[];
}

export interface CreateSubCategoryRequest {
  name: string;
  categoryId: string;
  imageUrl: string;
}

export interface SubCategoryResponse {
  id: string;
  name: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}