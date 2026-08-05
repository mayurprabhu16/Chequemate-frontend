import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import Logo from '../components/Logo';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });

      console.log('Backend response:', response.data);

      // 1. Extract Token safely (top level or nested)
      const token =
        response.data.token ||
        response.data.jwt ||
        response.data.accessToken ||
        response.data.jwtToken;

      // 2. Extract User Details safely (handles nested user object or root response)
      const userData = response.data.user || response.data;
      const userId = userData.userId || userData.id;
      const name = userData.name || userData.username;
      const userEmail = userData.email || email;

      if (!token) {
        throw new Error('No token provided by server response.');
      }

      // Pass user object and token to AuthContext
      login({ userId, name, email: userEmail }, token);

      navigate('/dashboard');
    } catch (err) {
      if (err.response && err.response.data) {
        setError(
          typeof err.response.data === 'string'
            ? err.response.data
            : err.response.data.message || 'Invalid email or password.'
        );
      } else {
        setError('Server error. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cm-auth-page">
      {/* Brand panel */}
      <div className="cm-auth-brand">
        <div className="cm-brand-mark">
          <Logo />
          <span>ChequeMate</span>
        </div>

        <div className="cm-brand-hero">
          <h1>Split the bill. Not the friendship.</h1>
          <p>Track who paid, who owes, and settle up in one tidy ledger — built for trips, flats, and everything in between.</p>

          <div className="cm-cheque-card">
            <div className="cm-cheque-row">
              <span>Goa Trip · Dinner at the shack</span>
              <strong>₹2,400.00</strong>
            </div>
            <div className="cm-cheque-row">
              <span>Split 4 ways, equally</span>
              <strong>₹600.00 each</strong>
            </div>
            <div className="cm-cheque-row">
              <span>Status</span>
              <strong>Settled ✓</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="cm-auth-formside">
        <div className="cm-auth-card">
          <h2>Welcome back</h2>
          <p className="cm-auth-subtitle">Sign in to manage your group expenses.</p>

          {error && <div className="cm-error-banner">{error}</div>}

          <form onSubmit={handleSubmit} className="cm-auth-form">
            <div className="cm-field">
              <label className="cm-label">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="cm-input"
              />
            </div>

            <div className="cm-field">
              <label className="cm-label">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="cm-input"
              />
            </div>

            <button type="submit" disabled={loading} className="cm-btn cm-btn--primary cm-btn--full">
              {loading ? <><span className="cm-dot-spin" /> Signing in…</> : 'Sign in'}
            </button>
          </form>

          <p className="cm-auth-footer">
            Don't have an account?{' '}
            <Link to="/register">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;