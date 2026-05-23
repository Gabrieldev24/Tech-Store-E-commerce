export interface Order {
  id: string;
  date: string;
  total: number;
  status: "completed" | "pending" | "shipped";
  items: number;
  customer?: string;
}

export const orders: Order[] = [
  {
    id: "ORD-001",
    date: "2024-04-01",
    total: 599.97,
    status: "completed",
    items: 3,
    customer: "John Doe",
  },
  {
    id: "ORD-002",
    date: "2024-04-02",
    total: 249.99,
    status: "completed",
    items: 1,
    customer: "Jane Smith",
  },
  {
    id: "ORD-003",
    date: "2024-04-03",
    total: 1099.98,
    status: "shipped",
    items: 4,
    customer: "Mike Johnson",
  },
  {
    id: "ORD-004",
    date: "2024-04-04",
    total: 429.97,
    status: "completed",
    items: 2,
    customer: "Sarah Williams",
  },
  {
    id: "ORD-005",
    date: "2024-04-05",
    total: 679.96,
    status: "pending",
    items: 3,
    customer: "Tom Brown",
  },
];
