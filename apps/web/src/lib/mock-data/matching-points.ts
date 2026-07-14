// src/lib/mock-data/matching-points.ts

export interface MatchingPointsSettings {
  baseRatio: number; // e.g., 1 for 1:1, 0.5 for 1:0.5
  defaultMinPoints: number;
  defaultMaxPoints: number;
  sectorSpecificRanges: {
    sectorId: string;
    minPoints: number;
    maxPoints: number;
  }[];
  campaignSpecificEnabled: {
    campaignId: string;
    enabled: boolean;
  }[];
}

export const mockMatchingPointsSettings: MatchingPointsSettings = {
  baseRatio: 1,
  defaultMinPoints: 100,
  defaultMaxPoints: 1000,
  sectorSpecificRanges: [
    { sectorId: 'sec-1', minPoints: 50, maxPoints: 500 }, // Food & Dining
    { sectorId: 'sec-2', minPoints: 200, maxPoints: 2000 }, // Fashion & Beauty
  ],
  campaignSpecificEnabled: [
    { campaignId: 'camp-001', enabled: true },
    { campaignId: 'camp-002', enabled: false },
  ],
};
