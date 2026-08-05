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

      // Extract token regardless of key name used by backend (token, jwt, accessToken, jwtToken)
      const token =
        response.data.token ||
        response.data.jwt ||
        response.data.accessToken ||
        response.data.jwtToken;

      if (token) {
        // Save valid token to LocalStorage
        localStorage.setItem('token', token);

        // Store user payload
        const userData = response.data.user || response.data;
        localStorage.setItem('user', JSON.stringify(userData));

        // Navigate to dashboard
        navigate('/dashboard');
      } else {
        setErrorMsg('Authentication error: Server did not provide a valid token.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg(
        err.response?.data?.message || 'Invalid email or password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Sign In to ChequeMate</h2>
        
        {errorMsg && <p className="error-message" style={{ color: 'red' }}>{errorMsg}</p>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Signing In...' : 'Login'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;