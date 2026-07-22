"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ArrowRight, LineChart } from "lucide-react";

const images = [
  "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1579225663317-c020947604be?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop",
];

const prompts = [
  "Master the psychology of investing and avoid emotional decisions during market volatility.",
  "Learn how to spot and avoid common financial scams and predatory investment schemes.",
  "Build a resilient, long-term portfolio tailored to your unique financial goals.",
  "Understand complex financial metrics and read between the lines of corporate reports.",
];

const termsText = (
  <>
    By creating an account, you agree to our{" "}
    <a
      href="#"
      className="font-medium text-[#303A3C] underline underline-offset-4 hover:text-[#8A9080]"
    >
      Terms and Services
    </a>{" "}
    and{" "}
    <a
      href="#"
      className="font-medium text-[#303A3C] underline underline-offset-4 hover:text-[#8A9080]"
    >
      Privacy Policy
    </a>
  </>
);

export default function AuthSectionTwo() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length);
    }, 4000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <section className="min-h-screen bg-[#DDD7C9] p-4 md:p-8 text-[#303A3C] antialiased font-inter flex items-center justify-center">
      <div className="w-full max-w-[1400px] grid min-h-[calc(100vh-4rem)] gap-8 lg:grid-cols-[0.95fr_1.05fr] items-center">
        
        {/* LEFT PANEL */}
        <div className="flex h-full min-h-[600px] justify-center overflow-hidden rounded-[24px] bg-[#303A3C] px-8 py-12 text-[#DDD7C9] sm:px-12 lg:py-16 shadow-2xl">
          <div className="flex w-full max-w-[480px] flex-col items-center h-full justify-between">
            
            {/* Logo */}
            <div className="flex items-center gap-3 text-2xl font-bold font-heading text-[#DDD7C9]">
              <LineChart className="size-8" />
              FinWise AI
            </div>

            {/* Images Grid */}
            <div className="relative mt-10 grid w-full grid-cols-[1.55fr_1fr] gap-2.5 rounded-md">
              <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-16 bg-gradient-to-b from-[#303A3C] to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-20 bg-gradient-to-t from-[#303A3C] to-transparent" />
              <ImageTile
                src={images[0]}
                active={activeIndex === 0}
                className="row-span-2 h-[240px]"
              />
              <ImageTile
                src={images[1]}
                active={activeIndex === 1}
                className="h-[115px]"
              />
              <ImageTile
                src={images[3]}
                active={activeIndex === 3}
                className="h-[115px]"
              />
              <ImageTile
                src={images[2]}
                active={activeIndex === 2}
                className="col-span-2 h-[115px]"
              />
            </div>

            {/* Insight Card */}
            <div className="mt-10 w-full rounded-[16px] border border-dashed border-[#DDD7C9]/20 p-5 bg-[#303A3C]/60 backdrop-blur-sm">
              <div className="flex items-end gap-4">
                <p className="line-clamp-3 flex-1 text-[13px] leading-relaxed text-[#DDD7C9]/80">
                  <span className="font-bold text-[#8A9080] uppercase tracking-wider text-[10px] block mb-1.5">/insight</span>
                  {prompts[activeIndex]}
                </p>
                <button className="grid size-9 shrink-0 place-items-center rounded-full bg-[#DDD7C9]/10 text-[#DDD7C9] transition-colors hover:bg-[#DDD7C9]/20">
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>

            {/* Quote */}
            <div className="mt-10 max-w-[320px] text-center text-[20px] font-medium leading-snug text-[#DDD7C9]">
              Build confidence before you build wealth.
            </div>

            {/* Pagination Dots */}
            <div className="mt-10 flex gap-2.5 pb-4">
              {prompts.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={
                    activeIndex === index
                      ? "h-1.5 w-10 rounded-full bg-[#8A9080]"
                      : "h-1.5 w-3.5 rounded-full bg-[#DDD7C9]/30"
                  }
                  aria-label={`Show prompt ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - AUTH FORM CONTAINER */}
        <div className="flex h-full w-full items-center justify-center p-4 sm:p-8 lg:p-12">
          <AuthForm />
        </div>
      </div>
    </section>
  );
}

function ImageTile({
  src,
  active,
  className,
}: {
  src: string;
  active: boolean;
  className: string;
}) {
  return (
    <div
      className={`${className} relative overflow-hidden rounded-[12px] ${active ? "z-10" : "z-0"}`}
    >
      <img
        src={src}
        alt="Financial insight"
        className={`h-full w-full rounded-[12px] object-cover transition-all duration-700 ${active ? "opacity-100 scale-100" : "opacity-40 scale-105"}`}
      />
      <FocusCorners active={active} />
    </div>
  );
}

function FocusCorners({ active }: { active: boolean }) {
  const baseClass = `pointer-events-none absolute h-4 w-4 border-[#8A9080] transition-all duration-500 ease-out ${active ? "translate-x-0 translate-y-0 opacity-100" : "opacity-0 scale-150"}`;

  return (
    <>
      <div className={`${baseClass} -left-2 -top-2 border-l-2 border-t-2 ${active ? "" : "-translate-x-2 -translate-y-2"}`} />
      <div className={`${baseClass} -right-2 -top-2 border-r-2 border-t-2 ${active ? "" : "translate-x-2 -translate-y-2"}`} />
      <div className={`${baseClass} -bottom-2 -left-2 border-b-2 border-l-2 ${active ? "" : "-translate-x-2 translate-y-2"}`} />
      <div className={`${baseClass} -bottom-2 -right-2 border-b-2 border-r-2 ${active ? "" : "translate-x-2 translate-y-2"}`} />
    </>
  );
}

function AuthForm() {
  return (
    <div className="w-full max-w-[520px] text-left flex flex-col justify-center px-2 sm:px-6">
      
      {/* Title & Subtitle */}
      <div>
        <div className="text-[18px] sm:text-[20px] font-bold tracking-tight text-[#303A3C] whitespace-nowrap">
          Create an account
        </div>
        <p className="mt-1 text-[13px] font-medium text-[#303A3C]/60">
          Start your financial journey with FinWise.
        </p>
      </div>

      {/* Social SSO Buttons */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <SocialButton icon={<GoogleIcon />} label="Sign up with Google" />
        <SocialButton icon={<AppleIcon />} label="Sign up with Apple" />
      </div>

      {/* Divider */}
      <div className="my-8 flex items-center gap-4 text-[11px] font-bold tracking-[0.2em] uppercase text-[#303A3C]/35">
        <div className="h-px flex-1 bg-[#303A3C]/15" />
        OR
        <div className="h-px flex-1 bg-[#303A3C]/15" />
      </div>

      {/* Form Fields */}
      <form className="flex flex-col space-y-6" onSubmit={(e) => { e.preventDefault(); window.location.href='/dashboard'; }}>
        
        {/* First & Last Name */}
        <div className="grid gap-6 sm:grid-cols-2">
          <InputField placeholder="First Name" type="text" id="first-name" />
          <InputField placeholder="Last Name" type="text" id="last-name" />
        </div>

        {/* Email & Password */}
        <InputField placeholder="Email" type="email" id="email" />
        <InputField placeholder="Password" type="password" id="password" />

        {/* Checkbox Section */}
        <div className="pt-2 space-y-4 text-[14px] leading-relaxed text-[#303A3C]/80">
          <CheckboxLine id="opt-out">
            I don&apos;t want to receive product updates.
          </CheckboxLine>
          <CheckboxLine id="terms">
            {termsText}
          </CheckboxLine>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="mt-8 h-[48px] w-full items-center justify-center rounded-[12px] bg-[#303A3C] text-[15px] font-semibold text-[#DDD7C9] transition-all hover:bg-[#232a2c] active:scale-[0.99] shadow-md hover:shadow-lg"
        >
          Submit
        </button>
      </form>
    </div>
  );
}

function SocialButton({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <button
      type="button"
      className="flex h-[48px] w-full items-center justify-center gap-3 rounded-[12px] border border-[#303A3C]/20 bg-transparent px-6 text-[14px] font-semibold text-[#303A3C] transition-all hover:bg-[#303A3C]/5 hover:border-[#303A3C]/40"
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
        className="h-[48px] w-full rounded-[12px] border border-[#303A3C]/20 bg-transparent px-7 text-[14px] text-[#303A3C] font-medium transition-all placeholder:text-[#303A3C]/50 focus:border-[#303A3C] focus:bg-[#303A3C]/5 focus:outline-none focus:ring-1 focus:ring-[#303A3C]"
      />
    </div>
  );
}

function CheckboxLine({ id, children }: { id: string; children: ReactNode }) {
  return (
    <label htmlFor={id} className="flex items-start gap-3.5 cursor-pointer group">
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
      <span className="select-none leading-snug">{children}</span>
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
