import React from 'react';
import { motion } from 'motion/react';
import { Shield, ChevronRight } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 pb-16 px-4 overflow-hidden bg-[#0B1220]">
      {/* Cyber Grid & Scanning Lines */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1F2937_1px,transparent_1px),linear-gradient(to_bottom,#1F2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_20%,transparent_100%)] opacity-20" />
        
        {/* Scanning Line */}
        <motion.div 
          animate={{ y: ['-100%', '200%'] }}
          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
          className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#22D3EE] to-transparent opacity-30 shadow-[0_0_20px_#22D3EE]"
        />

        {/* Glowing Particles Simulation */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              y: [0, -20, 0], 
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 3 + Math.random() * 2, 
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
            className="absolute rounded-full bg-[#22D3EE]"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              boxShadow: '0 0 10px #22D3EE'
            }}
          />
        ))}

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#3B82F6] opacity-[0.1] blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#22D3EE] opacity-[0.05] blur-[100px] rounded-full pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#22D3EE]/30 bg-[#22D3EE]/10 text-[#22D3EE] text-sm font-medium mb-8"
        >
          <Shield size={16} />
          <span>Professional Investigation Platform</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight font-['Space_Grotesk']"
        >
          Automated Digital Forensics <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22D3EE] to-[#3B82F6]">
            Reporting Tool
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-[#9CA3AF] text-lg md:text-xl max-w-3xl mx-auto mb-10 leading-relaxed font-['Inter']"
        >
          AI-assisted system that converts raw digital forensic data such as logs and metadata into structured investigation reports that can be used as legal evidence.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button className="group relative px-8 py-4 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold rounded-lg overflow-hidden transition-all duration-300 shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] flex items-center gap-2">
            <span>Start Investigation</span>
            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
          </button>
          
          <button className="px-8 py-4 bg-[#111827]/80 hover:bg-[#1F2937] text-[#E5E7EB] border border-[#1F2937] hover:border-[#22D3EE]/50 font-semibold rounded-lg transition-all duration-300 backdrop-blur-md hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]">
            View Workflow
          </button>
        </motion.div>
      </div>
    </section>
  );
}
