'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash, GripVertical, Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import SectorDialog from '@/components/admin/sectors/SectorDialog';
import CategoryDialog from '@/components/admin/sectors/CategoryDialog';
import SubCategoryDialog from '@/components/admin/sectors/SubCategoryDialog';
import { DeleteConfirmationDialog } from '@/components/admin/sectors/DeleteConfirmationDialog';
import Image from 'next/image';
import {
  useCreateSector,
  useCreateCategory,
  useCreateSubCategory,
  useUpdateSector,
  useUpdateCategory,
  useUpdateSubCategory,
  useDeleteSector,
  useDeleteCategory,
  useDeleteSubCategory,
  useGetSectors,
  useGetCategoriesBySector,
  useGetSubCategoriesByCategory
} from '@/services/sectors/hook';
import { SectorResponse, CategoryResponse, SubCategoryResponse } from '@/services/sectors/types';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

function isAxiosError(error: unknown): error is AxiosError {
  return (error as AxiosError).isAxiosError !== undefined;
}

// --- Type Definitions ---
type Item = SectorResponse | CategoryResponse | SubCategoryResponse;

interface ItemCardProps {
  item: Item;
  onSelect: () => void;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
  isSelected: boolean;
}

type DialogType = 'sector' | 'category' | 'subCategory';

type DialogState = {
  type: DialogType | null;
  isOpen: boolean;
  data: Item | null;
};

type DeleteTarget = {
  type: DialogType;
  id: string;
  name: string;
}

// --- Reusable Item Card ---
const ItemCard: React.FC<ItemCardProps> = ({ item, onSelect, onEdit, onDelete, isSelected }) => {
  // Check for imageUrl or icon (for backward compatibility with mock data)
  const imageUrl =
    ('imageUrl' in item && item.imageUrl && typeof item.imageUrl === 'string' ? item.imageUrl : null) ||
    null;
  const displayImage = imageUrl && (imageUrl.startsWith('http') || imageUrl.startsWith('blob:') || imageUrl.startsWith('data:'));

  return (
    <Card
      className={`mb-2 cursor-pointer transition-all ${isSelected ? 'border-primary shadow-lg' : 'hover:shadow-md'}`}
      onClick={onSelect}
    >
      <CardContent className="p-3 flex items-center justify-between">
        <div className="flex items-center">
          <GripVertical className="h-5 w-5 text-muted-foreground mr-2" />
          {displayImage && imageUrl ? (
            <div className="relative h-8 w-8 mr-2 rounded-md overflow-hidden bg-muted">
              <Image src={imageUrl} alt={item.name} layout="fill" objectFit="cover" />
            </div>
          ) : null}
          <span className="font-semibold">{item.name}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onEdit(item); }}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onDelete(item); }}>
            <Trash className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// --- Main Page Component ---
