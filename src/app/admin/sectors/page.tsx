'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash, GripVertical } from 'lucide-react';
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
import Image from 'next/image';

// --- Type Definitions ---
export interface SubCategory {
  id: string;
  name: string;
  description: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  subCategories: SubCategory[];
}

export interface Sector {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  categories: Category[];
}

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


// --- Mock Data ---
const initialSectors: Sector[] = [
  {
    id: 'sec-1',
    name: 'Food & Dining',
    description: 'Restaurants, cafes, and more.',
    icon: 'https://placehold.co/100x100/FFC107/white?text=🍔',
    color: '#FFC107',
    categories: [
      {
        id: 'cat-1-1',
        name: 'Restaurants',
        description: 'Places to eat.',
        icon: 'https://placehold.co/100x100/FFFFFF/black?text=🍽️',
        subCategories: [
          { id: 'sub-1-1-1', name: 'Fine Dining', description: 'Elegant dining experiences.' },
          { id: 'sub-1-1-2', name: 'Fast Food', description: 'Quick and easy meals.' },
        ],
      },
      {
        id: 'cat-1-2',
        name: 'Cafes',
        description: 'Coffee and snacks.',
        icon: 'https://placehold.co/100x100/FFFFFF/black?text=☕',
        subCategories: [],
      },
    ],
  },
  {
    id: 'sec-2',
    name: 'Fashion & Beauty',
    description: 'Clothing, accessories, and cosmetics.',
    icon: 'https://placehold.co/100x100/E91E63/white?text=👗',
    color: '#E91E63',
    categories: [
      {
        id: 'cat-2-1',
        name: 'Clothing',
        description: 'Apparel for all occasions.',
        icon: 'https://placehold.co/100x100/FFFFFF/black?text=👕',
        subCategories: [
          { id: 'sub-2-1-1', name: 'Women\'s Wear', description: '' },
          { id: 'sub-2-1-2', name: 'Men\'s Wear', description: '' },
        ],
      },
    ],
  },
  {
    id: 'sec-3',
    name: 'Health & Wellness',
    description: 'Gyms, spas, and healthcare.',
    icon: 'https://placehold.co/100x100/4CAF50/white?text=❤️',
    color: '#4CAF50',
    categories: [],
  },
];

