import { requireAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import MobileHeader from '@/components/MobileHeader';
import AdminSidebar from '@/components/AdminSidebar';

export const metadata = {
  title: 'Admin Dashboard | Study Smart Innovations',
};

export default async function AdminLayout({ children }) {
  const auth = await requireAuth(['admin']);
  
  if (auth.error) {
    redirect('/');
  }

  return (
    <div className="dashboard-layout">
      <AdminSidebar />
      <MobileHeader sidebar={AdminSidebar} />
      <main className="main-content mobile-padded">
        {children}
      </main>
    </div>
  );
}
