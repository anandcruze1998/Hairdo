import React, { useState } from 'react';
import { X, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../main';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SignupStep = 'details' | 'otp' | 'success';

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Signup specific state
  const [signupStep, setSignupStep] = useState<SignupStep>('details');
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const resetState = () => {
    setIsLogin(true);
    setSignupStep('details');
    setEmailOrUsername('');
    setPassword('');
    setFullName('');
    setMobile('');
    setEmail('');
    setOtpCode('');
    setError(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const loginIdentifier = emailOrUsername.toLowerCase().trim();
    const isHardcodedAdmin = loginIdentifier === 'admin12345' && password === 'Admin@0987';
    let authEmail = loginIdentifier;

    try {
      // Check if the identifier is likely a phone number (e.g. starts with + or is digits)
      const isLikelyPhone = /^\+?[\d\s-]+$/.test(loginIdentifier);
      
      if (isLikelyPhone) {
        // Look up email by phone
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('phone', '==', loginIdentifier));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          authEmail = querySnapshot.docs[0].data().email;
        } else {
          throw new Error('No account found with that mobile number.');
        }
      } else if (!loginIdentifier.includes('@')) {
        authEmail = `${loginIdentifier}@hairdo.local`;
      }

      try {
        await signInWithEmailAndPassword(auth, authEmail, password);
      } catch (err: any) {
        // Auto-create admin if it doesn't exist yet and credentials match
        if (isHardcodedAdmin && (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/invalid-login-credentials')) {
          const userCred = await createUserWithEmailAndPassword(auth, authEmail, password);
          await setDoc(doc(db, 'users', userCred.user.uid), {
            email: authEmail,
            role: 'admin',
            createdAt: serverTimestamp()
          });
        } else {
          throw err;
        }
      }
      handleClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate sending OTP
    setError(null);
    setSignupStep('otp');
  };

  const handleVerifyOtpAndSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // In a real environment, you would verify the OTP here with a backend/Firebase function.
      // For this prototype, we accept any 6-digit code or a specific dummy one.
      if (otpCode.length < 6) {
        throw new Error('Please enter a valid 6-digit code.');
      }

      // Create the user
      const userCredential = await createUserWithEmailAndPassword(auth, email.toLowerCase().trim(), password);
      const user = userCredential.user;
      
      // Store user profile with mandatory fields
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: fullName,
        email: user.email,
        phone: mobile,
        role: 'customer',
        createdAt: serverTimestamp()
      });

      setSignupStep('success');
      
      // Auto close after showing success message briefly
      setTimeout(() => {
        handleClose();
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'An error occurred during registration.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-stone-100">
          <div className="flex items-center gap-3">
            {!isLogin && signupStep === 'otp' && (
              <button onClick={() => setSignupStep('details')} className="text-stone-400 hover:text-stone-700 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-2xl font-serif text-stone-800">
              {isLogin ? 'Welcome Back' : signupStep === 'success' ? 'Registration Complete' : 'Create Account'}
            </h2>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 hover:bg-stone-100 rounded-full text-stone-400 hover:text-stone-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl">
              {error}
            </div>
          )}

          {/* ---------------- LOGIN FORM ---------------- */}
          {isLogin && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                  Email, Username, or Mobile
                </label>
                <input 
                  type="text"
                  required
                  value={emailOrUsername}
                  onChange={e => setEmailOrUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-400 focus:bg-white transition-all text-sm"
                  placeholder="Email, +123..., or username"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                  Password
                </label>
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-400 focus:bg-white transition-all text-sm"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-stone-900 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-stone-800 transition-colors mt-4 flex justify-center items-center h-12"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Login'}
              </button>
            </form>
          )}

          {/* ---------------- SIGNUP DETAILS FORM ---------------- */}
          {!isLogin && signupStep === 'details' && (
            <form onSubmit={handleSignupRequestOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <input 
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-400 focus:bg-white transition-all text-sm"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                  Mobile Number
                </label>
                <input 
                  type="tel"
                  required
                  pattern="^\+?[1-9]\d{1,14}$"
                  title="Please enter a valid phone number with country code (e.g. +919876543210)"
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-400 focus:bg-white transition-all text-sm"
                  placeholder="+91..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-400 focus:bg-white transition-all text-sm"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                  Password
                </label>
                <input 
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-400 focus:bg-white transition-all text-sm"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-stone-900 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-stone-800 transition-colors mt-4 flex justify-center items-center h-12"
              >
                Send Verification Code
              </button>
            </form>
          )}

          {/* ---------------- SIGNUP OTP FORM ---------------- */}
          {!isLogin && signupStep === 'otp' && (
            <form onSubmit={handleVerifyOtpAndSignup} className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-stone-600">
                  We've sent a verification code to <br/>
                  <strong className="text-stone-900">{email}</strong>
                </p>
                <p className="text-xs text-stone-400 mt-2">
                  (For this prototype, enter any 6-digit code)
                </p>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 text-center">
                  6-Digit OTP Code
                </label>
                <input 
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center tracking-[0.5em] text-2xl px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-400 focus:bg-white transition-all"
                  placeholder="000000"
                />
              </div>
              
              <button
                type="submit"
                disabled={isLoading || otpCode.length < 6}
                className="w-full py-3 bg-stone-900 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-stone-800 transition-colors flex justify-center items-center h-12 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Create Account'}
              </button>
            </form>
          )}

          {/* ---------------- SIGNUP SUCCESS ---------------- */}
          {!isLogin && signupStep === 'success' && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-2">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <p className="text-center text-stone-600 font-medium">
                Your account has been successfully created. Logging you in...
              </p>
            </div>
          )}

          {/* Footer toggle for login/signup */}
          {(isLogin || signupStep === 'details') && (
            <p className="text-center text-sm text-stone-500 mt-6 pt-4 border-t border-stone-100">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setSignupStep('details');
                  setError(null);
                }}
                className="font-semibold text-stone-800 hover:underline"
              >
                {isLogin ? 'Sign up' : 'Login'}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
