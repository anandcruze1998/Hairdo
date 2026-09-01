export interface Service {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
}

export interface Salon {
  id: string;
  name: string;
  address: string;
  rating: number;
  imageUrl: string;
  services: Service[];
}

export interface Booking {
  id?: string;
  salonId: string;
  salonName: string;
  services: Service[];
  totalPrice: number;
  totalDuration: number;
  date: string;
  timeSlot: string;
  status: 'pending' | 'confirmed' | 'rejected';
  createdAt: number;
}
