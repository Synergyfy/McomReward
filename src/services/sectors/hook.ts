import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import {
  CreateSectorRequest,
  SectorResponse,
  CreateCategoryRequest,
  CategoryResponse,
  CreateSubCategoryRequest,
  SubCategoryResponse,
  PaginatedResponse,
} from './types';

const SECTORS_QUERY_KEY = 'sectors';
const CATEGORIES_QUERY_KEY = 'categories';
const SUBCATEGORIES_QUERY_KEY = 'subcategories';
const SECTOR_CATEGORIES_QUERY_KEY = 'sector_categories';
const CATEGORY_SUBCATEGORIES_QUERY_KEY = 'category_subcategories';

// Create Sector
const createSector = async (sectorData: CreateSectorRequest): Promise<SectorResponse> => {
  const { data } = await api.post<SectorResponse>('/sectors', sectorData);
  return data;
};

export const useCreateSector = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSector,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SECTORS_QUERY_KEY] });
    },
  });
};

// Get Sectors (includes nested categories)
const getSectors = async (): Promise<SectorResponse[]> => {
  const { data } = await api.get<SectorResponse[]>('/sectors', {
    _skipAuthRedirect: true,
  } as any);
  return data;
};

export const useGetSectors = () => {
  return useQuery({
    queryKey: [SECTORS_QUERY_KEY],
    queryFn: getSectors,
  });
};



// Get Categories by Sector
const getCategoriesBySector = async (sectorId: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse<CategoryResponse>> => {
  const { data } = await api.get<PaginatedResponse<CategoryResponse>>(`/sectors/${sectorId}/categories`, {
    params: { page, limit },
    _skipAuthRedirect: true,
  } as any);
  return data;
};

export const useGetCategoriesBySector = (sectorId: string | undefined, page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: [SECTOR_CATEGORIES_QUERY_KEY, sectorId, page, limit],
    queryFn: () => getCategoriesBySector(sectorId!, page, limit),
    enabled: !!sectorId,
  });
};

// Get SubCategories by Category
const getSubCategoriesByCategory = async (categoryId: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse<SubCategoryResponse>> => {
  const { data } = await api.get<PaginatedResponse<SubCategoryResponse>>(`/categories/${categoryId}/subcategories`, {
    params: { page, limit },
    _skipAuthRedirect: true,
  } as any);
  return data;
};

export const useGetSubCategoriesByCategory = (categoryId: string | undefined, page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: [CATEGORY_SUBCATEGORIES_QUERY_KEY, categoryId, page, limit],
    queryFn: () => getSubCategoriesByCategory(categoryId!, page, limit),
    enabled: !!categoryId,
  });
};

// Create Category
const createCategory = async (categoryData: CreateCategoryRequest): Promise<CategoryResponse> => {
  const { data } = await api.post<CategoryResponse>('/categories', categoryData);
  return data;
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [SECTORS_QUERY_KEY] });
    },
  });
};

// Create SubCategory
const createSubCategory = async (
  subCategoryData: CreateSubCategoryRequest
): Promise<SubCategoryResponse> => {
  const { data } = await api.post<SubCategoryResponse>('/subcategories', subCategoryData);
  return data;
};

export const useCreateSubCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSubCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUBCATEGORIES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [SECTORS_QUERY_KEY] });
    },
  });
};

// Update Sector
const updateSector = async ({
  id,
  ...sectorData
}: CreateSectorRequest & { id: string }): Promise<SectorResponse> => {
  const { data } = await api.patch<SectorResponse>(`/sectors/${id}`, sectorData);
  return data;
};

export const useUpdateSector = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSector,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SECTORS_QUERY_KEY] });
    },
  });
};

// Update Category
const updateCategory = async ({
  id,
  ...categoryData
}: CreateCategoryRequest & { id: string }): Promise<CategoryResponse> => {
  const { data } = await api.patch<CategoryResponse>(`/categories/${id}`, categoryData);
  return data;
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [SECTORS_QUERY_KEY] });
    },
  });
};

// Update SubCategory
const updateSubCategory = async ({
  id,
  ...subCategoryData
}: CreateSubCategoryRequest & { id: string }): Promise<SubCategoryResponse> => {
  const { data } = await api.patch<SubCategoryResponse>(`/subcategories/${id}`, subCategoryData);
  return data;
};

export const useUpdateSubCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSubCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUBCATEGORIES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [SECTORS_QUERY_KEY] });
    },
  });
};

// Delete Sector
const deleteSector = async (id: string): Promise<void> => {
  await api.delete(`/sectors/${id}`);
};

export const useDeleteSector = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSector,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SECTORS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] });
    },
  });
};

// Delete Category
const deleteCategory = async (id: string): Promise<void> => {
  await api.delete(`/categories/${id}`);
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [SECTORS_QUERY_KEY] });
    },
  });
};

// Delete SubCategory
const deleteSubCategory = async (id: string): Promise<void> => {
  await api.delete(`/subcategories/${id}`);
};

export const useDeleteSubCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSubCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUBCATEGORIES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [SECTORS_QUERY_KEY] });
    },
  });
};
