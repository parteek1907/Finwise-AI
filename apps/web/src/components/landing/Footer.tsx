import React from 'react';
import { Hexagon } from 'lucide-react';
import { IconBrandTwitter, IconBrandLinkedin, IconBrandGithub } from '@tabler/icons-react';
import { Footer as UIFooter } from '@/components/ui/footer';

export function Footer() {
  return (
    <div className="w-full bg-[#303A3C] text-[#DDD7C9] border-t border-[#DDD7C9]/10" style={{ paddingLeft: '60px', paddingRight: '60px' }}>
      <div className="max-w-[1440px] mx-auto">
        <UIFooter
          brandName="FinWise AI"
          mainLinks={[
            { href: "/dashboard", label: "Dashboard" },
            { href: "/simulator", label: "Simulator" },
            { href: "/learn", label: "Education Library" },
            { href: "/mentor", label: "AI Mentor" },
          ]}
          legalLinks={[
            { href: "/privacy", label: "Privacy Policy" },
            { href: "/terms", label: "Terms of Service" },
            { href: "/cookies", label: "Cookie Policy" },
          ]}
          copyright={{
            text: `© ${new Date().getFullYear()} FinWise AI Inc.`,
            license: "All rights reserved. Not actual financial advice.",
          }}
        />
      </div>
    </div>
  );
}
