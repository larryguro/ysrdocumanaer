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
        <div className={`flex items-center justify-between ${padding} py-1.5 pr-2 rounded-md ${
          isActive ? 'bg-blue-50' : 'hover:bg-gray-100'
        }`}>
          {/* 문서가 연결된 경우 제목을 링크로 표시 */}
          {item.slug ? (
            <Link
              href={`/docs/${item.slug}`}
              className={`flex-1 text-sm text-left ${
                isActive ? 'text-blue-700 font-medium' : 'text-gray-700'
              }`}
            >
              {item.title}
            </Link>
          ) : (
            <span className="flex-1 text-sm text-gray-700">{item.title}</span>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="ml-1 text-gray-400 hover:text-gray-600"
            aria-expanded={isOpen}
          >
            <svg
              className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
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

  // 문서가 연결되지 않은 단독 메뉴 항목은 링크로 표시하지 않음
  if (!item.slug) {
    return (
      <li>
        <span className={`block ${padding} py-1.5 pr-2 text-sm text-gray-400 cursor-default`}>
          {item.title}
        </span>
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
