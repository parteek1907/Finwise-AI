import Link from "next/link";
import { Sparkles } from "lucide-react";

export function Header() {
  return (
    <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-background/60 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 text-foreground hover:opacity-80 transition-opacity">
          <Sparkles className="w-5 h-5 text-gold" />
          <span className="font-heading font-medium tracking-wide">Finwise AI</span>
        </Link>
        <nav className="flex items-center space-x-8">
          <Link href="/learn" className="text-sm text-secondary hover:text-foreground transition-colors">
            Learn
          </Link>
          <Link href="/auth" className="text-sm font-medium text-background bg-foreground px-4 py-2 rounded-full hover:bg-foreground/90 transition-all hover:scale-105 shadow-[0_4px_14px_0_rgba(255,255,255,0.1)]">
            Start Your Journey
          </Link>
        </nav>
      </div>
    </header>
  );
}
