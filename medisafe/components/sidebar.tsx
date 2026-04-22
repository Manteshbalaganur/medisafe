'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/prescriptions/upload', label: 'Upload Prescription', icon: '📤' },
  { href: '/prescriptions/analysis', label: 'Analysis', icon: '🔍' },
  { href: '/prescriptions/history', label: 'History', icon: '📋' },
  { href: '/reminders', label: 'Reminders', icon: '🔔' },
  { href: '/ask-ai', label: 'Ask AI', icon: '💬' },
  { href: '/profile', label: 'Profile', icon: '👤' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="fixed left-0 top-0 w-64 bg-sidebar text-sidebar-foreground h-screen flex flex-col border-r border-sidebar-border z-50">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-2xl font-bold text-sidebar-foreground flex items-center gap-2">
          💊 MediSafe
        </h1>
        <p className="text-xs text-sidebar-accent mt-1">Smart Healthcare</p>
      </div>

      {/* User Info */}
      {user && (
        <div className="px-6 py-4 bg-sidebar-primary/10 border-b border-sidebar-border">
          <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
          <p className="text-xs text-sidebar-accent mt-1 truncate">{user.email}</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-sidebar-border">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full text-sidebar-foreground border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          Logout
        </Button>
      </div>
    </div>
  );
}
