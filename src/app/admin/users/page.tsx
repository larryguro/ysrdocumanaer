'use client';

import { useState } from 'react';
import { MOCK_ADMIN_USERS } from '@/lib/mock-data';
import { AdminUserType } from '@/types';
import UserAddModal from '@/components/admin/UserAddModal';

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUserType[]>(MOCK_ADMIN_USERS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  function handleAddUser(email: string, name: string) {
    const newUser: AdminUserType = {
      id: `u${Date.now()}`,
      email,
      name,
      role: 'admin',
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setUsers([...users, newUser]);
    console.log('사용자 추가 (Sprint 3에서 DB 연동):', newUser);
  }

  function handleToggleActive(id: string) {
    setUsers(users.map((u) => (u.id === id ? { ...u, isActive: !u.isActive } : u)));
    console.log('사용자 활성화 토글 (Sprint 3에서 DB 연동):', id);
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
            {users.map((user, index) => (
              <tr
                key={user.id}
                className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  index === users.length - 1 ? 'border-b-0' : ''
                }`}
              >
                <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
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
            ))}
          </tbody>
        </table>
      </div>

      <UserAddModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddUser}
      />
    </div>
  );
}
