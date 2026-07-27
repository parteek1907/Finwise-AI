import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';

export function FooterFinal() {
  return (
    <footer className="relative w-full overflow-hidden border-t border-white/5" style={{ backgroundColor: '#303A3C' }}>
      {/* Ultra Faint Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{
          opacity: 0.02,
          backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Main Container - Full width, NO left/right margins, just small padding so it doesn't touch the literal pixel edge */}
      <div className="w-full px-4 sm:px-8 py-12 relative z-10">
        
        {/* Top Section - PURELY HORIZONTAL ALWAYS */}
        <div className="flex flex-row justify-between items-start w-full gap-8 mb-16">
          
          {/* Logo & Description (Left Side up to the line) */}
          <div className="flex flex-col items-start text-left space-y-4 w-[55%] pr-12">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-bold text-2xl tracking-tight" style={{ color: '#DDD7C9' }}>
                FinWise AI
              </span>
            </Link>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(221, 215, 201, 0.7)' }}>
              FinWise AI is a global financial intelligence platform that helps users discover trading strategies, engage with live simulated markets, and drive personal wealth outcomes through AI mentorship, interactive education, and powerful portfolio analytics.
            </p>
          </div>

          {/* Right Side Links (Spaced out evenly to avoid congestion) */}
          <div className="flex flex-row justify-between items-start w-[45%]">
            
            {/* Platform Links */}
            <div className="flex flex-col items-start text-left space-y-4">
              <h3 className="text-base font-bold" style={{ color: '#DDD7C9' }}>Platform</h3>
              <nav className="flex flex-col items-start space-y-2 text-sm">
                <Link href="/auth" style={{ color: 'rgba(221, 215, 201, 0.7)' }} className="hover:text-white transition-colors">Dashboard</Link>
                <Link href="/auth" style={{ color: 'rgba(221, 215, 201, 0.7)' }} className="hover:text-white transition-colors">Trading Simulator</Link>
                <Link href="/auth" style={{ color: 'rgba(221, 215, 201, 0.7)' }} className="hover:text-white transition-colors">Education Library</Link>
                <Link href="/auth" style={{ color: 'rgba(221, 215, 201, 0.7)' }} className="hover:text-white transition-colors">AI Mentor</Link>
                <Link href="/auth" style={{ color: 'rgba(221, 215, 201, 0.7)' }} className="hover:text-white transition-colors">Scam Shield</Link>
              </nav>
            </div>

            {/* Company Links */}
            <div className="flex flex-col items-start text-left space-y-4">
              <h3 className="text-base font-bold" style={{ color: '#DDD7C9' }}>Company</h3>
              <nav className="flex flex-col items-start space-y-2 text-sm">
                <Link href="/#features" style={{ color: 'rgba(221, 215, 201, 0.7)' }} className="hover:text-white transition-colors">Our Features</Link>
                <Link href="/#community" style={{ color: 'rgba(221, 215, 201, 0.7)' }} className="hover:text-white transition-colors">Join Community</Link>
                <Link href="/#pricing" style={{ color: 'rgba(221, 215, 201, 0.7)' }} className="hover:text-white transition-colors">Pricing</Link>
                <Link href="/#faq" style={{ color: 'rgba(221, 215, 201, 0.7)' }} className="hover:text-white transition-colors">FAQ</Link>
                <Link href="/auth" style={{ color: 'rgba(221, 215, 201, 0.7)' }} className="hover:text-white transition-colors">Get Started</Link>
              </nav>
            </div>

            {/* Contact */}
            <div className="flex flex-col items-start text-left space-y-4">
              <h3 className="text-base font-bold" style={{ color: '#DDD7C9' }}>Contact</h3>
              <address className="flex flex-col items-start space-y-4 text-sm not-italic leading-relaxed" style={{ color: 'rgba(221, 215, 201, 0.7)' }}>
                <div className="flex items-start gap-3">
                  <Phone size={16} className="mt-0.5 shrink-0" style={{ color: '#DDD7C9' }} />
                  <div className="flex flex-col">
                    <span className="font-semibold" style={{ color: '#DDD7C9' }}>For Business Inquiry:</span>
                    <span>+1 (123) 456-7890</span>
                    <span>hello@finwise.ai</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail size={16} className="mt-0.5 shrink-0" style={{ color: '#DDD7C9' }} />
                  <div className="flex flex-col">
                    <span className="font-semibold" style={{ color: '#DDD7C9' }}>For Support & Queries:</span>
                    <span>support@finwise.ai</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="mt-0.5 shrink-0" style={{ color: '#DDD7C9' }} />
                  <div className="flex flex-col">
                    <span>123 Innovation Street,</span>
                    <span>Tech City, TC 12345</span>
                  </div>
                </div>
              </address>
            </div>
            
          </div>
          
        </div>

        {/* Bottom Bar - PURELY HORIZONTAL */}
        <div className="pt-8 flex flex-row items-center justify-between border-t" style={{ borderColor: 'rgba(221, 215, 201, 0.1)' }}>
          
          <nav className="flex flex-row gap-6 text-sm">
            <Link href="/privacy" style={{ color: 'rgba(221, 215, 201, 0.5)' }} className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" style={{ color: 'rgba(221, 215, 201, 0.5)' }} className="hover:text-white transition-colors">Terms & Conditions</Link>
          </nav>

          <p className="text-sm" style={{ color: 'rgba(221, 215, 201, 0.5)' }}>
            © {new Date().getFullYear()} FinWise AI. All rights reserved.
          </p>

          {/* Removed social icons completely */}
          <div className="hidden"></div>
        </div>

      </div>
    </footer>
  );
}
