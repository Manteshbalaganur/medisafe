'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, UploadCloud, Bell, MessageSquare, User, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export function NavigationLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Upload', href: '/upload', icon: UploadCloud },
    { name: 'Reminders', href: '/reminder', icon: Bell },
    { name: 'Ask AI', href: '/ask-ai', icon: MessageSquare },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row transition-colors duration-300">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="p-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white font-bold shadow-sm">M</div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">MediSafe <span className="text-teal-600 dark:text-teal-400 italic font-medium">AI</span></span>
          </Link>
        </div>
        <nav className="flex-1 px-4 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
            return (
              <Link key={item.name} href={item.href}>
                <div className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm",
                  isActive 
                    ? "bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 shadow-sm" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                )}>
                  <item.icon className={cn("w-5 h-5", isActive ? "text-teal-600 dark:text-teal-400" : "text-slate-400 dark:text-slate-500")} />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          {mounted && (
            <Button 
              variant="ghost" 
              className="w-full justify-start text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 mr-3" /> : <Moon className="w-5 h-5 mr-3" />}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </Button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:pl-64 pb-20 md:pb-0">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex justify-between px-2 pb-safe shadow-[0_-4px_24px_rgba(0,0,0,0.02)] transition-colors duration-300">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
          return (
            <Link key={item.name} href={item.href} className="flex-1">
              <div className="flex flex-col items-center py-3 gap-1 relative">
                <item.icon className={cn("w-6 h-6 transition-colors duration-300", isActive ? "text-teal-600 dark:text-teal-400" : "text-slate-400 dark:text-slate-500")} />
                <span className={cn("text-[10px] font-semibold transition-colors duration-300", isActive ? "text-teal-700 dark:text-teal-300" : "text-slate-500 dark:text-slate-400")}>
                  {item.name}
                </span>
                {isActive && (
                  <div className="absolute top-0 inset-x-0 h-0.5 bg-teal-600 dark:bg-teal-400 rounded-b-full mx-6 shadow-sm" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
