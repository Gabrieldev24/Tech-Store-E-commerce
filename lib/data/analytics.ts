export interface DailyMetrics {
  date: string;
  revenue: number;
  orders: number;
  customers: number;
}

export interface ProductMetrics {
  name: string;
  sales: number;
  revenue: number;
}

export interface CategoryMetrics {
  name: string;
  value: number;
}

export const dailyMetrics: DailyMetrics[] = [
  { date: "Mar 25", revenue: 2400, orders: 24, customers: 18 },
  { date: "Mar 26", revenue: 1398, orders: 21, customers: 15 },
  { date: "Mar 27", revenue: 9800, orders: 29, customers: 25 },
  { date: "Mar 28", revenue: 3908, orders: 39, customers: 32 },
  { date: "Mar 29", revenue: 4800, orders: 28, customers: 22 },
  { date: "Mar 30", revenue: 3800, orders: 25, customers: 19 },
  { date: "Mar 31", revenue: 4300, orders: 27, customers: 20 },
  { date: "Apr 01", revenue: 2300, orders: 23, customers: 17 },
  { date: "Apr 02", revenue: 2100, orders: 20, customers: 16 },
  { date: "Apr 03", revenue: 2900, orders: 25, customers: 19 },
  { date: "Apr 04", revenue: 3400, orders: 30, customers: 23 },
  { date: "Apr 05", revenue: 4100, orders: 35, customers: 28 },
];

export const topProducts: ProductMetrics[] = [
  { name: "Wireless Headphones Pro", sales: 450, revenue: 89995.5 },
  { name: "Ultra-Fast SSD 2TB", sales: 380, revenue: 68395.2 },
  { name: "Studio Microphone Set", sales: 220, revenue: 54997.8 },
  { name: "Portable Monitor 15.6\"", sales: 185, revenue: 51796.5 },
  { name: "4K Webcam HD", sales: 160, revenue: 23998.4 },
];

export const categorySales: CategoryMetrics[] = [
  { name: "Audio", value: 32 },
  { name: "Video", value: 18 },
  { name: "Storage", value: 25 },
  { name: "Accessories", value: 20 },
  { name: "Display", value: 15 },
];
