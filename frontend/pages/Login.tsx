import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../firebase/firebase';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';

import toast from 'react-hot-toast';

interface LoginProps {
  setIsAuthenticated: (val: boolean) => void;
}

const Login: React.FC<LoginProps> = ({ setIsAuthenticated }) => {

  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  /* 🔐 Email Login */

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();
    setLoading(true);

    try {

      await signInWithEmailAndPassword(auth, email, password);

      toast.success("Welcome back to ResolveX!");
      setIsAuthenticated(true);
      navigate('/dashboard');

    } catch (error: any) {

      console.error("Login Error:", error);
      let message = "Login failed — check your credentials";

      if (error.code === 'auth/wrong-password') message = "Invalid password";
      if (error.code === 'auth/user-not-found') message = "No account found with this email";
      if (error.code === 'auth/invalid-email') message = "Invalid email format";

      toast.error(message);

    } finally {
      setLoading(false);
    }
  };

  /* 🔵 Google Login */

  const handleGoogleLogin = async () => {
    if (loading) return; // Prevent multiple clicks
    setLoading(true);

    try {

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });

      await signInWithPopup(auth, provider);

      toast.success("Login Successful");
      setIsAuthenticated(true);
      navigate('/dashboard');

    } catch (error: any) {

      console.error("Google Login Error:", error);

      if (error.code === 'auth/popup-closed-by-user') {
        toast.error("Login cancelled — popup closed");
      } else if (error.code === 'auth/cancelled-by-user') {
        toast.error("Login cancelled");
      } else if (error.code === 'auth/cancelled-popup-request') {
        // Specific fix for the user's error
        toast.error("Previous login request was still pending. Please try again.");
      } else {
        toast.error("Google login failed: " + (error.message || "Unknown error"));
      }

    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="min-h-[80vh] flex items-center justify-center px-8 py-12">

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

        <div className="hidden lg:block space-y-6">

          <h1 className="text-6xl font-black leading-tight tracking-tighter text-theme-text">
            Access the AI Engine.
          </h1>

          <p className="text-theme-text opacity-80 text-lg max-w-md font-medium">
            Login to view active incidents, generate reports, and analyze system health with ResolveX AI.
          </p>

        </div>

        <div className="flex justify-center lg:justify-end">

          <div className="w-full max-w-md bg-theme-card border border-theme-border p-10 rounded-2xl shadow-2xl">

            <h2 className="text-2xl font-bold mb-8 text-theme-text">Login</h2>

            <form onSubmit={handleSubmit} className="space-y-6">

              <div>

                <label className="block text-xs font-bold text-theme-dim uppercase tracking-widest mb-2">
                  Username / Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-theme-bg border border-theme-border rounded-lg px-4 py-3 text-theme-text font-medium focus:border-theme-accent outline-none transition-colors"
                  placeholder="Enter your email"
                  required
                />

              </div>

              <div>

                <label className="block text-xs font-bold text-theme-dim uppercase tracking-widest mb-2">
                  Password
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-theme-bg border border-theme-border rounded-lg px-4 py-3 text-theme-text font-medium focus:border-theme-accent outline-none transition-colors"
                  placeholder="••••••••"
                  required
                />

              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-theme-accent hover:bg-orange-dark text-white font-bold py-4 rounded-lg transition-all shadow-lg shadow-orange/20 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Authenticating...' : 'Login'}
              </button>

              <div className="relative py-4">

                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-theme-border"></div>
                </div>

                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-theme-card px-2 text-theme-dim font-bold">
                    Or continue with
                  </span>
                </div>

              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className={`w-full bg-navy text-white hover:bg-navy-dark font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-navy/20 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Opening Google...' : 'Google'}
              </button>

              <p className="text-center text-theme-dim text-sm mt-8">

                Don't have an account?

                <Link to="/register" className="text-theme-accent font-bold hover:underline ml-1">
                  Register now
                </Link>

              </p>

            </form>

          </div>

        </div>

      </div>

    </div>

  );
};

export default Login;