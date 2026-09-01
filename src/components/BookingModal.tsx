import { useState, useMemo } from "react";
import { X, Calendar, Clock, Check } from "lucide-react";
import { Salon, Service } from "../types";
import { cn } from "../lib/utils";

interface BookingModalProps {
  salon: Salon | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (bookingDetails: {
    services: Service[];
    date: string;
    timeSlot: string;
    totalPrice: number;
    totalDuration: number;
  }) => Promise<void>;
}

const AVAILABLE_TIMES = [
  "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"
];

export function BookingModal({ salon, isOpen, onClose, onConfirm }: BookingModalProps) {
  const [selectedServiceIds, setSelectedServiceIds] = useState<Set<string>>(new Set());
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when modal opens
  useMemo(() => {
    if (isOpen) {
      setSelectedServiceIds(new Set());
      setSelectedDate("");
      setSelectedTime("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen || !salon) return null;

  const toggleService = (id: string) => {
    const newSet = new Set(selectedServiceIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedServiceIds(newSet);
  };

  const selectedServices = salon.services.filter(s => selectedServiceIds.has(s.id));
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.durationMinutes, 0);

  const handleConfirm = async () => {
    if (selectedServices.length === 0 || !selectedDate || !selectedTime) return;
    
    setIsSubmitting(true);
    try {
      await onConfirm({
        services: selectedServices,
        date: selectedDate,
        timeSlot: selectedTime,
        totalPrice,
        totalDuration
      });
      onClose();
    } catch (error) {
      console.error("Booking failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = selectedServices.length > 0 && selectedDate && selectedTime;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center hidden" style={{ display: isOpen ? 'flex' : 'none' }}>
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />
      
      {/* Modal */}
      <div className="bg-white w-full max-w-[500px] rounded-3xl overflow-hidden shadow-2xl flex flex-col relative z-10 m-4 max-h-[90vh]">
        {/* Header */}
        <div className="bg-stone-50 px-8 py-6 border-b border-stone-100 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-serif text-stone-900">Salon Booking</h3>
            <p className="text-xs text-stone-400">Secure your personalized session at {salon.name}</p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-900 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar bg-white">
          {/* Step 1: Services */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-stone-500 mb-2 font-bold">Select Treatment</label>
            <div className="space-y-2">
              {salon.services.map(service => {
                const isSelected = selectedServiceIds.has(service.id);
                return (
                  <div
                    key={service.id}
                    onClick={() => toggleService(service.id)}
                    className={cn(
                      "flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all text-left",
                      isSelected 
                        ? "border-stone-900 bg-stone-50" 
                        : "border-stone-200 hover:border-stone-900"
                    )}
                  >
                    <div className="flex gap-3 items-center">
                      <div className={cn(
                        "w-4 h-4 rounded flex items-center justify-center border",
                        isSelected ? "bg-stone-900 border-stone-900 text-white" : "border-stone-300"
                      )}>
                        {isSelected && <Check className="w-3 h-3" strokeWidth={3} />}
                      </div>
                      <span className="text-sm font-medium text-stone-900">{service.name}</span>
                    </div>
                    <span className="text-sm text-stone-400">${service.price}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-stone-500 mb-2 font-bold">Date</label>
              <input 
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:ring-1 focus:ring-stone-900 transition-all outline-none text-stone-900"
              />
            </div>
            
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-stone-500 mb-2 font-bold">Preferred Time</label>
              <select 
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:ring-1 focus:ring-stone-900 outline-none text-stone-900 bg-white"
              >
                <option value="" disabled>Select time...</option>
                {AVAILABLE_TIMES.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-stone-50 p-6 border-t border-stone-100 flex justify-between items-center m-2 rounded-2xl">
          <div>
            <p className="text-[10px] uppercase text-stone-400 font-bold">Estimated Total</p>
            <p className="text-2xl font-serif font-bold text-stone-900">${totalPrice.toFixed(2)}</p>
          </div>
          <button 
            disabled={!isFormValid || isSubmitting}
            onClick={handleConfirm}
            className={cn(
              "px-8 py-3 rounded-2xl font-semibold text-sm transition-all",
              isFormValid && !isSubmitting
                ? "bg-stone-900 text-white hover:bg-stone-800"
                : "bg-stone-200 text-stone-400 cursor-not-allowed"
            )}
          >
            {isSubmitting ? "Confirming..." : "Confirm Session"}
          </button>
        </div>
      </div>
    </div>
  );
}
