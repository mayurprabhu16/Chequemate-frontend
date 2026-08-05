import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import Logo from '../components/Logo';

const Register = () => {
  const [name, setName] = useState('');
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
      const response = await api.post('/auth/register', { name, email, password });

      // Auto-login upon successful registration
      const { token, userId, name: userName, email: userEmail } = response.data;
      login({ userId, name: userName, email: userEmail }, token);

      navigate('/dashboard');
    } catch (err) {
      if (err.response && err.response.data) {
        setError(typeof err.response.data === 'string' ? err.response.data : 'Registration failed.');
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
          <h1>One ledger. Every trip. No maths.</h1>
          <p>Add your crew, log expenses as they happen, and let ChequeMate work out exactly who owes what.</p>

          <div className="cm-cheque-card">
            <div className="cm-cheque-row">
              <span>Flat 302 · Groceries</span>
              <strong>₹1,180.00</strong>
            </div>
            <div className="cm-cheque-row">
              <span>Riya owes Aditya</span>
              <strong>₹390.00</strong>
            </div>
            <div className="cm-cheque-row">
              <span>Status</span>
              <strong>Pending</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="cm-auth-formside">
        <div className="cm-auth-card">
          <h2>Create your account</h2>
          <p className="cm-auth-subtitle">Join ChequeMate to split bills seamlessly.</p>

          {error && <div className="cm-error-banner">{error}</div>}

          <form onSubmit={handleSubmit} className="cm-auth-form">
            <div className="cm-field">
              <label className="cm-label">Full name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alice Smith"
                className="cm-input"
              />
            </div>

            <div className="cm-field">
              <label className="cm-label">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alice@example.com"
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
              {loading ? <><span className="cm-dot-spin" /> Creating account…</> : 'Register'}
            </button>
          </form>

          <p className="cm-auth-footer">
            Already have an account?{' '}
            <Link to="/login">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
