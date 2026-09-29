'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Users, BookOpen, BarChart3, Settings, LogOut, CheckCircle, LifeBuoy, Star, Library, Bell, Mail } from 'lucide-react';
import Image from 'next/image';

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: BarChart3 },
    { name: 'Students', path: '/admin/students', icon: Users },
    { name: 'Exams', path: '/admin/exams', icon: BookOpen },
    { name: 'Courses', path: '/admin/courses', icon: Library },
    { name: 'Announcements', path: '/admin/announcements', icon: Bell },
    { name: 'Bulk Mail', path: '/admin/mail', icon: Mail },
    { name: 'Submissions', path: '/admin/submissions', icon: CheckCircle },
    { name: 'Feedbacks', path: '/admin/feedbacks', icon: Star },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
    { name: 'Support', path: '/support', icon: LifeBuoy },
  ];

  return (
    <aside className="sidebar">
      <div className="flex flex-col items-center mb-6">
        <Image src="/logo.jpeg" alt="Logo" width={150} height={60} style={{ objectFit: 'contain' }} priority />
        <h3 className="mt-4" style={{ fontSize: '1rem', color: 'var(--primary)' }}>Admin Portal</h3>
      </div>
      
      <nav className="sidebar-nav" style={{ flex: 1 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path || (item.path !== '/admin' && pathname.startsWith(item.path));
          
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
