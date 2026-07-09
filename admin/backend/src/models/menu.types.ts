export type MenuCategory = "Starters" | "Main Course" | "Beverages" | "Desserts";

export type MenuItem = {
  id: string;
  name: string;
  category: MenuCategory;
  singlePrice?: number;
  halfPrice?: number;
  fullPrice?: number;
  isAvailable: boolean;
};
