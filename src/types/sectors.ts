export interface CreateSectorRequest {
  name: string;
  imageUrl: string;
}

export interface SectorResponse {
  id: string;
  name: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
