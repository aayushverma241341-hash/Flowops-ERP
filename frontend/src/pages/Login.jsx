import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Lock, User } from 'lucide-react';
import api from '../api/axios';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { username, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/');
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#354A5F] flex items-center justify-center font-sans relative">
      
      {/* SAP Fiori Style Background (Abstract corporate gradient) */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1C2C3F] via-[#293E52] to-[#45627A] opacity-90"></div>
      
      {/* Subtle SAP-like background pattern */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>

      {/* Main Login Container */}
      <div className="z-10 w-full max-w-[420px] bg-white rounded-sm shadow-[0_15px_35px_rgba(0,0,0,0.3)] overflow-hidden">
        
        {/* Header Bar */}
        <div className="h-[6px] w-full bg-[#0a6ed1]"></div>

        <div className="px-10 py-10">
          
          {/* Logo Section */}
          <div className="flex flex-col items-center justify-center mb-8">
            <h1 className="text-4xl font-bold text-[#1C2C3F] tracking-tight mb-1 font-serif">FlowOps</h1>
            <h2 className="text-[#556B82] text-sm font-medium tracking-wide">ENTERPRISE RESOURCE PLANNING</h2>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            
            {error && (
              <div className="bg-[#FFEBEB] border-l-4 border-[#E52929] text-[#E52929] p-3 flex items-start space-x-2 text-sm">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Username Input - Fiori Style */}
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#556B82]">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="User ID"
                    className="block w-full pl-10 pr-3 py-3 border border-[#CCCCCC] rounded-sm text-[#333333] placeholder-[#888888] focus:outline-none focus:border-[#0a6ed1] focus:ring-1 focus:ring-[#0a6ed1] transition-colors text-[15px]"
                  />
                </div>
              </div>

              {/* Password Input - Fiori Style */}
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#556B82]">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="block w-full pl-10 pr-3 py-3 border border-[#CCCCCC] rounded-sm text-[#333333] placeholder-[#888888] focus:outline-none focus:border-[#0a6ed1] focus:ring-1 focus:ring-[#0a6ed1] transition-colors text-[15px]"
                  />
                </div>
              </div>
            </div>

            {/* Login Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-sm text-[15px] font-semibold text-white bg-[#0a6ed1] hover:bg-[#0854a0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0a6ed1] transition-colors shadow-sm disabled:opacity-60"
              >
                {loading ? 'Authenticating...' : 'Log On'}
              </button>
            </div>
            
            {/* Options */}
            <div className="flex justify-between items-center pt-2">
              <a href="#" className="text-sm text-[#0a6ed1] hover:underline">Change Password</a>
              <a href="#" className="text-sm text-[#0a6ed1] hover:underline">Forgot Password?</a>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="bg-[#F2F2F2] border-t border-[#E5E5E5] px-10 py-4 flex justify-between items-center text-[12px] text-[#666666]">
          <span>© 2026 FlowOps SE</span>
          <span>System v2.4</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
