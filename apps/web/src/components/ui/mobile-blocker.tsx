import React from 'react';
import Image from 'next/image';
import { Monitor, Sparkles } from 'lucide-react';

export function MobileBlocker() {
  return (
    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#1E2223] text-[#DDD7C9] lg:hidden overflow-hidden p-6 text-center antialiased">
      
      {/* Premium Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#303A3C]/40 via-transparent to-transparent opacity-80" />
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#8A9080]/40 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#8A9080]/40 to-transparent" />

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-sm mx-auto flex flex-col items-center">
        
        {/* Logo Section */}
        <div className="flex items-center gap-3 mb-12">
          <Image 
            src="/logo.png" 
            alt="FinWise AI Logo" 
            width={48} 
            height={48} 
            className="object-contain"
          />
          <span className="text-2xl font-bold font-heading tracking-tight leading-none pt-1">
            FinWise AI
          </span>
        </div>

        {/* Hero Icon */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-[#DDD7C9]/10 blur-2xl rounded-full" />
          <div className="relative w-24 h-24 rounded-full border border-[#DDD7C9]/10 bg-[#303A3C]/50 flex items-center justify-center backdrop-blur-md shadow-2xl">
            <Monitor size={36} className="text-[#DDD7C9] opacity-90" />
            <Sparkles size={16} className="absolute -top-1 -right-1 text-[#8A9080]" />
          </div>
        </div>

        {/* Typography */}
        <h1 className="text-[26px] font-bold tracking-tight mb-4 leading-tight">
          Desktop Experience <br />Required
        </h1>
        
        <p className="text-[15px] text-[#DDD7C9]/60 leading-relaxed font-light mb-10 max-w-[280px]">
          FinWise AI features complex charting, multi-layered dashboards, and advanced simulator environments. 
          <br /><br />
          To ensure an uncompromised, premium experience, please access this platform on a desktop or laptop device.
        </p>

        {/* Minimal Footer / Divider */}
        <div className="flex items-center gap-4 w-full opacity-60">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#DDD7C9]/20" />
          <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-[#8A9080]">
            Smarter Investing
          </span>
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#DDD7C9]/20" />
        </div>

      </div>
    </div>
  );
}
