import React from 'react';
import Link from 'next/link';
import { Send } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative overflow-hidden" style={{ backgroundColor: '#303A3C' }}>
      {/* Ultra Faint Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{
          opacity: 0.02,
          backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Main Container - Standardized Width */}
      <div className="w-full max-w-7xl mx-auto px-8 md:px-16 lg:px-24 py-24 relative z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-24">
          
          {/* Quick Links (Col 1) */}
          <div className="flex flex-col items-center text-center space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest" style={{ color: '#DDD7C9' }}>Platform</h3>
            <nav className="flex flex-col items-center space-y-4 text-base">
              <Link href="/auth" style={{ color: 'rgba(221, 215, 201, 0.7)' }} className="hover:opacity-100 transition-opacity">Dashboard</Link>
              <Link href="/auth" style={{ color: 'rgba(221, 215, 201, 0.7)' }} className="hover:opacity-100 transition-opacity">Trading Simulator</Link>
              <Link href="/auth" style={{ color: 'rgba(221, 215, 201, 0.7)' }} className="hover:opacity-100 transition-opacity">Education Library</Link>
              <Link href="/auth" style={{ color: 'rgba(221, 215, 201, 0.7)' }} className="hover:opacity-100 transition-opacity">AI Mentor</Link>
              <Link href="/auth" style={{ color: 'rgba(221, 215, 201, 0.7)' }} className="hover:opacity-100 transition-opacity">Scam Shield</Link>
            </nav>
          </div>

          {/* Contact Us (Col 2) */}
          <div className="flex flex-col items-center text-center space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest" style={{ color: '#DDD7C9' }}>Contact Us</h3>
            <address className="flex flex-col items-center space-y-4 text-base not-italic leading-relaxed" style={{ color: 'rgba(221, 215, 201, 0.7)' }}>
              <p>123 Innovation Street<br />Tech City, TC 12345</p>
              <p>hello@finwise.ai<br />(123) 456-7890</p>
            </address>
          </div>

          {/* Newsletter (Col 3) */}
          <div className="flex flex-col items-center text-center space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest" style={{ color: '#DDD7C9' }}>Stay Connected</h3>
            <p className="text-base leading-relaxed" style={{ color: 'rgba(221, 215, 201, 0.7)' }}>
              Join our newsletter for the latest market insights, feature updates, and exclusive offers delivered weekly.
            </p>
            
            {/* Premium Underline Email Input */}
            <form className="relative w-full max-w-sm mt-4 flex items-center border-b pb-3 mx-auto" style={{ borderColor: 'rgba(221, 215, 201, 0.3)' }}>
              <input
                type="email"
                placeholder="Enter your email address"
                className="w-full bg-transparent border-0 text-base focus:outline-none text-center placeholder:text-center px-8"
                style={{ color: '#DDD7C9' }}
              />
              <button
                type="button"
                className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center transition-transform hover:scale-110"
                style={{ color: '#DDD7C9' }}
              >
                <Send size={20} />
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="mt-24 pt-12 flex flex-col items-center justify-center gap-8 border-t" style={{ borderColor: 'rgba(221, 215, 201, 0.1)' }}>
          <div className="flex flex-col items-center gap-6">
            <span className="font-bold text-base tracking-tight opacity-30" style={{ color: '#DDD7C9' }}>
              FINWISE AI
            </span>
            <nav className="flex gap-8 text-sm justify-center">
              <Link href="/privacy" style={{ color: 'rgba(221, 215, 201, 0.5)' }} className="hover:opacity-100 transition-opacity">Privacy Policy</Link>
              <Link href="/terms" style={{ color: 'rgba(221, 215, 201, 0.5)' }} className="hover:opacity-100 transition-opacity">Terms of Service</Link>
            </nav>
          </div>
          <p className="text-sm text-center" style={{ color: 'rgba(221, 215, 201, 0.5)' }}>
            © {new Date().getFullYear()} FinWise AI Inc. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}
