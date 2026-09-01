import { Booking } from "../types";
import { cn } from "../lib/utils";

interface DashboardProps {
  bookings: Booking[];
  isLoading: boolean;
}

export function Dashboard({ bookings, isLoading }: DashboardProps) {
  if (isLoading) {
    return (
      <div className="p-10 flex flex-col">
        <h3 className="text-2xl font-serif mb-6">Your Itinerary</h3>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 bg-white rounded-2xl border border-stone-100 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-10 flex flex-col min-h-full">
      <div className="mb-10">
        <h3 className="text-2xl font-serif mb-6">Your Itinerary</h3>
        
        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-100 p-8 text-center">
            <p className="text-stone-400 text-sm">No upcoming appointments.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map(booking => {
              const dateObj = new Date(booking.date);
              const isPast = booking.status === 'confirmed' && dateObj.getTime() < Date.now();
              const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              
              return (
                <div 
                  key={booking.id} 
                  className={cn(
                    "bg-white p-5 rounded-2xl border border-stone-100 relative overflow-hidden",
                    isPast ? "opacity-70" : "shadow-sm"
                  )}
                >
                  {!isPast && (
                    <div className="absolute top-0 right-0 h-full w-1 bg-amber-400"></div>
                  )}
                  
                  <div className="flex justify-between items-start mb-3">
                    <span className={cn(
                      "text-[10px] uppercase tracking-widest font-bold",
                      isPast ? "text-stone-400" : "text-amber-600"
                    )}>
                      {isPast ? "Past" : "Upcoming"}
                    </span>
                    <span className="text-xs text-stone-400">{dateStr}, {booking.timeSlot}</span>
                  </div>
                  
                  <h4 className="font-serif font-semibold text-lg">{booking.salonName}</h4>
                  <p className="text-sm text-stone-500 mt-1 truncate">
                    {booking.services.map(s => s.name).join(' + ')}
                  </p>
                  
                  <div className="mt-4 pt-4 border-t border-stone-50 flex justify-between items-center">
                    <span className="text-sm font-semibold">${booking.totalPrice.toFixed(2)}</span>
                    <span className={cn(
                      "px-3 py-1 text-[10px] font-bold uppercase rounded-full tracking-wider",
                      booking.status === 'pending' && "bg-amber-50 text-amber-700",
                      booking.status === 'confirmed' && "bg-emerald-50 text-emerald-700",
                      booking.status === 'rejected' && "bg-red-50 text-red-700"
                    )}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-auto bg-stone-900 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-stone-800 rounded-full blur-3xl"></div>
        <h4 className="text-xl font-serif mb-2 relative z-10">Hairdo Prime</h4>
        <p className="text-xs text-stone-400 mb-6 relative z-10">Unlock unlimited rescheduling and priority booking with Manhattan's best.</p>
        <button className="bg-white text-stone-900 px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest relative z-10 hover:bg-stone-100 transition-colors">
          Upgrade Now
        </button>
      </div>
    </div>
  );
}
