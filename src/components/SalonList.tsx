import { Star } from "lucide-react";
import { Salon } from "../types";

interface SalonListProps {
  salons: Salon[];
  onBookClick: (salon: Salon) => void;
  isLoading: boolean;
}

export function SalonList({ salons, onBookClick, isLoading }: SalonListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse flex flex-col gap-4">
            <div className="aspect-[4/5] bg-stone-200 rounded-2xl"></div>
            <div className="h-6 bg-stone-100 rounded w-2/3"></div>
            <div className="h-4 bg-stone-100 rounded w-1/2"></div>
            <div className="h-12 bg-stone-50 rounded mt-4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (salons.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-stone-400">No salons found in this area.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {salons.map((salon) => (
        <div key={salon.id} className="group cursor-pointer">
          <div className="aspect-[4/5] bg-stone-200 mb-4 rounded-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10"></div>
            <div className="absolute bottom-4 left-4 text-white z-20">
              <p className="text-[10px] uppercase tracking-tighter opacity-80">
                Starting from ${Math.min(...salon.services.map(s => s.price))}
              </p>
            </div>
            <img 
              src={salon.imageUrl} 
              alt={salon.name} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 relative z-0"
            />
          </div>
          
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-lg font-serif font-semibold text-stone-900">{salon.name}</h3>
              <p className="text-sm text-stone-500">{salon.address}</p>
            </div>
            <div className="flex items-center text-xs bg-stone-50 px-2 py-1 rounded border border-stone-100 text-stone-900">
              <span className="text-amber-500 mr-1">★</span> {salon.rating.toFixed(1)}
            </div>
          </div>
          
          {/* Services tags (kept for functionality, styled to fit) */}
          <div className="flex flex-wrap gap-2 mb-2">
            {salon.services.slice(0, 2).map(s => (
              <span key={s.id} className="text-[10px] uppercase tracking-wider px-2 py-1 bg-stone-100 rounded text-stone-500 font-medium">
                {s.name}
              </span>
            ))}
            {salon.services.length > 2 && (
              <span className="text-[10px] uppercase tracking-wider px-2 py-1 bg-stone-100 rounded text-stone-500 font-medium">+{salon.services.length - 2}</span>
            )}
          </div>
          
          <button 
            onClick={() => onBookClick(salon)}
            className="mt-4 w-full py-3 border border-stone-900 text-stone-900 rounded-xl text-sm font-semibold group-hover:bg-stone-900 group-hover:text-white transition-all"
          >
            Book Appointment
          </button>
        </div>
      ))}
    </div>
  );
}
