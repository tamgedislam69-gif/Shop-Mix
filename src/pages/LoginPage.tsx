import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';
import { Lock, Mail, Eye, EyeOff, ShieldCheck } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, settings } = useApp();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(email, password)) {
      navigate('/admin');
    } else {
      setError('Invalid credentials. Please contact developer.');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="min-h-[70vh] flex items-center justify-center p-4 bg-gray-50"
    >
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
           <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4" style={{ backgroundColor: `${settings.primaryColor}20` }}>
             <ShieldCheck size={32} style={{ color: settings.primaryColor }} />
           </div>
           <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Admin Portal</h2>
           <p className="text-gray-500 text-sm mt-2">Enter credentials provided by developer</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-xs font-black uppercase text-gray-400 tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@mail.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black uppercase text-gray-400 tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 pl-10 pr-12 outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-xs font-bold text-center"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            className="w-full py-4 rounded-lg font-black uppercase tracking-widest text-sm shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
            style={{ backgroundColor: settings.primaryColor, color: 'white' }}
          >
            Authenticate Access
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col items-center gap-4">
           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Powered by Shop Mix Online BD</p>
           <div className="flex gap-4">
              <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded">V 2.0.4</span>
              <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded">ENCRYPTED</span>
           </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LoginPage;
