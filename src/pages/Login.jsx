import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios'; // Make sure path points to your axios instance

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const response = await api.post('/auth/login', { email, password });
      
      console.log('Login API Response:', response.data);

      // Robust token extraction checking all common backend key names
      const token =
        response.data.token ||
        response.data.jwt ||
        response.data.accessToken ||
        response.data.jwtToken;

      if (token) {
        // Save valid token
        localStorage.setItem('token', token);

        // Store user payload
        const userData = response.data.user || response.data;
        localStorage.setItem('user', JSON.stringify(userData));

        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        console.error('Token key missing in response payload:', response.data);
        setErrorMsg('Authentication error: Server did not provide a token.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to sign in. Please check your credentials.');
    }
  };

  return (
    <div className="login-container">
      <h2>Sign In to ChequeMate</h2>
      {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
      
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>
        
        <div>
          <label>Password:</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>

        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;