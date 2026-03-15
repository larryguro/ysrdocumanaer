'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function AdminHeader() {
  const [email, setEmail] = useState('');
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setEmail(data.user.email);
    });
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-gray-900 border-b border-gray-700 flex items-center px-4">
      <div className="flex items-center gap-3 flex-shrink-0">
        <Link href="/admin/documents" className="text-lg font-bold text-white">
          의사랑 관리자
        </Link>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-4">
        {email && <span className="text-sm text-gray-400">{email}</span>}
        <button
          className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1 border border-gray-600 rounded hover:border-gray-400"
          onClick={handleLogout}
        >
          로그아웃
        </button>
      </div>
    </header>
  );
}
