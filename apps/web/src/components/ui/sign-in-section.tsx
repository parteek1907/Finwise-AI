"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ArrowRight, LineChart } from "lucide-react";
import Link from "next/link";

import { AuthCanvasBackground } from "./auth-canvas-background";

export default function SignInSection() {

  return (
    <section className="min-h-screen bg-[#DDD7C9] p-4 md:p-8 text-[#303A3C] antialiased font-inter flex items-center justify-center">
      <div className="w-full max-w-[1400px] grid min-h-[calc(100vh-4rem)] gap-8 lg:grid-cols-[0.95fr_1.05fr] items-center">
        
        <div className="flex h-full min-h-[600px] w-full">
          <AuthCanvasBackground />
        </div>

        {/* RIGHT PANEL - AUTH FORM CONTAINER */}
        <div className="flex h-full w-full items-center justify-center p-4 sm:p-8 lg:p-12">
          <AuthForm />
        </div>
      </div>
    </section>
  );
}



function AuthForm() {
  return (
    <div className="w-full text-left flex flex-col" style={{ maxWidth: 480, padding: '0 8px' }}>
      
      {/* Title & Subtitle */}
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: '#303A3C', whiteSpace: 'nowrap', lineHeight: 1.1 }}>
          Welcome back
        </h1>
        <p style={{ marginTop: 2, fontSize: 14, fontWeight: 400, color: 'rgba(48,58,60,0.5)', lineHeight: 1.5 }}>
          Enter your details to sign in to your account.
        </p>
      </div>

      {/* Social SSO Buttons */}
      <div className="grid sm:grid-cols-2" style={{ marginTop: 16, gap: 10 }}>
        <SocialButton icon={<GoogleIcon />} label="Sign in with Google" />
        <SocialButton icon={<AppleIcon />} label="Sign in with Apple" />
      </div>

      {/* Divider */}
      <div className="flex items-center text-[11px] font-bold tracking-[0.2em] uppercase" style={{ marginTop: 12, marginBottom: 12, gap: 12, color: 'rgba(48,58,60,0.3)' }}>
        <div className="h-px flex-1 bg-[#303A3C]/15" />
        OR
        <div className="h-px flex-1 bg-[#303A3C]/15" />
      </div>

      {/* Form Fields */}
      <form className="flex flex-col" onSubmit={(e) => { e.preventDefault(); window.location.href='/dashboard'; }}>
        
        {/* Email */}
        <div style={{ marginTop: 10 }}>
          <InputField placeholder="Email" type="email" id="email" />
        </div>

        {/* Password */}
        <div style={{ marginTop: 10 }}>
          <InputField placeholder="Password" type="password" id="password" />
        </div>

        {/* Checkbox Section */}
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, lineHeight: 1.6, color: 'rgba(48,58,60,0.6)' }}>
          <CheckboxLine id="remember">
            Remember me for 30 days
          </CheckboxLine>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full items-center justify-center bg-[#303A3C] font-semibold text-[#DDD7C9] transition-all hover:bg-[#232a2c] active:scale-[0.99] shadow-md hover:shadow-lg"
          style={{ marginTop: 16, height: 46, borderRadius: 12, fontSize: 15 }}
        >
          Sign In
        </button>
      </form>

      {/* Switch to Sign Up */}
      <div style={{ marginTop: 24, textAlign: 'center', fontSize: 14, color: 'rgba(48,58,60,0.6)' }}>
        Don&apos;t have an account?{' '}
        <Link href="/auth" className="font-semibold text-[#303A3C] hover:underline underline-offset-4">
          Sign up
        </Link>
      </div>
    </div>
  );
}

function SocialButton({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-center gap-3 rounded-[12px] border border-[#303A3C]/20 bg-transparent text-[14px] font-semibold text-[#303A3C] transition-all hover:bg-[#303A3C]/5 hover:border-[#303A3C]/40"
      style={{ height: 44, paddingLeft: 24, paddingRight: 24 }}
    >
      <span className="shrink-0">{icon}</span>
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}

function InputField({
  placeholder,
  type = "text",
  id,
}: {
  placeholder: string;
  type?: string;
  id: string;
}) {
  return (
    <div className="relative w-full">
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full border border-[#303A3C]/20 bg-transparent text-[14px] text-[#303A3C] font-medium transition-all placeholder:text-[#303A3C]/45 focus:border-[#303A3C] focus:bg-[#303A3C]/5 focus:outline-none focus:ring-1 focus:ring-[#303A3C]"
        style={{ height: 46, borderRadius: 12, paddingLeft: 20, paddingRight: 20 }}
      />
    </div>
  );
}

function CheckboxLine({ id, children }: { id: string; children: ReactNode }) {
  return (
    <label htmlFor={id} className="flex items-start gap-3 cursor-pointer group">
      <span className="relative mt-0.5 size-[18px] shrink-0">
        <input
          id={id}
          type="checkbox"
          className="peer size-full appearance-none rounded-[5px] border border-[#303A3C]/35 bg-transparent checked:border-[#303A3C] checked:bg-[#303A3C] transition-all"
        />
        <svg
          viewBox="0 0 12 12"
          className="pointer-events-none absolute inset-0 hidden size-full p-[3px] text-[#DDD7C9] peer-checked:block"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M2.5 6 5 8.5 9.5 3.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="select-none leading-relaxed">{children}</span>
    </label>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" fill="#34A853" />
      <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84Z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z" fill="#EB4335" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.05 12.54c-.03-3.02 2.47-4.47 2.58-4.54-1.41-2.06-3.6-2.34-4.38-2.37-1.86-.19-3.64 1.1-4.58 1.1-.95 0-2.42-1.07-3.98-1.04-2.05.03-3.94 1.19-4.99 3.02-2.13 3.69-.54 9.16 1.53 12.15 1.01 1.46 2.22 3.1 3.81 3.04 1.53-.06 2.11-.99 3.96-.99s2.37.99 3.99.96c1.65-.03 2.69-1.49 3.69-2.96 1.16-1.69 1.64-3.33 1.66-3.41-.04-.02-3.2-1.23-3.24-4.87ZM14.03 3.66c.84-1.02 1.41-2.43 1.25-3.84-1.21.05-2.68.81-3.55 1.83-.78.9-1.46 2.34-1.28 3.72 1.35.1 2.73-.69 3.58-1.71Z" />
    </svg>
  );
}
