'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

export function AuthForm() {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className="bg-white w-full max-w-[540px] rounded-[32px] p-[56px] shadow-[0_20px_60px_-15px_rgba(48,58,60,0.06)] border border-gray-100/80">
      
      {/* Heading & Subtitle */}
      <div className="text-center">
        <h2 className="text-[48px] font-bold text-[#303A3C] tracking-tight leading-tight mb-2">Welcome back</h2>
        <p className="text-[18px] font-medium text-[#303A3C]/60 mb-[32px]">Continue your financial journey.</p>
      </div>

      {/* Google SSO Button (56px height, 16px radius) */}
      <button className="w-full h-[56px] flex items-center justify-center space-x-3 bg-white border border-gray-200 text-[#303A3C] rounded-[16px] font-semibold text-[16px] hover:bg-gray-50 hover:-translate-y-[2px] hover:shadow-md active:translate-y-0 transition-all duration-250 cursor-pointer">
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        <span>Continue with Google</span>
      </button>

      {/* Divider (32px spacing) */}
      <div className="relative flex items-center my-[32px]">
        <div className="flex-grow border-t border-gray-100"></div>
        <span className="flex-shrink-0 mx-4 text-gray-400 text-xs tracking-widest uppercase font-semibold">Or</span>
        <div className="flex-grow border-t border-gray-100"></div>
      </div>

      {/* Form (20px spacing between inputs) */}
      <form className="space-y-[20px]" onSubmit={(e) => { e.preventDefault(); window.location.href='/dashboard'; }}>
        
        {/* Email Input (56px height) */}
        <div className="space-y-1.5">
          <label className="text-[15px] font-semibold text-[#303A3C]">Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input 
              type="email" 
              placeholder="Enter your email"
              className="w-full h-[56px] bg-white border border-gray-200 rounded-[16px] pl-[52px] pr-4 text-[#303A3C] placeholder-gray-400 focus:outline-none focus:border-[#8A9080] focus:ring-1 focus:ring-[#8A9080] focus:shadow-sm transition-all duration-250 text-[16px]"
              required
            />
          </div>
        </div>

        {/* Password Input (56px height) */}
        <div className="space-y-1.5">
          <label className="text-[15px] font-semibold text-[#303A3C]">Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Enter your password"
              className="w-full h-[56px] bg-white border border-gray-200 rounded-[16px] pl-[52px] pr-12 text-[#303A3C] placeholder-gray-400 focus:outline-none focus:border-[#8A9080] focus:ring-1 focus:ring-[#8A9080] focus:shadow-sm transition-all duration-250 text-[16px]"
              required
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Checkbox & Forgot Password (24px bottom spacing) */}
        <div className="flex items-center justify-between pt-1 mb-[24px]">
          <label className="flex items-center space-x-2.5 cursor-pointer group">
            <div className="relative flex items-center justify-center w-5 h-5 border border-gray-300 rounded-[6px] group-hover:border-[#8A9080] transition-colors bg-white">
              <input type="checkbox" className="peer absolute w-full h-full opacity-0 cursor-pointer" />
              <svg className="w-3.5 h-3.5 text-[#303A3C] opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-[14px] font-medium text-[#303A3C]/70 group-hover:text-[#303A3C] transition-colors">Remember me</span>
          </label>
          <Link href="#" className="text-[14px] font-semibold text-[#8A9080] hover:text-[#6c7264] transition-colors">
            Forgot password?
          </Link>
        </div>

        {/* Primary CTA Button (56px height, 16px radius) */}
        <button 
          type="submit"
          className="w-full h-[56px] group flex items-center justify-center space-x-2 bg-[#303A3C] text-[#DDD7C9] rounded-[16px] font-semibold text-[16px] hover:bg-[#232a2c] hover:-translate-y-[2px] hover:shadow-lg active:translate-y-0 transition-all duration-250 cursor-pointer"
        >
          <span>Sign In</span>
          <motion.span 
            className="inline-block"
            initial={{ x: 0 }}
            whileHover={{ x: 4 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            →
          </motion.span>
        </button>
      </form>
      
      {/* Create Account Link */}
      <div className="mt-[28px] text-center text-[15px] font-medium text-gray-500">
        Don't have an account? <Link href="#" className="text-[#8A9080] font-semibold hover:text-[#6c7264] transition-colors ml-1">Create account</Link>
      </div>

      {/* Footer (32px top spacing) */}
      <div className="mt-[32px] pt-[32px] border-t border-gray-100 text-center">
        <p className="text-[13px] text-gray-400 font-medium leading-relaxed">
          By continuing, you agree to our <Link href="#" className="text-gray-500 underline hover:text-[#8A9080] transition-colors">Terms of Service</Link> and <Link href="#" className="text-gray-500 underline hover:text-[#8A9080] transition-colors">Privacy Policy</Link>.
        </p>
      </div>

    </div>
  );
}
