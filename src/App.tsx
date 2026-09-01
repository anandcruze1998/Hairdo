import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth, db } from './main';
import { Header } from './components/Header';
import { SalonList } from './components/SalonList';
import { BookingModal } from './components/BookingModal';
import { Dashboard } from './components/Dashboard';
import { OwnerPortal } from './components/OwnerPortal';
import { AdminDashboard } from './components/AdminDashboard';
import { LoginModal } from './components/LoginModal';
import { DeveloperViewSwitcher } from './components/DeveloperViewSwitcher';
import { Salon, Booking } from './types';

export default function App() {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [isLoadingSalons, setIsLoadingSalons] = useState(true);
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);

  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const [isDevSwitcherOpen, setIsDevSwitcherOpen] = useState(false);
  const [overrideRole, setOverrideRole] = useState<'customer' | 'owner' | 'admin' | null>(null);

  const [showDashboardMobile, setShowDashboardMobile] = useState(false);

  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'customer' | 'owner' | 'admin' | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role as 'customer' | 'owner' | 'admin');
          } else {
            setUserRole('customer'); // Default fallback
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setUserRole('customer');
        }
      } else {
        setUserRole(null);
        setBookings([]);
      }
      setIsLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function fetchSalons() {
      try {
        const querySnapshot = await getDocs(collection(db, 'salons'));
        const fetchedSalons: Salon[] = [];
        querySnapshot.forEach((doc) => {
          fetchedSalons.push({ id: doc.id, ...doc.data() } as Salon);
        });
        setSalons(fetchedSalons);
      } catch (error) {
        console.error("Error fetching salons:", error);
      } finally {
        setIsLoadingSalons(false);
      }
    }
    fetchSalons();
  }, []);

  useEffect(() => {
    if (!user || userRole !== 'customer') {
      setIsLoadingBookings(false);
      return;
    }

    setIsLoadingBookings(true);
    const q = query(
      collection(db, 'bookings'), 
      where('userId', '==', user.uid)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedBookings: Booking[] = [];
      snapshot.forEach((doc) => {
        fetchedBookings.push({ id: doc.id, ...doc.data() } as Booking);
      });
      fetchedBookings.sort((a, b) => b.createdAt - a.createdAt);
      setBookings(fetchedBookings);
      setIsLoadingBookings(false);
    }, (error) => {
      console.error("Error fetching bookings:", error);
      setIsLoadingBookings(false);
    });

    return () => unsubscribe();
  }, []);

  const handleBookClick = (salon: Salon) => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
    setSelectedSalon(salon);
    setIsBookingModalOpen(true);
  };

  const handleConfirmBooking = async (bookingDetails: any) => {
    if (!selectedSalon || !user) return;
    
    const newBooking = {
      userId: user.uid,
      salonId: selectedSalon.id,
      salonName: selectedSalon.name,
      services: bookingDetails.services,
      totalPrice: bookingDetails.totalPrice,
      totalDuration: bookingDetails.totalDuration,
      date: bookingDetails.date,
      timeSlot: bookingDetails.timeSlot,
      status: 'pending',
      createdAt: Date.now()
    };

    await addDoc(collection(db, 'bookings'), newBooking);
    setShowDashboardMobile(true);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setShowDashboardMobile(false);
  };

  if (isLoadingAuth) {
    return (
      <div className="h-screen w-full bg-[#FDFBF7] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-stone-200 border-t-stone-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  const activeRole = overrideRole || userRole;

  return (
    <div className="h-screen w-full bg-[#FDFBF7] flex flex-col font-sans overflow-hidden text-stone-900">
      <Header 
        isLoggedIn={!!user || overrideRole !== null} 
        userRole={activeRole}
        onLoginClick={() => setIsLoginModalOpen(true)} 
        onLogoutClick={handleLogout}
        onHomeClick={() => setShowDashboardMobile(false)}
        onDashboardClick={() => setShowDashboardMobile(true)}
      />
      
      {activeRole === 'owner' ? (
        <OwnerPortal />
      ) : activeRole === 'admin' ? (
        <AdminDashboard />
      ) : (
        <main className="flex-1 flex overflow-hidden">
          {/* Salon Catalog */}
          <div className={`w-full lg:w-3/5 p-6 lg:p-10 overflow-y-auto custom-scrollbar bg-white ${showDashboardMobile ? 'hidden lg:block' : 'block'}`}>
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-4xl font-serif text-stone-800">Available Artistry</h2>
                <p className="text-stone-400 mt-2 text-sm uppercase tracking-wide">Found {salons.length} Curated Salons</p>
              </div>
              <div className="hidden lg:flex gap-2">
                <button className="p-2 border border-stone-200 rounded-lg bg-stone-50">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"></path></svg>
                </button>
              </div>
            </div>
            
            <SalonList 
              salons={salons} 
              isLoading={isLoadingSalons} 
              onBookClick={handleBookClick} 
            />
          </div>

          {/* Right Dashboard View */}
          <div className={`w-full lg:w-2/5 bg-stone-50 border-l border-stone-200 flex flex-col overflow-y-auto custom-scrollbar ${showDashboardMobile ? 'block' : 'hidden lg:flex'}`}>
            <Dashboard bookings={bookings} isLoading={isLoadingBookings} />
          </div>
        </main>
      )}

      <BookingModal 
        salon={selectedSalon}
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onConfirm={handleConfirmBooking}
      />
      
      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      <DeveloperViewSwitcher 
        isOpen={isDevSwitcherOpen}
        onClose={() => setIsDevSwitcherOpen(false)}
        onSelectRole={setOverrideRole}
        currentOverride={overrideRole}
      />
      
      <footer className="shrink-0 bg-[#FDFBF7] py-2 px-4 flex justify-end z-50 border-t border-stone-200/50">
        <button 
          onClick={() => setIsDevSwitcherOpen(true)} 
          className="text-[10px] text-stone-400 hover:text-stone-600 font-semibold uppercase tracking-widest transition-colors"
        >
          Partner Access
        </button>
      </footer>
    </div>
  );
}
