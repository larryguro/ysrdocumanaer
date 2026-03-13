'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/admin/documents', label: '문서 관리', icon: '📄' },
  { href: '/admin/menus', label: '메뉴 관리', icon: '📋' },
  { href: '/admin/users', label: '사용자 관리', icon: '👥' },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-14 left-0 w-56 h-[calc(100vh-3.5rem)] bg-gray-800 border-r border-gray-700 overflow-y-auto">
      <nav className="p-4">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive
                      ? 'bg-gray-700 text-white font-medium'
                      : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
