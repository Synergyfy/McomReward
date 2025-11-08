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

// --- Mock Data --- 
export const initialSectors: Sector[] = [
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
