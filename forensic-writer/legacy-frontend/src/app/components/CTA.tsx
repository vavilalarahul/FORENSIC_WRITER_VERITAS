import React from 'react';
import { motion } from 'motion/react';
import { Shield, ChevronRight } from 'lucide-react';

export function CTA() {
  return (
    <section className="py-32 bg-[#0B1220] relative border-t border-[#1F2937] overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.08),transparent_50%)] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-b from-[#111827]/90 to-[#0B1220] backdrop-blur-xl border border-[#1F2937] p-12 md:p-20 rounded-[3rem] shadow-[0_0_50px_rgba(34,211,238,0.05)] relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-40 h-40 bg-[#22D3EE]/20 blur-[80px]" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-[#3B82F6]/20 blur-[80px]" />
          
          <div className="inline-flex p-4 rounded-2xl bg-[#0B1220] border border-[#1F2937] shadow-[inset_0_0_20px_rgba(34,211,238,0.1)] mb-8">
            <Shield size={40} className="text-[#22D3EE]" />
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 font-['Space_Grotesk'] leading-tight">
            Transform Raw Digital Evidence Into <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22D3EE] to-[#3B82F6]">
              Structured Investigation Reports
            </span>
          </h2>

          <button className="group relative inline-flex items-center gap-3 px-10 py-5 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold text-lg rounded-xl overflow-hidden transition-all duration-300 shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_40px_rgba(34,211,238,0.5)]">
            <span>Start Investigation</span>
            <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#0B1220] border-t border-[#1F2937] py-12 relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Shield size={24} className="text-[#22D3EE]" />
            <span className="text-[#E5E7EB] font-bold text-lg tracking-tight font-['Space_Grotesk']">
              AutoForensics<span className="text-[#22D3EE]">.AI</span>
            </span>
          </div>

          <div className="text-[#9CA3AF] text-sm text-center font-['Inter'] flex flex-col items-center">
            <span className="font-semibold text-[#E5E7EB] mb-2 uppercase tracking-widest text-xs">Cybersecurity with Web + AI Integration</span>
            <span className="bg-[#111827] px-4 py-1.5 rounded-full border border-[#1F2937] text-xs">
              For Official Digital Forensic Investigation Use Only
            </span>
          </div>

          <div className="flex gap-6">
            <a href="#" className="text-[#9CA3AF] hover:text-[#22D3EE] transition-colors text-sm font-['Inter']">Privacy</a>
            <a href="#" className="text-[#9CA3AF] hover:text-[#22D3EE] transition-colors text-sm font-['Inter']">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
