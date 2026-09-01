import { Salon } from './types';

export const dummySalons: Salon[] = [
  {
    id: "salon-1",
    name: "L'Élégance Parisienne",
    address: "142 Beverly Hills Blvd, Los Angeles",
    rating: 4.9,
    imageUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=1000",
    services: [
      { id: "s1", name: "Signature Silk Press", price: 120, durationMinutes: 90 },
      { id: "s2", name: "Balayage Masterclass", price: 250, durationMinutes: 180 },
      { id: "s3", name: "Classic Blowout", price: 65, durationMinutes: 45 },
    ]
  },
  {
    id: "salon-2",
    name: "The Velvet Room",
    address: "88 Soho Square, New York",
    rating: 4.8,
    imageUrl: "https://images.unsplash.com/photo-1521590832167-7bfc17484d20?auto=format&fit=crop&q=80&w=1000",
    services: [
      { id: "s4", name: "Precision Cut & Style", price: 95, durationMinutes: 60 },
      { id: "s5", name: "Keratin Smoothing", price: 300, durationMinutes: 120 },
      { id: "s6", name: "Root Touch-up", price: 80, durationMinutes: 45 },
    ]
  },
  {
    id: "salon-3",
    name: "Aura Studio",
    address: "12 Marina Bay, Miami",
    rating: 4.7,
    imageUrl: "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&q=80&w=1000",
    services: [
      { id: "s7", name: "Color Transformation", price: 280, durationMinutes: 240 },
      { id: "s8", name: "Event Styling", price: 150, durationMinutes: 90 },
      { id: "s9", name: "Scalp Detox Treatment", price: 85, durationMinutes: 45 },
    ]
  }
];
