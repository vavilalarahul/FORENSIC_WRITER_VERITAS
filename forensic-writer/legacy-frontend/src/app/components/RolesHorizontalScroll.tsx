import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ShieldAlert, Search, Gavel } from 'lucide-react';

const panels = [
  {
    icon: <ShieldAlert size={40} className="text-[#22D3EE]" />,
    title: "System Administrator",
    tasks: ["Manage users and permissions", "Assign system roles", "Monitor overarching system activity"],
    preview: "Admin Console Active"
  },
  {
    icon: <Search size={40} className="text-[#3B82F6]" />,
    title: "Forensic Investigator",
    tasks: ["Create new investigation cases", "Upload raw digital evidence", "Analyze extracted metadata logs"],
    preview: "Investigation Workspace"
  },
  {
    icon: <Gavel size={40} className="text-purple-400" />,
    title: "Legal Authority",
    tasks: ["Review generated investigation reports", "Verify evidence SHA-256 authenticity", "Download court-ready documents"],
    preview: "Review & Audit Log"
  }
];

export function RolesHorizontalScroll() {
  const targetRef = useRef<HTMLDivElement>(null);
  
  // Create a 300vh tall container to allow for vertical scrolling
  // Map that vertical scroll progress to horizontal translation
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  // 3 panels total. Container is w-[300vw].
  // To show all 3, we move from 0 to -66.666% (which is the start of the 3rd panel)
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-66.6666%"]);

  return (
    <section ref={targetRef} className="h-[300vh] bg-[#0B1220] relative">
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden border-t border-[#1F2937]">
        
        <div className="absolute top-16 w-full text-center z-20 pointer-events-none">
          <h2 className="text-[#22D3EE] font-semibold tracking-wider uppercase text-sm mb-2">Access Control</h2>
          <h3 className="text-3xl md:text-5xl font-bold text-white font-['Space_Grotesk']">Role Based System Access</h3>
        </div>

        <motion.div style={{ x }} className="flex w-[300vw] h-[60vh] mt-20">
          {panels.map((panel, idx) => (
            <div key={idx} className="w-[100vw] h-full flex items-center justify-center px-4 sm:px-12 md:px-24">
              <div className="w-full max-w-4xl bg-gradient-to-br from-[#1F2937]/50 to-[#111827] rounded-3xl border border-[#1F2937] p-8 md:p-16 flex flex-col md:flex-row items-center gap-12 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden group">
                
                {/* Glow Background */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#3B82F6] opacity-[0.05] blur-[80px] rounded-full group-hover:opacity-[0.1] transition-opacity duration-700" />
                
                {/* Icon & Title */}
                <div className="flex-1 text-center md:text-left relative z-10">
                  <div className="inline-flex p-6 rounded-2xl bg-[#0B1220] border border-[#1F2937] shadow-[inset_0_0_20px_rgba(34,211,238,0.1)] mb-8">
                    {panel.icon}
                  </div>
                  <h4 className="text-3xl md:text-4xl font-bold text-[#E5E7EB] mb-6 font-['Space_Grotesk']">
                    {panel.title}
                  </h4>
                  <ul className="space-y-4 text-[#9CA3AF] text-lg font-['Inter'] text-left">
                    {panel.tasks.map((task, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#22D3EE] shadow-[0_0_5px_#22D3EE]" />
                        {task}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Dashboard Preview Mock */}
                <div className="flex-1 w-full bg-[#0B1220] rounded-xl p-6 border border-[#1F2937] shadow-xl relative z-10 hidden md:block">
                  <div className="flex items-center justify-between mb-6 border-b border-[#1F2937] pb-4">
                    <span className="text-xs text-[#22D3EE] font-mono tracking-wider">{panel.preview}</span>
                    <div className="flex gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-red-500/80" />
                      <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                      <span className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-4 bg-[#1F2937] rounded w-3/4 animate-pulse" />
                    <div className="h-4 bg-[#1F2937] rounded w-1/2 animate-pulse animation-delay-200" />
                    <div className="h-4 bg-[#1F2937] rounded w-5/6 animate-pulse animation-delay-400" />
                  </div>
                  <div className="mt-8 pt-4 border-t border-[#1F2937]">
                     <div className="h-10 bg-[#3B82F6]/20 rounded-lg w-full border border-[#3B82F6]/30 flex items-center justify-center">
                        <span className="text-[#3B82F6] text-sm font-semibold">Access Authorized</span>
                     </div>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </motion.div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[#9CA3AF] text-sm font-mono flex items-center gap-2 animate-bounce">
          Scroll Down to Explore Roles ↓
        </div>

      </div>
    </section>
  );
}
