import { Search, User, LogOut } from "lucide-react";

interface HeaderProps {
  onLoginClick: () => void;
  onDashboardClick: () => void;
  onHomeClick: () => void;
  onLogoutClick?: () => void;
  isLoggedIn: boolean;
  userRole: 'customer' | 'owner' | 'admin' | null;
}

export function Header({ onLoginClick, onDashboardClick, onHomeClick, onLogoutClick, isLoggedIn, userRole }: HeaderProps) {
  const isCustomerMode = !userRole || userRole === 'customer';

  return (
    <header className="sticky top-0 z-40 w-full h-20 border-b border-stone-200 px-10 flex items-center justify-between bg-white/80 backdrop-blur-md">
      <div className="flex items-center gap-12">
        <div className="flex-shrink-0 cursor-pointer" onClick={onHomeClick}>
          <h1 className="text-3xl font-serif italic tracking-tight font-semibold text-stone-800">Hairdo</h1>
        </div>
        {isCustomerMode && (
          <div className="hidden md:flex items-center gap-6 text-[13px] uppercase tracking-widest text-stone-500 font-medium">
            <a href="#" className="hover:text-stone-900 transition-colors">Salons</a>
            <a href="#" className="hover:text-stone-900 transition-colors">Stylists</a>
            <a href="#" className="hover:text-stone-900 transition-colors">Treatments</a>
          </div>
        )}
      </div>

      <div className="flex items-center gap-6">
        {isCustomerMode && (
          <div className="relative hidden md:block">
            <input 
              type="text" 
              placeholder="Search by city or style..." 
              className="w-64 bg-stone-100 border-none rounded-full py-2 px-5 text-sm focus:ring-1 focus:ring-stone-300 transition-all outline-none text-stone-900 placeholder:text-stone-400"
            />
          </div>
        )}
        
        {isLoggedIn && isCustomerMode && (
          <button 
            onClick={onDashboardClick}
            className="flex items-center gap-2 border border-stone-200 px-5 py-2 rounded-full text-sm font-medium hover:bg-stone-50 transition-all text-stone-900"
          >
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            My Bookings
          </button>
        )}

        {isLoggedIn ? (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-stone-600 hidden md:block capitalize px-2 py-1 bg-stone-100 rounded-full">{userRole}</span>
            <button 
              onClick={onLogoutClick}
              className="bg-stone-100 text-stone-700 p-2 rounded-full text-sm font-medium hover:bg-stone-200 transition-all flex items-center justify-center w-10 h-10"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button 
            onClick={onLoginClick}
            className="bg-stone-900 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-stone-800 transition-all flex items-center gap-2"
          >
            Login
          </button>
        )}
      </div>
    </header>
  );
}
