import { Button } from "@/components/ui/shadcn-button"

interface FooterProps {
  brandName: string
  mainLinks: Array<{
    href: string
    label: string
  }>
  legalLinks: Array<{
    href: string
    label: string
  }>
  copyright: {
    text: string
    license?: string
  }
}

export function Footer({
  brandName,
  mainLinks,
  legalLinks,
  copyright,
}: FooterProps) {
  return (
    <footer className="w-full py-20 lg:py-32">
      <div className="w-full">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-16 lg:gap-24">
          
          {/* Left Side: Brand Name & Copyright */}
          <div className="flex flex-col space-y-8 max-w-sm">
            <a href="/" className="font-bold text-2xl font-heading tracking-tight text-white hover:opacity-80 transition-opacity">
              {brandName}
            </a>
            <div className="text-sm leading-relaxed text-[#DDD7C9]/50">
              <div>{copyright.text}</div>
              {copyright.license && <div>{copyright.license}</div>}
            </div>
          </div>

          {/* Right Side: Links */}
          <div className="flex flex-col md:flex-row gap-12 md:gap-24">
            
            {/* Main Links */}
            <nav>
              <h4 className="text-white font-semibold uppercase tracking-wider text-xs mb-6 lg:mb-8 opacity-90">Platform</h4>
              <ul className="list-none flex flex-col gap-4">
                {mainLinks.map((link, i) => (
                  <li key={i}>
                    <a
                      href={link.href}
                      className="text-sm text-[#DDD7C9] hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Legal Links */}
            <div>
              <h4 className="text-white font-semibold uppercase tracking-wider text-xs mb-6 lg:mb-8 opacity-90">Legal</h4>
              <ul className="list-none flex flex-col gap-4">
                {legalLinks.map((link, i) => (
                  <li key={i}>
                    <a
                      href={link.href}
                      className="text-sm text-[#DDD7C9]/70 hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </div>
    </footer>
  )
}
