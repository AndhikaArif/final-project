export interface Room {
  id: string;
  propertyId: string;
  name: string;
  price: number;
  description: string;
  totalRoom: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoomDTO {
  name: string;
  price: number;
  description: string;
  totalRoom: number;
}

export interface UpdatePayload {
  name?: string;
  price?: number;
  description?: string;
  totalRoom?: number;
}

export type UpdateRoomDTO = Partial<CreateRoomDTO>;
