// src/lib/mock-data/plaque-groups.ts

export interface PlaqueGroup {
  id: string;
  name: string; // e.g., "Standard Retail", "Premium Dining"
  description: string;
}

export const mockPlaqueGroups: PlaqueGroup[] = [
  {
    id: 'group-retail',
    name: 'Standard Retail',
    description: 'Plaques for general retail businesses.',
  },
  {
    id: 'group-dining',
    name: 'Premium Dining',
    description: 'Plaques for high-end restaurants and cafes.',
  },
  {
    id: 'group-service',
    name: 'Service Providers',
    description: 'Plaques for various service-based businesses.',
  },
  {
    id: 'group-event',
    name: 'Event Venues',
    description: 'Plaques for event spaces and entertainment venues.',
  },
];
