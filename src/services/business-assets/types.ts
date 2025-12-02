export interface QrPlaquesOverview {
  allocated: number;
  assigned: number;
  sold: number;
  active: number;
}

export interface NfcCardsOverview {
  issued: number;
  active: number;
  pending: number;
}

export interface ScansAndRedemptionsOverview {
  totalScans: number;
  totalRedemptions: number;
}

export interface BusinessAssetOverviewResponse {
  qrPlaques: QrPlaquesOverview;
  nfcCards: NfcCardsOverview;
  scansAndRedemptions: ScansAndRedemptionsOverview;
  resaleRevenue: number;
  groupSize: number;
}

export interface BusinessAssetOverviewQueryDto {
    businessId?: string; // For admin impersonation
}