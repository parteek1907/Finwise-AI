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

      {/* Main Container - Centered max-width container creates large, equal side margins on desktop */}
      <div style={{ width: '100%', padding: '48px 95px', position: 'relative', zIndex: 10 }}>

        {/* Top Section - Flex justify-between across the max-w-7xl container */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-8 lg:gap-12 mb-12 w-full">

          {/* Logo & Description (Left Side) */}
          <div className="flex flex-col items-start text-left max-w-sm lg:max-w-md space-y-2">
            <Link href="/" className="flex items-center gap-2 mb-1">
              <span className="font-bold text-xl tracking-tight" style={{ color: '#DDD7C9' }}>
                FinWise AI
              </span>
            </Link>
            <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'rgba(221, 215, 201, 0.7)' }}>
              FinWise AI is a global financial intelligence platform that helps users discover trading strategies, engage with live simulated markets, and drive personal wealth outcomes through AI mentorship, interactive education, and powerful portfolio analytics.
            </p>
          </div>

          {/* Platform Links */}
          <div className="flex flex-col items-start text-left">
            <h3 className="text-base font-bold mb-5" style={{ color: '#DDD7C9' }}>Platform</h3>
            <nav className="flex flex-col items-start space-y-1 text-xs sm:text-sm">
              <Link href="/auth" style={{ color: 'rgba(221, 215, 201, 0.7)' }} className="hover:text-white transition-colors">Dashboard</Link>
              <Link href="/auth" style={{ color: 'rgba(221, 215, 201, 0.7)' }} className="hover:text-white transition-colors">Trading Simulator</Link>
              <Link href="/auth" style={{ color: 'rgba(221, 215, 201, 0.7)' }} className="hover:text-white transition-colors">Education Library</Link>
              <Link href="/auth" style={{ color: 'rgba(221, 215, 201, 0.7)' }} className="hover:text-white transition-colors">AI Mentor</Link>
              <Link href="/auth" style={{ color: 'rgba(221, 215, 201, 0.7)' }} className="hover:text-white transition-colors">Scam Shield</Link>
            </nav>
          </div>

          {/* Company Links */}
          <div className="flex flex-col items-start text-left">
            <h3 className="text-base font-bold mb-12" style={{ color: '#DDD7C9' }}>Company</h3>
            <nav className="flex flex-col items-start space-y-1 text-xs sm:text-sm">
              <Link href="/#features" style={{ color: 'rgba(221, 215, 201, 0.7)' }} className="hover:text-white transition-colors">Our Features</Link>
              <Link href="/#community" style={{ color: 'rgba(221, 215, 201, 0.7)' }} className="hover:text-white transition-colors">Join Community</Link>
              <Link href="/#pricing" style={{ color: 'rgba(221, 215, 201, 0.7)' }} className="hover:text-white transition-colors">Pricing</Link>
              <Link href="/#faq" style={{ color: 'rgba(221, 215, 201, 0.7)' }} className="hover:text-white transition-colors">FAQ</Link>
              <Link href="/auth" style={{ color: 'rgba(221, 215, 201, 0.7)' }} className="hover:text-white transition-colors">Get Started</Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="flex flex-col items-start text-left">
            <h3 className="text-base font-bold mb-5" style={{ color: '#DDD7C9' }}>Contact</h3>
            <address className="flex flex-col items-start space-y-2 text-xs sm:text-sm not-italic leading-tight" style={{ color: 'rgba(221, 215, 201, 0.7)' }}>
              <div className="flex items-start gap-2">
                <Phone size={14} className="mt-0.5 shrink-0" style={{ color: '#DDD7C9' }} />
                <div className="flex flex-col">
                  <span className="font-semibold text-xs" style={{ color: '#DDD7C9' }}>For Business Inquiry:</span>
                  <span>+91 94637 68068</span>
                  <span>hello@finwise.ai</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Mail size={14} className="mt-0.5 shrink-0" style={{ color: '#DDD7C9' }} />
                <div className="flex flex-col">
                  <span className="font-semibold text-xs" style={{ color: '#DDD7C9' }}>For Support & Queries:</span>
                  <span>support@finwise.ai</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin size={14} className="mt-0.5 shrink-0" style={{ color: '#DDD7C9' }} />
                <div className="flex flex-col">
                  <span>SVKM's NMIMS, Chandigarh.</span>
                </div>
              </div>
            </address>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-4 flex flex-row items-center justify-between border-t" style={{ borderColor: 'rgba(221, 215, 201, 0.1)' }}>
          <nav className="flex flex-row gap-6 text-xs sm:text-sm">
            <Link href="/privacy" style={{ color: 'rgba(221, 215, 201, 0.5)' }} className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" style={{ color: 'rgba(221, 215, 201, 0.5)' }} className="hover:text-white transition-colors">Terms & Conditions</Link>
          </nav>

          <p className="text-xs sm:text-sm" style={{ color: 'rgba(221, 215, 201, 0.5)' }}>
            © {new Date().getFullYear()} FinWise AI. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}
