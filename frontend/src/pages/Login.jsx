import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, AlertCircle, FolderKanban, Lock, User, ArrowRight } from 'lucide-react';
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
      window.location.reload(); // Refresh to update auth state
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login. Check credentials and server status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex relative overflow-hidden font-sans">
      
      {/* Background Decorators */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/20 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Split Layout Container */}
      <div className="w-full flex">
        
        {/* Left Side: Login Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 z-10">
          <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
            
            {/* Logo */}
            <div className="flex items-center space-x-3 mb-10 justify-center lg:justify-start">
              <div className="bg-gradient-to-br from-indigo-500 to-cyan-500 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-500/30 ring-2 ring-indigo-500/20">
                <FolderKanban size={28} strokeWidth={2.5} />
              </div>
              <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight font-heading">
                FlowOps
              </span>
            </div>

            {/* Headers */}
            <div className="text-center lg:text-left mb-8">
              <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Welcome back</h1>
              <p className="text-slate-400 font-medium text-sm">Enter your credentials to access the ERP command center.</p>
            </div>

            {/* Login Card */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-cyan-500"></div>
              
              <form className="space-y-5" onSubmit={handleLogin}>
                {error && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-start space-x-3 text-sm animate-in fade-in slide-in-from-top-2">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <span className="font-medium leading-tight">{error}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-widest ml-1">Username</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                      <User size={18} />
                    </div>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="admin"
                      className="block w-full pl-11 pr-4 py-3 bg-[#0f172a]/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all sm:text-sm shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-widest">Password</label>
                    <a href="#" className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors">Forgot?</a>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                      <Lock size={18} />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="block w-full pl-11 pr-4 py-3 bg-[#0f172a]/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all sm:text-sm shadow-inner"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="group w-full flex justify-center items-center py-3 px-4 rounded-xl shadow-[0_0_20px_-5px_rgba(99,102,241,0.4)] text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#020617] focus:ring-indigo-500 disabled:opacity-50 transition-all duration-200"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Authenticating...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between w-full px-2">
                        <span>Sign In</span>
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </button>
                </div>
              </form>
            </div>
            
            <p className="mt-8 text-center text-xs text-slate-500 font-medium">
              Secure Enterprise Portal &copy; 2026 FlowOps Inc.
            </p>
          </div>
        </div>

        {/* Right Side: Visual Hero (Hidden on Mobile) */}
        <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-center items-center overflow-hidden border-l border-white/5">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2940&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/80 to-transparent"></div>
          
          <div className="relative z-10 max-w-lg p-12 animate-in fade-in slide-in-from-right-12 duration-1000 delay-300">
            <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-full mb-6">
              <span className="flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <span className="text-xs font-medium text-indigo-300 tracking-wide uppercase">System v2.4 Online</span>
            </div>
            
            <h2 className="text-4xl font-extrabold text-white leading-tight tracking-tight mb-6">
              The command center for your entire enterprise.
            </h2>
            
            <div className="space-y-4">
              {[
                { icon: '📊', text: 'Real-time financial ledgers & automated reconciliation' },
                { icon: '🏭', text: 'End-to-end production & warehouse tracking' },
                { icon: '👥', text: 'Integrated human capital management' }
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center space-x-4 text-slate-300 bg-white/5 border border-white/5 rounded-xl p-4 backdrop-blur-sm">
                  <div className="text-xl">{feature.icon}</div>
                  <span className="text-sm font-medium">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
