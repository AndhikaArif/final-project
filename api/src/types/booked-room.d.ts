export interface IRoomAvailability {
  roomTypeId: string;
  checkInDate: Date;
  checkOutDate: Date;
}

export interface IIsRoomAvailable {
  roomId: string;
  checkInDate: Date;
  checkOutDate: Date;
}
