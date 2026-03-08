import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../firebase/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

interface RegisterProps {
  setIsAuthenticated: (val: boolean) => void;
}

const Register: React.FC<RegisterProps> = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    setError(null);
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Update profile with name
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: name
        });

        // Save to Firestore users collection
        await setDoc(doc(db, "users", userCredential.user.uid), {
          name: name,
          email: email,
          uid: userCredential.user.uid,
          role: "SRE", // Default role
          createdAt: serverTimestamp()
        });
      }

      toast.success("Account created successfully! Welcome to ResolveX.");
      setIsAuthenticated(true);
      navigate('/dashboard');

    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to create an account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-8 py-12">
      <div className="w-full max-w-md bg-theme-card border border-theme-border p-10 rounded-2xl shadow-2xl">
        <h2 className="text-2xl font-bold mb-4 text-theme-text">Join ResolveX</h2>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400">
            <i className="fas fa-exclamation-circle mt-0.5"></i>
            <p className="text-xs font-medium leading-relaxed">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-theme-dim uppercase tracking-widest mb-2">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-theme-bg border border-theme-border rounded-lg px-4 py-3 text-theme-text font-medium focus:outline-none focus:border-theme-accent transition-colors"
              placeholder="John Doe"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-theme-dim uppercase tracking-widest mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-theme-bg border border-theme-border rounded-lg px-4 py-3 text-theme-text font-medium focus:outline-none focus:border-theme-accent transition-colors"
              placeholder="john@company.com"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-theme-dim uppercase tracking-widest mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-theme-bg border border-theme-border rounded-lg px-4 py-3 text-theme-text font-medium focus:outline-none focus:border-theme-accent transition-colors"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-theme-dim uppercase tracking-widest mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-theme-bg border border-theme-border rounded-lg px-4 py-3 text-theme-text font-medium focus:outline-none focus:border-theme-accent transition-colors"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
          <div className="py-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-theme-accent hover:bg-orange-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg transition-all shadow-lg shadow-orange/20"
            >
              {loading ? "Creating..." : "Register Account"}
            </button>
          </div>
          <p className="text-center text-theme-dim text-sm">
            Already have an account? <Link to="/login" className="text-theme-accent font-bold hover:underline">Login here</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
