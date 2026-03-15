'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AdminUserType } from '@/types';
import UserAddModal from '@/components/admin/UserAddModal';

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsers = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true });

    if (data) {
      setUsers(
        data.map((u) => ({
          id: u.id,
          email: u.email ?? '',
          name: u.name ?? '',
          role: 'admin' as const,
          isActive: u.is_active,
          createdAt: u.created_at?.split('T')[0] ?? '',
        }))
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function handleAddUser(email: string, name: string) {
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name }),
    });
    if (res.ok) {
      await fetchUsers();
    } else {
      const data = await res.json();
      alert(data.error || '사용자 추가 중 오류가 발생했습니다.');
    }
  }

  async function handleToggleActive(id: string) {
    const user = users.find((u) => u.id === id);
    if (!user) return;
    const supabase = createClient();
    await supabase.from('profiles').update({ is_active: !user.isActive }).eq('id', id);
    setUsers(users.map((u) => (u.id === id ? { ...u, isActive: !u.isActive } : u)));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">사용자 관리</h1>
          <p className="text-sm text-gray-500 mt-1">총 {users.length}명의 관리자</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + 관리자 추가
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
            불러오는 중...
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-600 w-[15%]">이름</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 w-[30%]">이메일</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 w-[12%]">권한</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 w-[12%]">상태</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 w-[15%]">가입일</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600 w-[16%]">작업</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-sm">
                    관리자 계정이 없습니다.
                  </td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <tr
                    key={user.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      index === users.length - 1 ? 'border-b-0' : ''
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">{user.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          user.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {user.isActive ? '활성' : '비활성'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{user.createdAt}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleToggleActive(user.id)}
                        className={`text-xs font-medium ${
                          user.isActive
                            ? 'text-orange-500 hover:text-orange-700'
                            : 'text-green-600 hover:text-green-800'
                        }`}
                      >
                        {user.isActive ? '비활성화' : '활성화'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <UserAddModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddUser}
      />
    </div>
  );
}