export default function SectorsPage() {
  // Hooks for creating sectors, categories, and subcategories
  const createSectorMutation = useCreateSector();
  const createCategoryMutation = useCreateCategory();
  const createSubCategoryMutation = useCreateSubCategory();

  // Hooks for updating sectors, categories, and subcategories
  const updateSectorMutation = useUpdateSector();
  const updateCategoryMutation = useUpdateCategory();
  const updateSubCategoryMutation = useUpdateSubCategory();

  // Hooks for deleting sectors, categories, and subcategories
  const deleteSectorMutation = useDeleteSector();
  const deleteCategoryMutation = useDeleteCategory();
  const deleteSubCategoryMutation = useDeleteSubCategory();

  const [selectedSector, setSelectedSector] = useState<SectorResponse | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  // Fetch data from API
  const { data: sectorsData = [], isLoading: isLoadingSectors, error: sectorsError } = useGetSectors();

  // Fetch categories for selected sector
  const { data: categoriesPaginated, isLoading: isLoadingCategories } = useGetCategoriesBySector(selectedSector?.id);
  const categories = categoriesPaginated?.data || [];

  // Fetch subcategories for selected category
  const { data: subCategoriesPaginated, isLoading: isLoadingSubCategories } = useGetSubCategoriesByCategory(selectedCategory?.id);
  const subCategories = subCategoriesPaginated?.data || [];

  // Set initial selections when data loads
  useEffect(() => {
    if (sectorsData.length > 0 && !selectedSector) {
      // Optional: Select first sector by default, or leave null
      // setSelectedSector(sectorsData[0]); 
    }
  }, [sectorsData, selectedSector]);

  const [dialogState, setDialogState] = useState<DialogState>({
    type: null,
    isOpen: false,
    data: null,
  });

  const openDialog = (type: DialogType, data: Item | null = null) => {
    setDialogState({ type, isOpen: true, data });
  };

  const closeDialog = () => {
    setDialogState({ type: null, isOpen: false, data: null });
  };

  const handleSelectSector = (sector: SectorResponse) => {
    setSelectedSector(sector);
    setSelectedCategory(null);
  };

  const handleSelectCategory = (category: CategoryResponse) => {
    setSelectedCategory(category);
  };

  const handleDeleteRequest = (type: DialogType, item: Item) => {
    setDeleteTarget({ type, id: item.id, name: item.name });
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;

    try {
      const { type, id } = deleteTarget;

      if (type === 'sector') {
        await deleteSectorMutation.mutateAsync(id);
        toast.success('Sector deleted successfully');

        // Clear selections if deleted sector was selected
        if (selectedSector?.id === id) {
          setSelectedSector(null);
          setSelectedCategory(null);
        }
      } else if (type === 'category') {
        await deleteCategoryMutation.mutateAsync(id);
        toast.success('Category deleted successfully');

        // Clear category selection if deleted category was selected
        if (selectedCategory?.id === id) {
          setSelectedCategory(null);
        }
      } else if (type === 'subCategory') {
        await deleteSubCategoryMutation.mutateAsync(id);
        toast.success('Sub-category deleted successfully');
      }

      setDeleteTarget(null);
    } catch (error: unknown) {
      let errorMessage = 'Failed to delete item';
      if (isAxiosError(error)) {
        errorMessage = (error.response?.data as { message: string })?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
      // Don't close the dialog on error so user can retry
    }
  };

  const handleSubmit = async (type: DialogType, data: Partial<Item> & { name: string; imageUrl?: string; sectorId?: string; categoryId?: string }) => {
    try {
      if (type === 'sector') {
        if (!data.name || !data.imageUrl) {
          toast.error('Name and image are required');
          return;
        }

        if (data.id) {
          // Editing sector
          await updateSectorMutation.mutateAsync({
            id: data.id,
            name: data.name,
            imageUrl: data.imageUrl,
          });
          toast.success('Sector updated successfully');
        } else {
          // Creating sector
          await createSectorMutation.mutateAsync({
            name: data.name,
            imageUrl: data.imageUrl,
          });
          toast.success('Sector created successfully');
        }
        closeDialog();
      } else if (type === 'category') {
        const sectorId = data.sectorId || selectedSector?.id;
        if (!data.name || !data.imageUrl || !sectorId) {
          toast.error('Name, image, and sector selection are required');
          return;
        }

        if (data.id) {
          // Editing category
          await updateCategoryMutation.mutateAsync({
            id: data.id,
            name: data.name,
            imageUrl: data.imageUrl,
            sectorId,
          });
          toast.success('Category updated successfully');
        } else {
          // Creating category
          await createCategoryMutation.mutateAsync({
            name: data.name,
            imageUrl: data.imageUrl,
            sectorId,
          });
          toast.success('Category created successfully');
        }
        closeDialog();
      } else if (type === 'subCategory') {
        const categoryId = data.categoryId || selectedCategory?.id;
        if (!data.name || !data.imageUrl || !categoryId) {
          toast.error('Name, image, and category selection are required');
          return;
        }

        if (data.id) {
          // Editing subcategory
          await updateSubCategoryMutation.mutateAsync({
            id: data.id,
            name: data.name,
            imageUrl: data.imageUrl,
            categoryId,
          });
          toast.success('Sub-category updated successfully');
        } else {
          // Creating subcategory
          await createSubCategoryMutation.mutateAsync({
            name: data.name,
            imageUrl: data.imageUrl,
            categoryId,
          });
          toast.success('Sub-category created successfully');
        }
        closeDialog();
      }
    } catch (error: unknown) {
      let errorMessage = `Failed to ${data.id ? 'update' : 'create'} item`;
      if (isAxiosError(error)) {
        errorMessage = (error.response?.data as { message: string })?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    }
  };


  const isLoading = isLoadingSectors;

  if (sectorsError) {
    return (
      <div className="space-y-6 p-4 md:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-destructive mb-4">Failed to load sectors data</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sectors & Categories</h1>
          <p className="text-muted-foreground">
            Organize your business ecosystem by managing sectors, categories, and sub-categories.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* --- Sectors Column --- */}
          <Card className="lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Sectors</CardTitle>
              <Button size="sm" onClick={() => openDialog('sector')}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Sector
              </Button>
            </CardHeader>
            <CardContent>
              {sectorsData.map((sector) => (
                <ItemCard
                  key={sector.id}
                  item={sector}
                  onSelect={() => handleSelectSector(sector)}
                  onEdit={(item) => openDialog('sector', item as SectorResponse)}
                  onDelete={(item) => handleDeleteRequest('sector', item)}
                  isSelected={selectedSector?.id === sector.id}
                />
              ))}
            </CardContent>
          </Card>

          {/* --- Categories Column --- */}
          <Card className="lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Categories</CardTitle>
                {selectedSector && <CardDescription>For {selectedSector.name}</CardDescription>}
              </div>
              <Button size="sm" disabled={!selectedSector} onClick={() => openDialog('category')}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </CardHeader>
            <CardContent>
              {selectedSector ? (
                isLoadingCategories ? (
                  <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>
                ) : categories.length > 0 ? (
                  categories.map((cat) => (
                    <ItemCard
                      key={cat.id}
                      item={cat}
                      onSelect={() => handleSelectCategory(cat)}
                      onEdit={(item) => openDialog('category', item as CategoryResponse)}
                      onDelete={(item) => handleDeleteRequest('category', item)}
                      isSelected={selectedCategory?.id === cat.id}
                    />
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No categories found for this sector.</p>
                )
              ) : (
                <p className="text-sm text-muted-foreground">Select a sector to see its categories.</p>
              )}
            </CardContent>
          </Card>

          {/* --- Sub-Categories Column --- */}
          <Card className="lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Sub-Categories</CardTitle>
                {selectedCategory && <CardDescription>For {selectedCategory.name}</CardDescription>}
              </div>
              <Button size="sm" disabled={!selectedCategory} onClick={() => openDialog('subCategory')}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Sub-Category
              </Button>
            </CardHeader>
            <CardContent>
              {selectedCategory ? (
                isLoadingSubCategories ? (
                  <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>
                ) : subCategories.length > 0 ? (
                  subCategories.map((sub) => (
                    <ItemCard
                      key={sub.id}
                      item={sub}
                      onSelect={() => { }}
                      onEdit={(item) => openDialog('subCategory', item as SubCategoryResponse)}
                      onDelete={(item) => handleDeleteRequest('subCategory', item)}
                      isSelected={false}
                    />
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No sub-categories found.</p>
                )
              ) : (
                <p className="text-sm text-muted-foreground">Select a category to see its sub-categories.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Dialogs */}
      <SectorDialog
        isOpen={dialogState.type === 'sector' && dialogState.isOpen}
        onClose={closeDialog}
        onSubmit={(data) => handleSubmit('sector', data)}
        sector={dialogState.data ? (() => {
          const imgUrl = ('imageUrl' in dialogState.data && dialogState.data.imageUrl && typeof dialogState.data.imageUrl === 'string')
            ? dialogState.data.imageUrl
            : '';
          return {
            id: dialogState.data.id,
            name: dialogState.data.name,
            imageUrl: imgUrl || '',
          };
        })() : null}
      />
      <CategoryDialog
        isOpen={dialogState.type === 'category' && dialogState.isOpen}
        onClose={closeDialog}
        onSubmit={(data) => handleSubmit('category', data)}
        category={dialogState.data ? (() => {
          const imgUrl = ('imageUrl' in dialogState.data && dialogState.data.imageUrl && typeof dialogState.data.imageUrl === 'string')
            ? dialogState.data.imageUrl
            : '';

          // Find sectorId from sectors data if not in dialogState.data
          let sectorId = ('sectorId' in dialogState.data && typeof (dialogState.data as { sectorId?: string }).sectorId === 'string')
            ? (dialogState.data as { sectorId?: string }).sectorId
            : undefined;

          if (!sectorId && dialogState.data.id) {
            // With new structure, we might not easily find parent sector if not selected
            // But usually we are in context of selectedSector
            sectorId = selectedSector?.id;
          }

          return {
            id: dialogState.data.id,
            name: dialogState.data.name,
            imageUrl: imgUrl || '',
            sectorId,
          };
        })() : null}
        sectorName={selectedSector?.name}
        sectorId={selectedSector?.id}
      />
      <SubCategoryDialog
        isOpen={dialogState.type === 'subCategory' && dialogState.isOpen}
        onClose={closeDialog}
        onSubmit={(data) => handleSubmit('subCategory', data)}
        subCategory={dialogState.data ? (() => {
          const imgUrl = ('imageUrl' in dialogState.data && dialogState.data.imageUrl && typeof dialogState.data.imageUrl === 'string')
            ? dialogState.data.imageUrl
            : '';

          // Find categoryId from sectors data if not in dialogState.data
          let categoryId = ('categoryId' in dialogState.data && typeof (dialogState.data as { categoryId?: string }).categoryId === 'string')
            ? (dialogState.data as { categoryId?: string }).categoryId
            : undefined;

          if (!categoryId && dialogState.data.id) {
            categoryId = selectedCategory?.id;
          }

          return {
            id: dialogState.data.id,
            name: dialogState.data.name,
            imageUrl: imgUrl || '',
            categoryId,
          };
        })() : null}
        categoryName={selectedCategory?.name}
        categoryId={selectedCategory?.id}
      />
      <DeleteConfirmationDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={executeDelete}
        itemName={deleteTarget?.name || ''}
        itemType={deleteTarget?.type || ''}
      />
    </div>
  );
}