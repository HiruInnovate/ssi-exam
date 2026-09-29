import { getUserFromCookie } from '@/lib/auth';
import StudentSidebar from '@/components/StudentSidebar';
import AdminSidebar from '@/components/AdminSidebar';
import SupportForm from './SupportForm';
import StandaloneSupport from './StandaloneSupport';
import MobileHeader from '@/components/MobileHeader';

export const metadata = {
  title: 'Support | SSI Exam Portal',
};

export default async function SupportPage() {
  const user = await getUserFromCookie();
  const userRole = user?.role || null;

  // Determine which sidebar to show (if any)
  let SidebarComponent = null;
  if (userRole === 'student') SidebarComponent = StudentSidebar;
  if (userRole === 'admin') SidebarComponent = AdminSidebar;

  const content = (
    <div className="container relative z-10" style={{ maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
      <SupportForm userRole={userRole} />
    </div>
  );

  // If user is logged in, show the dashboard layout
  if (userRole) {
    return (
      <div className="dashboard-layout">
        <SidebarComponent />
        <MobileHeader sidebar={SidebarComponent} />
        <main className="main-content mobile-padded" style={{ padding: '1.5rem 2rem' }}>
          {content}
        </main>
      </div>
    );
  }

  // Public/Standalone Layout
  return (
    <StandaloneSupport>
      {content}
    </StandaloneSupport>
  );
}