// --- Reusable Item Card ---
const ItemCard: React.FC<ItemCardProps> = ({ item, onSelect, onEdit, onDelete, isSelected }) => (
  <Card
    className={`mb-2 cursor-pointer transition-all ${isSelected ? 'border-primary shadow-lg' : 'hover:shadow-md'}`}
    onClick={onSelect}
  >
    <CardContent className="p-3 flex items-center justify-between">
      <div className="flex items-center">
        <GripVertical className="h-5 w-5 text-muted-foreground mr-2" />
        {'icon' in item && item.icon && (item.icon.startsWith('http') || item.icon.startsWith('blob:')) ? (
            <div className="relative h-8 w-8 mr-2 rounded-md overflow-hidden">
                <Image src={item.icon} alt={item.name} layout="fill" objectFit="cover" />
            </div>
        ) : (
            'icon' in item && <span className="mr-2">{item.icon}</span>
        )}
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

// --- Main Page Component ---
export default function SectorsPage() {
  const [sectors, setSectors] = useState<Sector[]>(initialSectors);
  const [selectedSector, setSelectedSector] = useState<Sector | null>(sectors[0] || null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    (sectors[0] && sectors[0].categories[0]) || null
  );


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

  const handleDelete = (type: DialogType, id: string) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;

    if (type === 'sector') {
      setSectors(sectors.filter(s => s.id !== id));
      if (selectedSector?.id === id) {
        setSelectedSector(null);
        setSelectedCategory(null);
      }
    } else if (type === 'category' && selectedSector) {
      const newSectors = sectors.map(s => {
        if (s.id === selectedSector.id) {
          return { ...s, categories: s.categories.filter(c => c.id !== id) };
        }
        return s;
      });
      setSectors(newSectors);
      const updatedSector = newSectors.find(s => s.id === selectedSector.id);
      setSelectedSector(updatedSector || null);
      if (selectedCategory?.id === id) {
        setSelectedCategory(null);
      }
    } else if (type === 'subCategory' && selectedSector && selectedCategory) {
        const newSectors = sectors.map(s => {
            if (s.id === selectedSector.id) {
                const newCategories = s.categories.map(c => {
                    if (c.id === selectedCategory.id) {
                        return { ...c, subCategories: c.subCategories.filter(sc => sc.id !== id) };
                    }
                    return c;
                });
                return { ...s, categories: newCategories };
            }
            return s;
        });
        setSectors(newSectors);
        const updatedSector = newSectors.find(s => s.id === selectedSector.id);
        setSelectedSector(updatedSector || null);
        if (updatedSector) {
            const updatedCategory = updatedSector.categories.find(c => c.id === selectedCategory.id);
            setSelectedCategory(updatedCategory || null);
        }
    }
  };

  const handleSubmit = (type: DialogType, data: Partial<Item> & { name: string }) => {
    if (data.id) { // Editing
      if (type === 'sector') {
        const newSectors = sectors.map(s => s.id === data.id ? { ...s, ...data } as Sector : s);
        setSectors(newSectors);
        if(selectedSector?.id === data.id) {
            const updatedSector = newSectors.find(s => s.id === data.id);
            setSelectedSector(updatedSector || null);
        }
      } else if (type === 'category' && selectedSector) {
        const newSectors = sectors.map(s => {
            if (s.id === selectedSector.id) {
                const newCategories = s.categories.map(c => c.id === data.id ? { ...c, ...data } as Category : c);
                return { ...s, categories: newCategories };
            }
            return s;
        });
        setSectors(newSectors);
        const updatedSector = newSectors.find(s => s.id === selectedSector.id);
        setSelectedSector(updatedSector || null);
        if(selectedCategory?.id === data.id && updatedSector) {
            const updatedCategory = updatedSector.categories.find(c => c.id === data.id);
            setSelectedCategory(updatedCategory || null);
        }
      } else if (type === 'subCategory' && selectedSector && selectedCategory) {
        const newSectors = sectors.map(s => {
            if (s.id === selectedSector.id) {
                const newCategories = s.categories.map(c => {
                    if (c.id === selectedCategory.id) {
                        const newSubCategories = c.subCategories.map(sc => sc.id === data.id ? { ...sc, ...data } as SubCategory : sc);
                        return { ...c, subCategories: newSubCategories };
                    }
                    return c;
                });
                return { ...s, categories: newCategories };
            }
            return s;
        });
        setSectors(newSectors);
        const updatedSector = newSectors.find(s => s.id === selectedSector.id);
        setSelectedSector(updatedSector || null);
        if (updatedSector) {
            const updatedCategory = updatedSector.categories.find(c => c.id === selectedCategory.id);
            setSelectedCategory(updatedCategory || null);
        }
      }
    } else { // Creating
        const newItem = { ...data, id: `${type}-${Date.now()}` };
        if (type === 'sector') {
            setSectors([...sectors, { ...newItem, categories: [] } as Sector]);
        } else if (type === 'category' && selectedSector) {
            const newSectors = sectors.map(s => {
                if (s.id === selectedSector.id) {
                    return { ...s, categories: [...s.categories, { ...newItem, subCategories: [] } as Category] };
                }
                return s;
            });
            setSectors(newSectors);
            const updatedSector = newSectors.find(s => s.id === selectedSector.id);
            setSelectedSector(updatedSector || null);
        } else if (type === 'subCategory' && selectedSector && selectedCategory) {
            const newSectors = sectors.map(s => {
                if (s.id === selectedSector.id) {
                    const newCategories = s.categories.map(c => {
                        if (c.id === selectedCategory.id) {
                            return { ...c, subCategories: [...c.subCategories, newItem as SubCategory] };
                        }
                        return c;
                    });
                    return { ...s, categories: newCategories };
                }
                return s;
            });
            setSectors(newSectors);
            const updatedSector = newSectors.find(s => s.id === selectedSector.id);
            setSelectedSector(updatedSector || null);
            if (updatedSector) {
                const updatedCategory = updatedSector.categories.find(c => c.id === selectedCategory.id);
                setSelectedCategory(updatedCategory || null);
            }
        }
    }
    closeDialog();
  };


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
                onDelete={(item) => handleDelete('sector', item.id)}
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
                    onDelete={(item) => handleDelete('category', item.id)}
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
                    onDelete={(item) => handleDelete('subCategory', item.id)}
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

      {/* Dialogs */} 
      <SectorDialog
        isOpen={dialogState.type === 'sector' && dialogState.isOpen}
        onClose={closeDialog}
        onSubmit={(data) => handleSubmit('sector', data)}
        sector={dialogState.data as Sector | null}
      />
      <CategoryDialog
        isOpen={dialogState.type === 'category' && dialogState.isOpen}
        onClose={closeDialog}
        onSubmit={(data) => handleSubmit('category', data)}
        category={dialogState.data as Category | null}
        sectorName={selectedSector?.name}
      />
      <SubCategoryDialog
        isOpen={dialogState.type === 'subCategory' && dialogState.isOpen}
        onClose={closeDialog}
        onSubmit={(data) => handleSubmit('subCategory', data)}
        subCategory={dialogState.data as SubCategory | null}
        categoryName={selectedCategory?.name}
      />
    </div>
  );
}