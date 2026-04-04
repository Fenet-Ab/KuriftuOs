'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const pathname = usePathname();

  const navLinks = [
    { name: 'HOME', path: '/' },
    { name: 'ROOMS', path: '/rooms' },
    // { name: 'DINING', path: '/dining' },
    // { name: 'FACILITIES', path: '/facilities' },
    { name: 'ABOUT US', path: '/about' },
    { name: 'CONTACT', path: '/contact' },
    // { name: 'VACANCIES', path: '/vacancies' },
  ];

  return (
    <nav className="relative top-0 w-full z-50 flex items-center justify-between px-8 py-5 bg-resort-parchment border-b border-resort-yellow/10">
      {/* Logo Section */}
      <Link href="/" className="flex items-center gap-3 group">
        <div className="relative w-40 h-10">
          <Image
            src="/logo.png"
            alt="logo"
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 160px"
            priority
          />
        </div>
      </Link>

      {/* Navigation Links */}
      <div className="hidden lg:flex items-center gap-2">
        {navLinks.map((link) => {
          const isActive = pathname === link.path;
          return (
            <Link
              key={link.name}
              href={link.path}
              className={`
                px-5 py-2 rounded-full text-[11px] font-bold tracking-[0.2em] transition-all duration-300
                ${isActive
                  ? 'bg-resort-green/10 text-resort-green'
                  : 'text-forest hover:text-resort-green hover:bg-resort-green/5'
                }
              `}
            >
              {link.name}
              {isActive && (
                <span className="block h-0.5 w-full bg-resort-yellow mt-1 rounded-full animate-in fade-in duration-500" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Auth & CTA Buttons */}
      <div className="flex items-center gap-4">
        <Link
          href="/booking"
          className="px-6 py-2.5 rounded-full border border-resort-green text-resort-green hover:bg-resort-green hover:text-white text-[11px] font-black tracking-[0.2em] transition-all duration-300 transform active:scale-95"
        >
          BOOK NOW
        </Link>
        <Link
          href="/login"
          className="px-6 py-2.5 rounded-full bg-resort-green text-white hover:opacity-90 text-[11px] font-black tracking-[0.2em] transition-all duration-300 shadow-md shadow-resort-green/10 transform active:scale-95"
        >
          SIGN IN
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;