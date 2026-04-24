import React, { useState } from 'react';
import { NetworkBackground } from '../components/NetworkBackground';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Mail, User, Shield, ChevronRight, Eye, EyeOff, Activity } from 'lucide-react';
import { Link } from 'react-router';

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#050B14] flex items-center justify-center p-4 overflow-hidden">
      {/* Background elements */}
      <NetworkBackground />
      <div className="absolute inset-0 bg-gradient-to-tr from-[#0B1220]/80 via-transparent to-[#22D3EE]/5 z-0" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#22D3EE]/10 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo area */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#0B1220]/80 border border-[#22D3EE]/30 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(34,211,238,0.2)] backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#22D3EE]/20 to-transparent opacity-50" />
            <Activity className="w-8 h-8 text-[#22D3EE]" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wider font-mono">FORENSIC<span className="text-[#22D3EE]">.AI</span></h1>
          <p className="text-[#94A3B8] text-sm mt-1 tracking-widest uppercase">Automated Reporting System</p>
        </div>

        {/* Auth Card */}
        <motion.div 
          className="bg-[#0B1220]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl overflow-hidden relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Neon Top Border */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#22D3EE] to-transparent" />

          <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
            <button
              onClick={() => setIsLogin(true)}
              className={`text-lg font-semibold transition-colors duration-300 relative ${isLogin ? 'text-white' : 'text-[#64748B] hover:text-[#94A3B8]'}`}
            >
              Sign In
              {isLogin && (
                <motion.div 
                  layoutId="activeTab" 
                  className="absolute -bottom-[17px] left-0 right-0 h-[2px] bg-[#22D3EE]" 
                />
              )}
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`text-lg font-semibold transition-colors duration-300 relative ${!isLogin ? 'text-white' : 'text-[#64748B] hover:text-[#94A3B8]'}`}
            >
              Register
              {!isLogin && (
                <motion.div 
                  layoutId="activeTab" 
                  className="absolute -bottom-[17px] left-0 right-0 h-[2px] bg-[#22D3EE]" 
                />
              )}
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.form 
              key={isLogin ? 'login' : 'register'}
              initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
              onSubmit={(e) => e.preventDefault()}
            >
              
              {!isLogin && (
                <div className="space-y-1 relative group">
                  <label className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B] group-focus-within:text-[#22D3EE] transition-colors" />
                    <input 
                      type="text" 
                      placeholder="Agent Smith"
                      className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-[#475569] focus:outline-none focus:border-[#22D3EE]/50 focus:bg-[#1e293b]/80 transition-all duration-300"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1 relative group">
                <label className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider ml-1">Work Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B] group-focus-within:text-[#22D3EE] transition-colors" />
                  <input 
                    type="email" 
                    placeholder="agent.smith@forensics.gov"
                    className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-[#475569] focus:outline-none focus:border-[#22D3EE]/50 focus:bg-[#1e293b]/80 transition-all duration-300"
                  />
                </div>
              </div>

              <div className="space-y-1 relative group">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Password</label>
                  {isLogin && <a href="#" className="text-xs text-[#22D3EE] hover:text-[#38bdf8] transition-colors">Forgot?</a>}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B] group-focus-within:text-[#22D3EE] transition-colors" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••••••"
                    className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl py-3 pl-11 pr-11 text-white placeholder-[#475569] focus:outline-none focus:border-[#22D3EE]/50 focus:bg-[#1e293b]/80 transition-all duration-300"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-1 relative group">
                  <label className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider ml-1">Access Level</label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B] group-focus-within:text-[#22D3EE] transition-colors" />
                    <select className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:border-[#22D3EE]/50 focus:bg-[#1e293b]/80 transition-all duration-300 appearance-none cursor-pointer">
                      <option value="analyst">Forensic Analyst</option>
                      <option value="investigator">Lead Investigator</option>
                      <option value="admin">System Admin</option>
                    </select>
                    <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] rotate-90" />
                  </div>
                </div>
              )}

              <button className="w-full mt-6 bg-[#22D3EE] hover:bg-[#06b6d4] text-[#0f172a] font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all duration-300 shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_25px_rgba(34,211,238,0.5)]">
                <span>{isLogin ? 'Initiate Session' : 'Request Access'}</span>
                <ChevronRight className="w-5 h-5" />
              </button>
              
            </motion.form>
          </AnimatePresence>
          
          <div className="mt-8 text-center border-t border-white/5 pt-6">
            <p className="text-[#64748B] text-xs">
              Secure connection established. All activities are monitored and logged.
            </p>
          </div>
        </motion.div>
        
        {/* Back to Home Link */}
        <div className="mt-8 text-center">
          <Link to="/" className="text-[#64748B] hover:text-[#22D3EE] text-sm transition-colors flex items-center justify-center space-x-1">
            <ChevronRight className="w-4 h-4 rotate-180" />
            <span>Return to Dashboard Overview</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
