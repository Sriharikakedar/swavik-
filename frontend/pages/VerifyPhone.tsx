import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RecaptchaVerifier, linkWithPhoneNumber, ConfirmationResult, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../firebase/firebase';

interface VerifyPhoneProps {
  setIsSessionVerified: (val: boolean) => void;
}

const VerifyPhone: React.FC<VerifyPhoneProps> = ({ setIsSessionVerified }) => {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If user is already phone verified or not logged in, redirect
    if (!auth.currentUser) {
      navigate('/login');
    }

    // Set existing phone number if available
    if (auth.currentUser?.phoneNumber) {
      setPhoneNumber(auth.currentUser.phoneNumber);
    }

    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'normal',
        'callback': (response: any) => {
          // reCAPTCHA solved
        },
        'expired-callback': () => {
          setError("Recaptcha expired. Please try again.");
        }
      });
    }

    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = undefined;
      }
    };
  }, [navigate]);

  const requestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return setError("Please enter a valid phone number.");

    setError(null);
    setLoading(true);

    try {
      const appVerifier = window.recaptchaVerifier;

      let result;
      if (auth.currentUser?.phoneNumber === phoneNumber) {
        // Already linked, just verify identity
        result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      } else {
        // Link new number
        result = await linkWithPhoneNumber(auth.currentUser!, phoneNumber, appVerifier);
      }

      setConfirmationResult(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to send SMS. Make sure phone number includes country code (e.g. +1234567890)");
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || !confirmationResult) return;

    setError(null);
    setLoading(true);

    try {
      await confirmationResult.confirm(verificationCode);
      // Success! Set session as verified
      setIsSessionVerified(true);
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError("Invalid confirmation code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-theme-bg text-theme-text transition-colors duration-300">
      <div className="w-full max-w-md bg-theme-card border border-theme-border p-10 rounded-2xl shadow-2xl relative overflow-hidden">
        {/* Decorative Top Gradient */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-theme-accent to-navy"></div>

        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-theme-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-theme-accent/20 shadow-lg shadow-theme-accent/10">
            <i className="fas fa-shield-alt text-2xl text-theme-accent"></i>
          </div>
          <h2 className="text-3xl font-black tracking-tighter mb-2 text-theme-text">Verify Phone</h2>
          <p className="text-theme-dim text-sm max-w-xs mx-auto font-medium">
            {auth.currentUser?.phoneNumber
              ? `We'll send a code to ${auth.currentUser.phoneNumber} to verify it's you.`
              : "Please verify your phone number to secure your ResolveX account."}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400">
            <i className="fas fa-exclamation-circle mt-0.5"></i>
            <p className="text-xs font-medium leading-relaxed">{error}</p>
          </div>
        )}

        {!confirmationResult ? (
          <form onSubmit={requestOTP} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-theme-dim uppercase tracking-widest mb-2">Phone Number</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-dim/50">
                  <i className="fas fa-phone"></i>
                </span>
                <input
                  type="tel"
                  placeholder="+1 234 567 8900"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-12 py-3 text-theme-text placeholder-theme-dim/30 focus:outline-none focus:border-theme-accent focus:ring-1 focus:ring-theme-accent transition-all font-mono"
                  disabled={loading}
                />
              </div>
              <p className="text-[10px] text-theme-dim mt-2 font-bold uppercase tracking-tight">Must include country code (e.g. +1 for US, +91 for IN).</p>
            </div>

            <div id="recaptcha-container" className="flex justify-center my-4"></div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-theme-accent text-white font-black uppercase tracking-widest text-sm py-4 rounded-xl hover:bg-orange-dark transition-all shadow-xl shadow-orange/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <i className="fas fa-circle-notch fa-spin"></i> : (
                auth.currentUser?.phoneNumber ? "Send Security Code" : "Send Verification Code"
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyOTP} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-theme-dim uppercase tracking-widest mb-2">Verification Code</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-dim/50">
                  <i className="fas fa-key"></i>
                </span>
                <input
                  type="text"
                  placeholder="123456"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full bg-theme-bg border border-theme-border rounded-xl px-12 py-3 text-theme-text placeholder-theme-dim/30 focus:outline-none focus:border-theme-accent focus:ring-1 focus:ring-theme-accent transition-all font-mono text-center tracking-[0.5em] text-lg font-bold shadow-inner"
                  maxLength={6}
                  disabled={loading}
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || verificationCode.length < 6}
              className="w-full bg-theme-accent text-white font-black uppercase tracking-widest text-sm py-4 rounded-xl hover:bg-orange-dark transition-all shadow-xl shadow-orange/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <i className="fas fa-circle-notch fa-spin"></i> : (
                <>
                  Verify <i className="fas fa-arrow-right"></i>
                </>
              )}
            </button>

            <p className="text-center">
              <button
                type="button"
                onClick={() => setConfirmationResult(null)}
                className="text-[10px] text-theme-dim hover:text-theme-text uppercase tracking-widest font-bold transition-colors"
                disabled={loading}
              >
                Use a different number
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

// Add to window interface for TS
declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}

export default VerifyPhone;
