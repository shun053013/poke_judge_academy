'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Header = () => {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'ホーム' },
    { href: '/quiz', label: 'クイズ' },
    { href: '/progress', label: '進捗' },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* ロゴ */}
          <Link href="/" className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors">
            <BookOpen className="w-8 h-8" />
            <span className="font-bold text-xl">ポケカジャッジ道場</span>
          </Link>

          {/* ナビゲーション */}
          <nav className="flex space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-4 py-2 rounded-lg font-medium transition-colors',
                  pathname === item.href
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};
