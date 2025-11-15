import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import {
  CreateSectorRequest,
  SectorResponse,
  CreateCategoryRequest,
  CategoryResponse,
  CreateSubCategoryRequest,
  SubCategoryResponse,
} from './types';

const SECTORS_QUERY_KEY = 'sectors';
const CATEGORIES_QUERY_KEY = 'categories';
const SUBCATEGORIES_QUERY_KEY = 'subcategories';

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
  const { data } = await api.get<SectorResponse[]>('/sectors');
  return data;
};

export const useGetSectors = () => {
  return useQuery({
    queryKey: [SECTORS_QUERY_KEY],
    queryFn: getSectors,
  });
};

// Get Categories (includes nested subcategories)
const getCategories = async (): Promise<CategoryResponse[]> => {
  const { data } = await api.get<CategoryResponse[]>('/categories');
  return data;
};

export const useGetCategories = () => {
  return useQuery({
    queryKey: [CATEGORIES_QUERY_KEY],
    queryFn: getCategories,
  });
};

// Get SubCategories
const getSubCategories = async (): Promise<SubCategoryResponse[]> => {
  const { data } = await api.get<SubCategoryResponse[]>('/subcategories');
  return data;
};

export const useGetSubCategories = () => {
  return useQuery({
    queryKey: [SUBCATEGORIES_QUERY_KEY],
    queryFn: getSubCategories,
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
