import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';
import { IconBrandLinkedin, IconBrandInstagram, IconBrandX, IconBrandWhatsapp } from '@tabler/icons-react';

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

      {/* Main Container */}
      <div className="w-full max-w-7xl mx-auto px-8 md:px-16 lg:px-24 py-16 lg:py-24 relative z-10">
        
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 lg:gap-8 mb-16 w-full">
          
          {/* Logo & Description */}
          <div className="lg:col-span-2 flex flex-col items-start text-left space-y-6 lg:pr-12">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-bold text-2xl tracking-tight" style={{ color: '#DDD7C9' }}>
                FinWise AI
              </span>
            </Link>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(221, 215, 201, 0.7)' }}>
              FinWise AI is a global financial intelligence platform that helps users discover trading strategies, engage with live simulated markets, and drive personal wealth outcomes through AI mentorship, interactive education, and powerful portfolio analytics.
            </p>
          </div>

          {/* Platform Links */}
          <div className="lg:col-span-1 flex flex-col items-start text-left space-y-6">
            <h3 className="text-base font-bold" style={{ color: '#DDD7C9' }}>Platform</h3>
            <nav className="flex flex-col items-start space-y-4 text-sm">
              <Link href="/auth" style={{ color: 'rgba(221, 215, 201, 0.7)' }} className="hover:text-white transition-colors">Dashboard</Link>
              <Link href="/auth" style={{ color: 'rgba(221, 215, 201, 0.7)' }} className="hover:text-white transition-colors">Trading Simulator</Link>
              <Link href="/auth" style={{ color: 'rgba(221, 215, 201, 0.7)' }} className="hover:text-white transition-colors">Education Library</Link>
              <Link href="/auth" style={{ color: 'rgba(221, 215, 201, 0.7)' }} className="hover:text-white transition-colors">AI Mentor</Link>
              <Link href="/auth" style={{ color: 'rgba(221, 215, 201, 0.7)' }} className="hover:text-white transition-colors">Scam Shield</Link>
            </nav>
          </div>

          {/* Company Links */}
          <div className="lg:col-span-1 flex flex-col items-start text-left space-y-6">
            <h3 className="text-base font-bold" style={{ color: '#DDD7C9' }}>Company</h3>
            <nav className="flex flex-col items-start space-y-4 text-sm">
              <Link href="/#features" style={{ color: 'rgba(221, 215, 201, 0.7)' }} className="hover:text-white transition-colors">Our Features</Link>
              <Link href="/#community" style={{ color: 'rgba(221, 215, 201, 0.7)' }} className="hover:text-white transition-colors">Join Community</Link>
              <Link href="/#pricing" style={{ color: 'rgba(221, 215, 201, 0.7)' }} className="hover:text-white transition-colors">Pricing</Link>
              <Link href="/#faq" style={{ color: 'rgba(221, 215, 201, 0.7)' }} className="hover:text-white transition-colors">FAQ</Link>
              <Link href="/auth" style={{ color: 'rgba(221, 215, 201, 0.7)' }} className="hover:text-white transition-colors">Get Started</Link>
            </nav>
          </div>

          {/* Contact (Aligned completely to the right) */}
          <div className="lg:col-span-2 flex justify-end">
            <div className="flex flex-col items-start text-left space-y-6">
              <h3 className="text-base font-bold" style={{ color: '#DDD7C9' }}>Contact</h3>
              <address className="flex flex-col items-start space-y-6 text-sm not-italic leading-relaxed" style={{ color: 'rgba(221, 215, 201, 0.7)' }}>
                <div className="flex items-start gap-3">
                  <Phone size={18} className="mt-0.5" style={{ color: '#DDD7C9' }} />
                  <div className="flex flex-col">
                    <span className="font-semibold" style={{ color: '#DDD7C9' }}>For Business Inquiry:</span>
                    <span>+1 (123) 456-7890</span>
                    <span>hello@finwise.ai</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail size={18} className="mt-0.5" style={{ color: '#DDD7C9' }} />
                  <div className="flex flex-col">
                    <span className="font-semibold" style={{ color: '#DDD7C9' }}>For Support & Queries:</span>
                    <span>support@finwise.ai</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="mt-0.5" style={{ color: '#DDD7C9' }} />
                  <div className="flex flex-col">
                    <span>123 Innovation Street,</span>
                    <span>Tech City, TC 12345</span>
                  </div>
                </div>
              </address>
            </div>
          </div>
          
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6 border-t" style={{ borderColor: 'rgba(221, 215, 201, 0.1)' }}>
          
          <nav className="flex gap-6 text-sm">
            <Link href="/privacy" style={{ color: 'rgba(221, 215, 201, 0.5)' }} className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" style={{ color: 'rgba(221, 215, 201, 0.5)' }} className="hover:text-white transition-colors">Terms & Conditions</Link>
          </nav>

          <p className="text-sm text-center md:text-left" style={{ color: 'rgba(221, 215, 201, 0.5)' }}>
            © {new Date().getFullYear()} FinWise AI. All rights reserved.
          </p>
          
          <div className="flex items-center gap-6">
            <a href="#" style={{ color: 'rgba(221, 215, 201, 0.5)' }} className="hover:text-white transition-colors"><IconBrandLinkedin size={20} /></a>
            <a href="#" style={{ color: 'rgba(221, 215, 201, 0.5)' }} className="hover:text-white transition-colors"><IconBrandInstagram size={20} /></a>
            <a href="#" style={{ color: 'rgba(221, 215, 201, 0.5)' }} className="hover:text-white transition-colors"><IconBrandX size={20} /></a>
            <a href="#" style={{ color: 'rgba(221, 215, 201, 0.5)' }} className="hover:text-white transition-colors"><IconBrandWhatsapp size={20} /></a>
          </div>

        </div>

      </div>
    </footer>
  );
}
