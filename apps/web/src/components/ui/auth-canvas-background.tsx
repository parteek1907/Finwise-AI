import React from "react";
import Image from "next/image";

export function AuthCanvasBackground() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[24px] bg-[#1E2223] shadow-2xl p-6 sm:p-10">
      
      {/* Very subtle ambient lighting in the background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#303A3C]/40 via-transparent to-transparent opacity-80" />
      
      {/* Premium Minimal Box */}
      <div className="relative z-10 w-full max-w-[440px] rounded-3xl border border-[#DDD7C9]/[0.06] bg-[#232A2C]/80 p-10 sm:p-12 backdrop-blur-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]">
        
        {/* Soft top accent glow */}
        <div className="absolute top-0 left-[20%] right-[20%] h-[1px] bg-gradient-to-r from-transparent via-[#8A9080]/40 to-transparent" />

        {/* Logo Section */}
        <div className="flex items-center gap-4 mb-8">
          <Image 
            src="/logo.png" 
            alt="FinWise AI Logo" 
            width={56} 
            height={56} 
            className="object-contain"
          />
          <span className="text-3xl font-bold font-heading text-[#DDD7C9] tracking-tight leading-none pt-2">
            FinWise AI
          </span>
        </div>

        {/* Content */}
        <p className="text-[#DDD7C9]/60 text-[15px] leading-[1.85] font-light tracking-wide mb-10">
          An intelligent ecosystem designed to elevate your financial literacy. Master the markets, avoid emotional decisions, and build confidence before you build wealth.
        </p>

        {/* Minimal Footer / Divider */}
        <div className="flex items-center gap-4 opacity-80">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#DDD7C9]/10" />
          <span className="text-[9px] uppercase tracking-[0.25em] font-medium text-[#8A9080]">
            Smarter Investing
          </span>
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#DDD7C9]/10" />
        </div>

      </div>

    </div>
  );
}
