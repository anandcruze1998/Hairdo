import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../main';
import { Booking } from '../types';
import { Bell, Check, X, Clock, CalendarCheck, CheckCircle2 } from 'lucide-react';

export function OwnerPortal() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [salonId, setSalonId] = useState<string | null>(null);

  
  // Track previous pending count to trigger alert
  const prevPendingCount = useRef(0);

  useEffect(() => {
    async function initOwner() {
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists() && userDoc.data().role === "owner" && userDoc.data().salonId) {
          setSalonId(userDoc.data().salonId);
          return;
        }
      }
      setSalonId("salon-1");
    }
    initOwner();
  }, []);

  useEffect(() => {
    if (!salonId) return;


    // For this demo, we'll assume the logged in owner owns "salon-1"
    const OWNER_SALON_ID = salonId;

    const q = query(
      collection(db, 'bookings'),
      where('salonId', '==', OWNER_SALON_ID)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedBookings: Booking[] = [];
      snapshot.forEach((doc) => {
        fetchedBookings.push({ id: doc.id, ...doc.data() } as Booking);
      });
      
      fetchedBookings.sort((a, b) => b.createdAt - a.createdAt);
      
      const currentPending = fetchedBookings.filter(b => b.status === 'pending').length;
      if (currentPending > prevPendingCount.current) {
        // Visual/Audio Alert
        const audio = new Audio('https://cdn.freesound.org/previews/411/411089_5121236-lq.mp3'); // Simple ping sound
        audio.play().catch(e => console.log("Audio play blocked by browser:", e));
        
        // Visual badge flash (could be implemented with state, but native alert or sound is sufficient)
      }
      prevPendingCount.current = currentPending;

      setBookings(fetchedBookings);
    });

    return () => unsubscribe();
  }, []);

  const updateBookingStatus = async (bookingId: string, status: 'confirmed' | 'rejected') => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, { status });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // Calculate stats
  const today = new Date().toDateString();
  const totalToday = bookings.filter(b => {
    // Assuming b.date is YYYY-MM-DD
    const bookingDate = new Date(b.date).toDateString();
    return bookingDate === today;
  }).length;
  
  const pendingRequests = bookings.filter(b => b.status === 'pending').length;
  const confirmedAppointments = bookings.filter(b => b.status === 'confirmed').length;

  return (
    <div className="flex-1 flex flex-col bg-stone-50 h-full overflow-hidden">
      <div className="bg-white border-b border-stone-200 p-6 flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-2xl font-serif text-stone-800">Salon Dashboard</h2>
          <p className="text-stone-500 text-sm mt-1">Manage your appointments and requests</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-600">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-500">Today's Bookings</p>
              <p className="text-3xl font-serif text-stone-800">{totalToday}</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex items-center gap-4 relative overflow-hidden">
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-500">Pending Requests</p>
              <p className="text-3xl font-serif text-stone-800">{pendingRequests}</p>
            </div>
            {pendingRequests > 0 && (
              <span className="absolute top-4 right-4 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
            )}
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-500">Confirmed (All Time)</p>
              <p className="text-3xl font-serif text-stone-800">{confirmedAppointments}</p>
            </div>
          </div>
        </div>

        {/* Real-Time Feed */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
            <h3 className="text-lg font-medium text-stone-800 flex items-center gap-2">
              <Bell className="w-5 h-5 text-stone-500" />
              Incoming Requests & Bookings
            </h3>
          </div>
          
          <div className="divide-y divide-stone-100">
            {bookings.length === 0 ? (
              <div className="p-8 text-center text-stone-500">No bookings found.</div>
            ) : (
              bookings.map(booking => (
                <div key={booking.id} className="p-6 hover:bg-stone-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium text-stone-800 text-lg">
                        {/* If we had customer name we'd show it, but right now we only have userId in the model */}
                        Customer {booking.userId.slice(-4)}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider
                        ${booking.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                          booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 
                          'bg-stone-100 text-stone-600'}
                      `}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="text-sm text-stone-600 space-y-1">
                      <p><strong className="font-medium">Services:</strong> {booking.services.join(', ')}</p>
                      <p><strong className="font-medium">When:</strong> {new Date(booking.date).toLocaleDateString()} at {booking.timeSlot}</p>
                      <p><strong className="font-medium">Price:</strong> ${booking.totalPrice} ({booking.totalDuration} mins)</p>
                    </div>
                  </div>
                  
                  {booking.status === 'pending' && (
                    <div className="flex items-center gap-3 shrink-0">
                      <button 
                        onClick={() => updateBookingStatus(booking.id!, 'rejected')}
                        className="flex items-center gap-1.5 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-medium text-sm transition-colors"
                      >
                        <X className="w-4 h-4" /> Reject
                      </button>
                      <button 
                        onClick={() => updateBookingStatus(booking.id!, 'confirmed')}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium text-sm transition-colors"
                      >
                        <Check className="w-4 h-4" /> Accept
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
