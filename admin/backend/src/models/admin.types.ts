export type AdminSession = {
  adminId: string;
  restaurantId: string;
  email: string;
  active: boolean;
};

export type RestaurantProfile = {
  restaurantId: string;
  name: string;
  tableCount: number;
  bankAccountMasked?: string;
};
