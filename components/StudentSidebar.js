'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Award, LogOut, LifeBuoy, Settings, Rocket, Library } from 'lucide-react';
import Image from 'next/image';

export default function StudentSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const navItems = [
    { name: 'My Exams', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Results & Certificates', path: '/dashboard/results', icon: Award },
    { name: 'Career Hub', path: '/dashboard/career-hub', icon: Rocket },
    { name: 'Other Courses', path: '/dashboard/courses', icon: Library },
    { name: 'Support', path: '/support', icon: LifeBuoy },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];

  return (
    <aside className="sidebar">
      <div className="flex flex-col items-center mb-6">
        <Image src="/logo.jpeg" alt="Logo" width={150} height={60} style={{ objectFit: 'contain' }} priority />
        <h3 className="mt-4" style={{ fontSize: '1rem', color: 'var(--primary)' }}>Student Portal</h3>
      </div>
      
      <nav className="sidebar-nav" style={{ flex: 1 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          
          return (
             <Link 
              key={item.name} 
              href={item.path}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
        <button 
          onClick={handleLogout}
          className="sidebar-link"
          style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
