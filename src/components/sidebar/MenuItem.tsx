'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MenuItemType } from '@/types';

interface MenuItemProps {
  item: MenuItemType;
}

export default function MenuItem({ item }: MenuItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.slug ? pathname === `/docs/${item.slug}` : false;

  const paddingMap: Record<number, string> = {
    1: 'pl-2',
    2: 'pl-6',
    3: 'pl-10',
    4: 'pl-14',
  };
  const padding = paddingMap[item.depth] ?? 'pl-2';

  if (hasChildren) {
    return (
      <li>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between ${padding} py-1.5 pr-2 text-sm rounded-md hover:bg-gray-100 transition-colors text-left ${
            isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
          }`}
          aria-expanded={isOpen}
        >
          <span>{item.title}</span>
          <svg
            className={`w-3 h-3 text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        {isOpen && (
          <ul>
            {item.children!.map((child) => (
              <MenuItem key={child.id} item={child} />
            ))}
          </ul>
        )}
      </li>
    );
  }

  return (
    <li>
      <Link
        href={`/docs/${item.slug}`}
        className={`block ${padding} py-1.5 pr-2 text-sm rounded-md hover:bg-gray-100 transition-colors ${
          isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        {item.title}
      </Link>
    </li>
  );
}
