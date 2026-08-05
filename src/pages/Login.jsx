import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      
      console.log('Login Response:', response.data);

      // Extract token regardless of key name used by backend
      const token =
        response.data.token ||
        response.data.jwt ||
        response.data.accessToken ||
        response.data.jwtToken;

      if (token) {
        localStorage.setItem('token', token);

        const userData = response.data.user || response.data;
        localStorage.setItem('user', JSON.stringify(userData));

        navigate('/dashboard');
      } else {
        setErrorMsg('Authentication failed: No token received from server.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg(
        err.response?.data?.message || 'Invalid credentials. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full font-mono bg-[#f6f3e7]">
      {/* Left Panel - Dark Green Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0c2a1e] text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Logo */}
        <div className="flex items-center space-x-2 z-10">
          <span className="text-xl font-bold tracking-tight text-[#e0f0df] flex items-center gap-2">
            <span className="border border-[#e0f0df] px-1 rounded text-sm">✓</span> ChequeMate
          </span>
        </div>

        {/* Hero Text */}
        <div className="max-w-md z-10 my-auto">
          <h1 className="text-5xl font-extrabold tracking-tight leading-tight mb-6 text-[#f6f3e7]">
            Split the bill. Not the friendship.
          </h1>
          <p className="text-sm text-[#a3c2b2] leading-relaxed">
            Track who paid, who owes, and settle up in one tidy ledger — built for trips, flats, and everything in between.
          </p>
        </div>

        {/* Floating Ledger Card Preview */}
        <div className="bg-[#123828]/90 border border-[#1b4e39] p-5 rounded-xl z-10 shadow-2xl backdrop-blur-sm max-w-sm">
          <div className="flex justify-between items-center text-xs text-[#a3c2b2] mb-3">
            <span>Goa Trip - Dinner at the shack</span>
            <span className="font-bold text-[#f6f3e7]">₹2,400.00</span>
          </div>
          <div className="flex justify-between items-center text-xs text-[#82a895] mb-2">
            <span>Split 4 ways, equally</span>
            <span>₹600.00 each</span>
          </div>
          <div className="flex justify-between items-center text-xs pt-2 border-t border-[#1b4e39]">
            <span className="text-[#648f7a]">Status</span>
            <span className="text-[#a3c2b2] font-semibold flex items-center gap-1">
              Settled <span className="text-emerald-400 text-[10px]">✓</span>
            </span>
          </div>
        </div>
      </div>

      {/* Right Panel - Cream Sign In Form */}
      <div className="w-full lg:w-1/2 bg-[#f6f3e7] text-slate-800 flex flex-col justify-center items-center p-8 sm:p-12">
        <div className="w-full max-w-md space-y-6">
          
          <div>
            <h2 className="text-3xl font-bold text-[#112218] tracking-tight">
              Welcome back
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Sign in to manage your group expenses.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded text-xs">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                EMAIL ADDRESS
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-md text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0c2a1e] focus:border-[#0c2a1e] transition-all"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                PASSWORD
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-md text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0c2a1e] focus:border-[#0c2a1e] transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#0c2a1e] hover:bg-[#143e2e] text-[#f6f3e7] font-bold text-xs tracking-widest uppercase rounded-md transition-colors shadow-md disabled:opacity-50"
            >
              {loading ? 'SIGNING IN...' : 'SIGN IN'}
            </button>
          </form>

          <div className="text-center pt-2">
            <p className="text-xs text-slate-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-[#0c2a1e] underline hover:text-emerald-900">
                Register here
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;