'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navigation() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Calendar' },
    { href: '/clients', label: 'Clients' },
    { href: '/projects', label: 'Projects' },
  ];

  return (
    <nav className="flex items-center gap-1 ml-8">
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              isActive
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-50 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
