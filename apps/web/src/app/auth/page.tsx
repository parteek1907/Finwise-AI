"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Mail, ArrowRight } from "lucide-react";

export default function AuthPage() {
  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-background relative overflow-hidden">
      
      {/* Decorative abstract background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gold/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-info/5 blur-[120px] rounded-full" />
      </div>

      {/* Left side: Branding / Message (hidden on small mobile) */}
      <div className="hidden md:flex flex-1 flex-col justify-between p-12 z-10 border-r border-white/5 bg-surface/30 backdrop-blur-xl">
        <Link href="/" className="flex items-center space-x-2 text-foreground hover:opacity-80 transition-opacity">
          <Sparkles className="w-6 h-6 text-gold" />
          <span className="font-heading font-medium text-xl tracking-wide">Finwise AI</span>
        </Link>
        <div className="max-w-md">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-4xl font-heading font-medium text-foreground leading-tight"
          >
            Every investor starts with zero experience.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="mt-6 text-secondary text-lg"
          >
            Your first lesson changes everything. Join a new generation of financially confident humans.
          </motion.p>
        </div>
        <div className="text-sm text-muted">
          <p>© {new Date().getFullYear()} Finwise AI</p>
        </div>
      </div>

      {/* Right side: Auth Form */}
      <div className="flex-1 flex flex-col justify-center p-8 md:p-24 z-10">
        
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-center space-x-2 mb-16 text-foreground">
          <Sparkles className="w-6 h-6 text-gold" />
          <span className="font-heading font-medium text-xl tracking-wide">Finwise AI</span>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-sm w-full mx-auto"
        >
          <h2 className="text-2xl font-heading font-medium text-foreground mb-2">Welcome</h2>
          <p className="text-secondary mb-10">Create an account or sign in to continue.</p>

          <div className="space-y-4">
            <button className="w-full flex items-center justify-center space-x-3 bg-white text-black p-4 rounded-full font-medium hover:bg-gray-100 transition-all hover:scale-[1.02]">
              {/* Simple Google SVG icon */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-border"></div>
              <span className="flex-shrink-0 mx-4 text-muted text-sm uppercase">Or</span>
              <div className="flex-grow border-t border-border"></div>
            </div>

            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); window.location.href='/onboarding'; }}>
              <div>
                <input 
                  type="email" 
                  placeholder="name@example.com"
                  className="w-full bg-surface border border-border rounded-xl p-4 text-foreground placeholder-muted focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 transition-all"
                  required
                />
              </div>
              <button 
                type="submit"
                className="w-full flex items-center justify-center space-x-2 bg-foreground text-background p-4 rounded-xl font-medium hover:bg-foreground/90 transition-all hover:scale-[1.02]"
              >
                <Mail className="w-5 h-5" />
                <span>Continue with Email</span>
              </button>
            </form>
          </div>
          
          <div className="mt-8 text-center text-sm text-muted">
            By continuing, you agree to our <Link href="#" className="underline hover:text-foreground">Terms</Link> and <Link href="#" className="underline hover:text-foreground">Privacy Policy</Link>.
          </div>
        </motion.div>
      </div>
    </main>
  );
}
