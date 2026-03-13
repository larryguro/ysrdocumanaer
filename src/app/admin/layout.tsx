import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="flex pt-14">
        <AdminSidebar />
        <main className="flex-1 ml-56 p-6 min-h-[calc(100vh-3.5rem)]">{children}</main>
      </div>
    </div>
  );
}
