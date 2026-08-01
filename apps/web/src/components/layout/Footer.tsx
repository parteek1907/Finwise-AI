import Link from "next/link";
import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-background py-12 mt-24">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-2">
          <Link href="/" className="flex items-center space-x-2 text-foreground hover:opacity-80 transition-opacity mb-4">
            <Sparkles className="w-5 h-5 text-gold" />
            <span className="font-heading font-medium tracking-wide">Finwise AI</span>
          </Link>
          <p className="text-secondary max-w-sm text-sm">
            Build confidence before you build wealth. We combine behavioral psychology and artificial intelligence to transform your relationship with money.
          </p>
        </div>
        
        <div>
          <h4 className="text-foreground font-medium mb-4 text-sm tracking-wider uppercase">Journey</h4>
          <ul className="space-y-3">
            <li><Link href="/learn" className="text-secondary hover:text-foreground text-sm transition-colors">Curriculum</Link></li>
            <li><Link href="/simulator" className="text-secondary hover:text-foreground text-sm transition-colors">Simulator</Link></li>
            <li><Link href="/mentor" className="text-secondary hover:text-foreground text-sm transition-colors">AI Mentor</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-foreground font-medium mb-4 text-sm tracking-wider uppercase">Legal</h4>
          <ul className="space-y-3">
            <li><Link href="#" className="text-secondary hover:text-foreground text-sm transition-colors">Privacy</Link></li>
            <li><Link href="#" className="text-secondary hover:text-foreground text-sm transition-colors">Terms</Link></li>
            <li><Link href="#" className="text-secondary hover:text-foreground text-sm transition-colors">Disclaimers</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-xs text-muted">
        <p>© {new Date().getFullYear()} Finwise AI. All rights reserved.</p>
        <p className="mt-2 md:mt-0">Not an investment advisor. Always educate.</p>
      </div>
    </footer>
  );
}
