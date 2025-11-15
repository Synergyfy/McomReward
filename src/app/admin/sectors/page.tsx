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
import { useCreateSector, useCreateCategory, useCreateSubCategory, useGetSectors, useGetCategories } from '@/services/sectors/hook';
import { SectorResponse, CategoryResponse } from '@/services/sectors/types';
import toast from 'react-hot-toast';

// Transform API types to match page structure
type Sector = {
  id: string;
  name: string;
  imageUrl: string | null;
  categories: Category[];
};

type Category = {
  id: string;
  name: string;
  imageUrl: string | null;
  subCategories: SubCategory[];
};

type SubCategory = {
  id: string;
  name: string;
  imageUrl: string | null;
};

// --- Type Definitions ---
type Item = Sector | Category | SubCategory;

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
    ('icon' in item && typeof item.icon === 'string' ? item.icon : null) ||
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
  // Fetch data from API
  const { data: sectorsData, isLoading: isLoadingSectors, error: sectorsError } = useGetSectors();
  const { data: categoriesData, isLoading: isLoadingCategories } = useGetCategories();

  // Hooks for creating sectors, categories, and subcategories
  const createSectorMutation = useCreateSector();
  const createCategoryMutation = useCreateCategory();
  const createSubCategoryMutation = useCreateSubCategory();

  // Merge sectors and categories data to include subcategories
  const sectors = useMemo(() => {
    if (!sectorsData || !categoriesData) return [];

    // Create a map of category ID to category with subcategories
    const categoryMap = new Map<string, CategoryResponse>();
    categoriesData.forEach(cat => {
      categoryMap.set(cat.id, cat);
    });

    // Merge sectors with their categories' subcategories
    return sectorsData.map(sector => ({
      id: sector.id,
      name: sector.name,
      imageUrl: sector.imageUrl,
      categories: sector.categories.map(cat => {
        const categoryWithSubs = categoryMap.get(cat.id);
        return {
          id: cat.id,
          name: cat.name,
          imageUrl: cat.imageUrl,
          subCategories: categoryWithSubs?.subCategories.map(sub => ({
            id: sub.id,
            name: sub.name,
            imageUrl: sub.imageUrl,
          })) || [],
        };
      }),
    }));
  }, [sectorsData, categoriesData]);

  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  // Set initial selections when data loads
  useEffect(() => {
    if (sectors.length > 0 && !selectedSector) {
      setSelectedSector(sectors[0]);
      if (sectors[0].categories.length > 0) {
        setSelectedCategory(sectors[0].categories[0]);
      }
    }
  }, [sectors, selectedSector]);

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

  const handleSelectSector = (sector: Sector) => {
    setSelectedSector(sector);
    setSelectedCategory(null);
  };

  const handleSelectCategory = (category: Category) => {
    setSelectedCategory(category);
  };

  const handleDeleteRequest = (type: DialogType, item: Item) => {
    setDeleteTarget({ type, id: item.id, name: item.name });
  };

  const executeDelete = () => {
    if (!deleteTarget) return;
    // TODO: Implement delete functionality when endpoints are available
    toast.error('Delete functionality not yet implemented');
    setDeleteTarget(null);
  };

  const handleSubmit = async (type: DialogType, data: Partial<Item> & { name: string; imageUrl?: string; sectorId?: string; categoryId?: string }) => {
    if (data.id) { 
      // Editing - TODO: Implement edit functionality when endpoints are available
      toast.error('Edit functionality not yet implemented');
      closeDialog();
      return;
    }

    // Creating new items
    try {
      if (type === 'sector') {
        if (!data.name || !data.imageUrl) {
          toast.error('Name and image are required');
          return;
        }
        await createSectorMutation.mutateAsync({
          name: data.name,
          imageUrl: data.imageUrl,
        });
        toast.success('Sector created successfully');
        closeDialog();
      } else if (type === 'category' && selectedSector) {
        if (!data.name || !data.imageUrl || !selectedSector.id) {
          toast.error('Name, image, and sector selection are required');
          return;
        }
        await createCategoryMutation.mutateAsync({
          name: data.name,
          imageUrl: data.imageUrl,
          sectorId: selectedSector.id,
        });
        toast.success('Category created successfully');
        closeDialog();
      } else if (type === 'subCategory' && selectedCategory) {
        if (!data.name || !data.imageUrl || !selectedCategory.id) {
          toast.error('Name, image, and category selection are required');
          return;
        }
        await createSubCategoryMutation.mutateAsync({
          name: data.name,
          imageUrl: data.imageUrl,
          categoryId: selectedCategory.id,
        });
        toast.success('Sub-category created successfully');
        closeDialog();
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create item';
      toast.error(errorMessage);
    }
  };


  const isLoading = isLoadingSectors || isLoadingCategories;

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
            {sectors.map((sector) => (
              <ItemCard
                key={sector.id}
                item={sector}
                onSelect={() => handleSelectSector(sector)}
                onEdit={(item) => openDialog('sector', item as Sector)}
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
              selectedSector.categories.length > 0 ? (
                selectedSector.categories.map((cat) => (
                  <ItemCard
                    key={cat.id}
                    item={cat}
                    onSelect={() => handleSelectCategory(cat)}
                    onEdit={(item) => openDialog('category', item as Category)}
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
              selectedCategory.subCategories.length > 0 ? (
                selectedCategory.subCategories.map((sub) => (
                  <ItemCard
                    key={sub.id}
                    item={sub}
                    onSelect={() => {}}
                    onEdit={(item) => openDialog('subCategory', item as SubCategory)}
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
            : (('icon' in dialogState.data && typeof dialogState.data.icon === 'string') ? dialogState.data.icon : '');
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
            : (('icon' in dialogState.data && typeof dialogState.data.icon === 'string') ? dialogState.data.icon : '');
          return {
            id: dialogState.data.id,
            name: dialogState.data.name,
            imageUrl: imgUrl || '',
            sectorId: ('sectorId' in dialogState.data && typeof dialogState.data.sectorId === 'string') ? dialogState.data.sectorId : undefined,
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
          return {
            id: dialogState.data.id,
            name: dialogState.data.name,
            imageUrl: imgUrl || '',
            categoryId: ('categoryId' in dialogState.data && typeof dialogState.data.categoryId === 'string') ? dialogState.data.categoryId : undefined,
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