'use client';
import React from 'react';
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/shadcn-button';
import { cn } from '@/lib/utils';
import { MenuToggleIcon } from '@/components/ui/menu-toggle-icon';
import { useScroll } from '@/components/ui/use-scroll';
import { LineChart } from 'lucide-react';

export function Header() {
	const [open, setOpen] = React.useState(false);
	const scrolled = useScroll(10);

	const links = [
		{
			label: 'Features',
			href: '#',
		},
		{
			label: 'Pricing',
			href: '#',
		},
		{
			label: 'About',
			href: '#',
		},
	];

	React.useEffect(() => {
		if (open) {
			// Disable scroll
			document.body.style.overflow = 'hidden';
		} else {
			// Re-enable scroll
			document.body.style.overflow = '';
		}

		// Cleanup when component unmounts (important for Next.js)
		return () => {
			document.body.style.overflow = '';
		};
	}, [open]);

	return (
		<header
			className={cn(
				'fixed top-0 left-0 right-0 z-50 w-full border-b border-border bg-background shadow-sm transition-all duration-300'
			)}
		>
			<div className="mx-auto h-14 w-full max-w-[1440px] relative">
				{/* Left: Navigation Links */}
				<nav className="hidden md:flex items-center gap-8 absolute left-8 md:left-16 top-1/2 -translate-y-1/2">
					{links.map((link, i) => (
						<a key={i} className="text-sm font-medium text-foreground hover:text-foreground/70 transition-colors" href={link.href}>
							{link.label}
						</a>
					))}
				</nav>

				{/* Center: Logo (Absolutely Centered) */}
				<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center gap-2">
					<LineChart className="h-5 w-5 text-primary" />
					<span className="text-lg font-bold text-foreground tracking-tight">FinWise AI</span>
				</div>
				
				{/* Right: Sign In CTA */}
				<div className="hidden md:flex items-center absolute right-0 top-1/2 -translate-y-1/2">
					<Link href="/signin">
						<Button 
							variant="outline" 
							className="group relative h-10 overflow-hidden rounded-full border-primary/20 text-sm font-semibold tracking-wide text-foreground transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] hover:border-primary active:scale-[0.98] cursor-pointer"
							style={{ paddingLeft: '40px', paddingRight: '40px' }}
						>
							{/* Smooth bottom-up fill background */}
							<span className="absolute inset-0 bg-primary translate-y-[101%] rounded-full transition-transform duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:translate-y-0 group-active:duration-1000 group-active:bg-primary/90" />
							
							{/* Button Text */}
							<span className="relative z-10 transition-colors duration-500 group-hover:text-primary-foreground">
								Sign In
							</span>
						</Button>
					</Link>
				</div>
				
				{/* Mobile Menu Toggle */}
				<Button size="icon" variant="outline" onClick={() => setOpen(!open)} className="md:hidden absolute right-6 top-1/2 -translate-y-1/2">
					<MenuToggleIcon open={open} className="size-5" duration={300} />
				</Button>
			</div>

			<div
				className={cn(
					'bg-background/90 fixed top-14 right-0 bottom-0 left-0 z-50 flex flex-col overflow-hidden border-y md:hidden',
					open ? 'block' : 'hidden',
				)}
			>
				<div
					data-slot={open ? 'open' : 'closed'}
					className={cn(
						'data-[slot=open]:animate-in data-[slot=open]:zoom-in-95 data-[slot=closed]:animate-out data-[slot=closed]:zoom-out-95 ease-out',
						'flex h-full w-full flex-col justify-between gap-y-2 p-4',
					)}
				>
					<div className="grid gap-y-2">
						{links.map((link) => (
							<a
								key={link.label}
								className={buttonVariants({
									variant: 'ghost',
									className: 'justify-start',
								})}
								href={link.href}
							>
								{link.label}
							</a>
						))}
					</div>
					<div className="flex flex-col gap-3 mt-4 pt-4 border-t border-border">
						<Link href="/signin" className="w-full">
							<Button variant="outline" className="w-full h-11 rounded-full border-primary/20">
								Sign In
							</Button>
						</Link>
					</div>
				</div>
			</div>
		</header>
	);
}
