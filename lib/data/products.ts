export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  image: string;
  additionalImages?: string[];
  category: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  specs?: string[];
}

export const products: Product[] = [
  {
    id: "1",
    name: "Wireless Headphones Pro",
    price: 199.99,
    originalPrice: 299.99,
    description: "Premium wireless headphones with noise cancellation and 30-hour battery life. Experience crystal clear sound with our advanced noise cancellation technology. Perfect for music lovers, professionals, and anyone who demands premium audio quality.",
    image: "/api/placeholder?w=400&h=400&text=Wireless+Headphones+1",
    additionalImages: [
      "/api/placeholder?w=400&h=400&text=Wireless+Headphones+2",
      "/api/placeholder?w=400&h=400&text=Wireless+Headphones+3",
      "/api/placeholder?w=400&h=400&text=Wireless+Headphones+4"
    ],
    category: "Audio",
    rating: 4.8,
    reviews: 324,
    inStock: true,
    specs: ["Active Noise Cancellation", "30-hour battery", "Bluetooth 5.3", "Premium build quality", "Comfortable ear cups", "Quick charge technology"],
  },
  {
    id: "2",
    name: "4K Webcam HD",
    price: 149.99,
    originalPrice: 199.99,
    description: "Professional 4K webcam for streaming and video calls with crystal clear video quality. Perfect for content creators, streamers, and professionals.",
    image: "/api/placeholder?w=400&h=400&text=4K+Webcam+1",
    additionalImages: [
      "/api/placeholder?w=400&h=400&text=4K+Webcam+2",
      "/api/placeholder?w=400&h=400&text=4K+Webcam+3",
      "/api/placeholder?w=400&h=400&text=4K+Webcam+4"
    ],
    category: "Video",
    rating: 4.6,
    reviews: 156,
    inStock: true,
    specs: ["4K resolution", "Auto-focus", "Wide angle lens", "Built-in microphone", "USB 3.0 connection"],
  },
  {
    id: "3",
    name: "Mechanical Keyboard RGB",
    price: 129.99,
    description: "RGB mechanical keyboard with custom switches for gaming and typing. Experience the perfect blend of performance and style.",
    image: "/api/placeholder?w=400&h=400&text=Mechanical+Keyboard+1",
    additionalImages: [
      "/api/placeholder?w=400&h=400&text=Mechanical+Keyboard+2",
      "/api/placeholder?w=400&h=400&text=Mechanical+Keyboard+3",
      "/api/placeholder?w=400&h=400&text=Mechanical+Keyboard+4"
    ],
    category: "Accessories",
    rating: 4.7,
    reviews: 212,
    inStock: true,
    specs: ["Mechanical switches", "RGB lighting", "Programmable keys", "USB-C connection", "Aluminum frame"],
  },
  {
    id: "4",
    name: "Ultra-Fast SSD 2TB",
    price: 179.99,
    originalPrice: 229.99,
    description: "NVMe SSD with blazing-fast read/write speeds for ultimate system performance. Upgrade your storage today.",
    image: "/api/placeholder?w=400&h=400&text=SSD+Storage+1",
    additionalImages: [
      "/api/placeholder?w=400&h=400&text=SSD+Storage+2",
      "/api/placeholder?w=400&h=400&text=SSD+Storage+3",
      "/api/placeholder?w=400&h=400&text=SSD+Storage+4"
    ],
    category: "Storage",
    rating: 4.9,
    reviews: 438,
    inStock: true,
    specs: ["2TB capacity", "7000MB/s read speed", "M.2 form factor", "5-year warranty", "NVMe technology"],
  },
  {
    id: "5",
    name: "Portable Monitor 15.6\"",
    price: 279.99,
    description: "Portable USB-C monitor for on-the-go productivity. Work anywhere with this lightweight and powerful display.",
    image: "/api/placeholder?w=400&h=400&text=Portable+Monitor+1",
    additionalImages: [
      "/api/placeholder?w=400&h=400&text=Portable+Monitor+2",
      "/api/placeholder?w=400&h=400&text=Portable+Monitor+3",
      "/api/placeholder?w=400&h=400&text=Portable+Monitor+4"
    ],
    category: "Display",
    rating: 4.5,
    reviews: 98,
    inStock: true,
    specs: ["15.6-inch display", "USB-C powered", "1080p resolution", "Lightweight design", "IPS panel"],
  },
  {
    id: "6",
    name: "Docking Station Pro",
    price: 99.99,
    description: "Universal docking station with multiple ports for complete connectivity solution.",
    image: "/api/placeholder?w=400&h=400&text=Docking+Station+1",
    additionalImages: [
      "/api/placeholder?w=400&h=400&text=Docking+Station+2",
      "/api/placeholder?w=400&h=400&text=Docking+Station+3",
      "/api/placeholder?w=400&h=400&text=Docking+Station+4"
    ],
    category: "Accessories",
    rating: 4.4,
    reviews: 127,
    inStock: true,
    specs: ["7 USB ports", "HDMI output", "Ethernet connection", "Power delivery", "Compact design"],
  },
  {
    id: "7",
    name: "Studio Microphone Set",
    price: 249.99,
    originalPrice: 349.99,
    description: "Professional studio microphone with shock mount for podcasting and recording.",
    image: "/api/placeholder?w=400&h=400&text=Studio+Microphone+1",
    additionalImages: [
      "/api/placeholder?w=400&h=400&text=Studio+Microphone+2",
      "/api/placeholder?w=400&h=400&text=Studio+Microphone+3",
      "/api/placeholder?w=400&h=400&text=Studio+Microphone+4"
    ],
    category: "Audio",
    rating: 4.7,
    reviews: 189,
    inStock: false,
    specs: ["Condenser microphone", "USB connection", "Shock mount included", "Pop filter", "XLR compatible"],
  },
  {
    id: "8",
    name: "Thermal Paste Compound",
    price: 14.99,
    description: "High-performance thermal paste for CPU cooling and optimal system temperatures.",
    image: "/api/placeholder?w=400&h=400&text=Thermal+Paste+1",
    additionalImages: [
      "/api/placeholder?w=400&h=400&text=Thermal+Paste+2",
      "/api/placeholder?w=400&h=400&text=Thermal+Paste+3"
    ],
    category: "Components",
    rating: 4.6,
    reviews: 56,
    inStock: true,
    specs: ["High thermal conductivity", "Stable performance", "Easy application", "Reliable", "Long lasting"],
  },
];
