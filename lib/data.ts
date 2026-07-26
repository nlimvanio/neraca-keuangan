export type Product = {
  id: number;
  name: string;
  sku: string;
  category: string;
  stock: number;
  reorderLevel: number;
};

export const products: Product[] = [
  { id: 1, name: "Wireless Mouse", sku: "WM-001", category: "Accessories", stock: 48, reorderLevel: 10 },
  { id: 2, name: "Mechanical Keyboard", sku: "KB-002", category: "Accessories", stock: 7, reorderLevel: 10 },
  { id: 3, name: "USB-C Hub", sku: "UH-003", category: "Accessories", stock: 24, reorderLevel: 8 },
  { id: 4, name: "27-inch Monitor", sku: "MN-004", category: "Displays", stock: 12, reorderLevel: 5 },
  { id: 5, name: "Laptop Stand", sku: "LS-005", category: "Office", stock: 4, reorderLevel: 6 },
  { id: 6, name: "Webcam", sku: "WC-006", category: "Accessories", stock: 19, reorderLevel: 5 }
];
