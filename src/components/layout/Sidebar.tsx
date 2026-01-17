'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  HelpCircle,
  Star,
  Package,
  BarChart3,
  Settings,
  LogOut,
  Inbox,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Applications', href: '/applications', icon: FileText },
  { name: 'Contacts', href: '/contacts', icon: Inbox },
  {
    name: 'Content',
    items: [
      { name: 'Blogs', href: '/content/blogs', icon: MessageSquare },
      { name: 'FAQs', href: '/content/faqs', icon: HelpCircle },
      { name: 'Testimonials', href: '/content/testimonials', icon: Star },
      { name: 'Products', href: '/content/products', icon: Package },
    ],
  },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout, admin } = useAuth();

  return (
    <div className="flex h-full w-64 flex-col border-r border-white/10 bg-gradient-to-b from-[#030c22] via-[#041636] to-[#061a3f] text-white shadow-2xl">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-white/10 px-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 text-base font-bold text-white shadow-lg">
            SM
          </div>
          <span className="text-lg font-semibold">SeaMoneeCredit</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navigation.map((item) =>
          item.items ? (
            <div key={item.name} className="space-y-1">
              <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white/50">
                {item.name}
              </p>
              {item.items.map((subItem) => (
                <Link
                  key={subItem.href}
                  href={subItem.href}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border-l-2 border-transparent px-3 py-2 text-sm transition-all',
                    pathname === subItem.href
                      ? 'bg-white/15 text-white shadow-inner border-cyan-300'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  )}
                >
                  <subItem.icon className="h-4 w-4" />
                  {subItem.name}
                </Link>
              ))}
            </div>
          ) : (
            <Link
              key={item.href}
              href={item.href!}
              className={cn(
                'flex items-center gap-3 rounded-xl border-l-2 border-transparent px-3 py-2 text-sm transition-all',
                pathname === item.href
                  ? 'bg-white/15 text-white shadow-inner border-cyan-300'
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          )
        )}
      </nav>

      {/* User & Logout */}
      <div className="border-t border-white/10 p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-sm font-medium">
            {admin?.name?.charAt(0) || 'A'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{admin?.name || 'Admin'}</p>
            <p className="truncate text-xs text-white/60">{admin?.role}</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2 rounded-xl border-white/20 text-white hover:bg-white/10"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
