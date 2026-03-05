export interface ICreateOrderItem {
  roomTypeId: string;
  roomQuantity: number;
  checkInDate: Date;
  checkOutDate: Date;
}

export interface IOrderContact {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}
