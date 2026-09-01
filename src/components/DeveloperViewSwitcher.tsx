import React from 'react';
import { X, LayoutDashboard, Briefcase, ShieldAlert } from 'lucide-react';

interface DeveloperViewSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRole: (role: 'customer' | 'owner' | 'admin' | null) => void;
  currentOverride: 'customer' | 'owner' | 'admin' | null;
}

export function DeveloperViewSwitcher({ isOpen, onClose, onSelectRole, currentOverride }: DeveloperViewSwitcherProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-stone-100">
          <div>
            <h2 className="text-xl font-serif text-stone-800">Preview Mode</h2>
            <p className="text-xs text-stone-500 mt-1">Switch interface access roles</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full text-stone-400 hover:text-stone-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 space-y-2">
          <button
            onClick={() => { onSelectRole('customer'); onClose(); }}
            className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all ${currentOverride === 'customer' ? 'border-stone-900 bg-stone-50' : 'border-stone-100 hover:border-stone-300'}`}
          >
            <div className={`p-2 rounded-full ${currentOverride === 'customer' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-500'}`}>
              <LayoutDashboard className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-stone-800">Customer View</p>
              <p className="text-xs text-stone-500">Standard booking interface</p>
            </div>
          </button>

          <button
            onClick={() => { onSelectRole('owner'); onClose(); }}
            className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all ${currentOverride === 'owner' ? 'border-stone-900 bg-stone-50' : 'border-stone-100 hover:border-stone-300'}`}
          >
            <div className={`p-2 rounded-full ${currentOverride === 'owner' ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-600'}`}>
              <Briefcase className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-stone-800">Salon Owner Portal</p>
              <p className="text-xs text-stone-500">Manage incoming requests</p>
            </div>
          </button>

          <button
            onClick={() => { onSelectRole('admin'); onClose(); }}
            className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all ${currentOverride === 'admin' ? 'border-stone-900 bg-stone-50' : 'border-stone-100 hover:border-stone-300'}`}
          >
            <div className={`p-2 rounded-full ${currentOverride === 'admin' ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-600'}`}>
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-stone-800">Master Admin Panel</p>
              <p className="text-xs text-stone-500">System statistics & overview</p>
            </div>
          </button>
          
          <div className="pt-2">
            <button
              onClick={() => { onSelectRole(null); onClose(); }}
              className="w-full py-2 text-xs text-stone-400 hover:text-stone-700 font-medium transition-colors"
            >
              Clear Override (Use Actual Auth)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
