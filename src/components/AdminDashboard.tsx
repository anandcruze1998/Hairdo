import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../main';
import { User as UserIcon, Calendar, Briefcase, Plus, Loader2, X } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import config from '../../firebase-applet-config.json';
import { Service } from '../types';

// Create a secondary app instance to register owners without signing out the admin
const secondaryApp = initializeApp(config, "Secondary");
const secondaryAuth = getAuth(secondaryApp);

export function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, bookings: 0, salons: 0 });
  const [isLoading, setIsLoading] = useState(true);
  
  // Registration Form State
  const [salonName, setSalonName] = useState('');
  const [address, setAddress] = useState('');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800');
  const [ownerUsername, setOwnerUsername] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [services, setServices] = useState<Service[]>([{ name: '', price: 0, durationMinutes: 30 }]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerMessage, setRegisterMessage] = useState<{type: 'error'|'success', text: string} | null>(null);

  const fetchStats = async () => {
    try {
      const [usersSnap, bookingsSnap, salonsSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'bookings')),
        getDocs(collection(db, 'salons'))
      ]);
      
      setStats({
        users: usersSnap.size,
        bookings: bookingsSnap.size,
        salons: salonsSnap.size
      });
    } catch (err) {
      console.error("Error fetching admin stats", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleAddService = () => {
    setServices([...services, { name: '', price: 0, durationMinutes: 30 }]);
  };

  const updateService = (index: number, field: keyof Service, value: any) => {
    const newServices = [...services];
    newServices[index] = { ...newServices[index], [field]: value };
    setServices(newServices);
  };

  const removeService = (index: number) => {
    if (services.length > 1) {
      setServices(services.filter((_, i) => i !== index));
    }
  };

  const handleRegisterSalon = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);
    setRegisterMessage(null);

    try {
      // 1. Create the Owner in Firebase Auth using the secondary app
      const loginIdentifier = ownerUsername.toLowerCase().trim();
      const authEmail = loginIdentifier.includes('@') ? loginIdentifier : `${loginIdentifier}@hairdo.local`;
      
      const userCred = await createUserWithEmailAndPassword(secondaryAuth, authEmail, ownerPassword);
      const ownerId = userCred.user.uid;
      
      // We log out the secondary instance to clean up
      await signOut(secondaryAuth);

      // 2. Generate a new salon document reference
      const salonRef = doc(collection(db, 'salons'));
      const newSalonId = salonRef.id;

      // 3. Create the Owner user document pointing to the new salon
      await setDoc(doc(db, 'users', ownerId), {
        email: authEmail,
        role: 'owner',
        salonId: newSalonId,
        createdAt: Date.now()
      });

      // 4. Create the Salon document
      await setDoc(salonRef, {
        name: salonName,
        address: address,
        imageUrl: imageUrl,
        ownerId: ownerId,
        services: services.map(s => ({
          name: s.name,
          price: Number(s.price),
          durationMinutes: Number(s.durationMinutes)
        }))
      });

      setRegisterMessage({ type: 'success', text: `Salon '${salonName}' and Owner '${ownerUsername}' registered successfully!` });
      
      // Reset form
      setSalonName('');
      setAddress('');
      setOwnerUsername('');
      setOwnerPassword('');
      setServices([{ name: '', price: 0, durationMinutes: 30 }]);
      fetchStats();

    } catch (err: any) {
      console.error(err);
      setRegisterMessage({ type: 'error', text: err.message || 'Failed to register salon.' });
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-10 bg-stone-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-serif text-stone-800 mb-8">Admin Dashboard</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex items-center gap-4">
            <div className="p-4 bg-blue-50 rounded-full text-blue-600">
              <UserIcon className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-stone-500 font-bold uppercase tracking-widest">Total Users</p>
              <p className="text-3xl font-serif">{isLoading ? '-' : stats.users}</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex items-center gap-4">
            <div className="p-4 bg-emerald-50 rounded-full text-emerald-600">
              <Calendar className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-stone-500 font-bold uppercase tracking-widest">Total Bookings</p>
              <p className="text-3xl font-serif">{isLoading ? '-' : stats.bookings}</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex items-center gap-4">
            <div className="p-4 bg-purple-50 rounded-full text-purple-600">
              <Briefcase className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-stone-500 font-bold uppercase tracking-widest">Total Salons</p>
              <p className="text-3xl font-serif">{isLoading ? '-' : stats.salons}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
          <div className="p-8 border-b border-stone-100">
            <h3 className="text-2xl font-serif text-stone-800">Register New Salon & Owner</h3>
            <p className="text-stone-500 mt-1">Provision a new salon location and create owner login credentials.</p>
          </div>
          
          <form onSubmit={handleRegisterSalon} className="p-8">
            {registerMessage && (
              <div className={`p-4 rounded-xl mb-6 text-sm ${registerMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                {registerMessage.text}
              </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Salon Details */}
              <div className="space-y-5">
                <h4 className="font-bold uppercase tracking-widest text-stone-400 text-xs mb-4">Salon Details</h4>
                
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Salon Name</label>
                  <input type="text" required value={salonName} onChange={e => setSalonName(e.target.value)} className="w-full border border-stone-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-stone-400 outline-none" placeholder="e.g. The Grand Studio" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Address</label>
                  <input type="text" required value={address} onChange={e => setAddress(e.target.value)} className="w-full border border-stone-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-stone-400 outline-none" placeholder="e.g. 123 5th Ave, NY" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Image URL</label>
                  <input type="url" required value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full border border-stone-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-stone-400 outline-none" />
                </div>
              </div>

              {/* Owner Credentials */}
              <div className="space-y-5">
                <h4 className="font-bold uppercase tracking-widest text-stone-400 text-xs mb-4">Owner Credentials</h4>
                
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Owner Username (or Email)</label>
                  <input type="text" required value={ownerUsername} onChange={e => setOwnerUsername(e.target.value)} className="w-full border border-stone-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-stone-400 outline-none" placeholder="e.g. owner_grand" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Owner Password</label>
                  <input type="password" required minLength={6} value={ownerPassword} onChange={e => setOwnerPassword(e.target.value)} className="w-full border border-stone-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-stone-400 outline-none" placeholder="••••••••" />
                </div>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-stone-100">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold uppercase tracking-widest text-stone-400 text-xs">Salon Services</h4>
                <button type="button" onClick={handleAddService} className="text-sm font-medium text-stone-900 flex items-center gap-1 hover:text-stone-600 transition-colors">
                  <Plus className="w-4 h-4" /> Add Service
                </button>
              </div>

              <div className="space-y-4">
                {services.map((service, index) => (
                  <div key={index} className="flex gap-4 items-end bg-stone-50 p-4 rounded-xl border border-stone-100">
                    <div className="flex-1">
                      <label className="block text-xs text-stone-500 mb-1">Service Name</label>
                      <input type="text" required value={service.name} onChange={e => updateService(index, 'name', e.target.value)} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-stone-400 outline-none bg-white" placeholder="e.g. Haircut" />
                    </div>
                    <div className="w-24">
                      <label className="block text-xs text-stone-500 mb-1">Price ($)</label>
                      <input type="number" required min="0" value={service.price || ''} onChange={e => updateService(index, 'price', e.target.value)} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-stone-400 outline-none bg-white" placeholder="0" />
                    </div>
                    <div className="w-32">
                      <label className="block text-xs text-stone-500 mb-1">Duration (min)</label>
                      <input type="number" required min="5" step="5" value={service.durationMinutes || ''} onChange={e => updateService(index, 'durationMinutes', e.target.value)} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-stone-400 outline-none bg-white" placeholder="30" />
                    </div>
                    {services.length > 1 && (
                      <button type="button" onClick={() => removeService(index)} className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors mb-0.5">
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-stone-100 flex justify-end">
              <button 
                type="submit" 
                disabled={isRegistering}
                className="bg-stone-900 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-stone-800 transition-colors flex items-center gap-2"
              >
                {isRegistering ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Provision Salon'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
