'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import {
  LayoutDashboard, Megaphone, BarChart3, Users, Bot,
  Settings, ChevronLeft, ChevronRight, Zap, Contact2, CreditCard, Users2,
  Filter, MessageSquare, Radio, Wand2, ShoppingBag, GraduationCap,
  GitBranch, Star, Grid, PieChart, ChevronDown,
} from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { Logo } from '../ui/Logo';

interface NavItem { path: string; label: string; icon: React.ElementType; }
interface NavGroup { label: string; items: NavItem[]; }

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Main',
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Marketing',
    items: [
      { path: '/campaigns', label: 'Campaigns', icon: Megaphone },
      { path: '/automations', label: 'Automations', icon: Zap },
      { path: '/social', label: 'Social Listen', icon: Radio },
      { path: '/ad-creative', label: 'Ad Creative', icon: Wand2 },
      { path: '/ai-advisor', label: 'AI Advisor', icon: Bot },
    ],
  },
  {
    label: 'Sales',
    items: [
      { path: '/crm', label: 'CRM', icon: Contact2 },
      { path: '/funnels', label: 'Funnels', icon: Filter },
      { path: '/chatbots', label: 'Chatbots', icon: MessageSquare },
      { path: '/influencers', label: 'Influencers', icon: Star },
    ],
  },
  {
    label: 'Commerce',
    items: [
      { path: '/store', label: 'Store', icon: ShoppingBag },
      { path: '/affiliates', label: 'Affiliates', icon: GitBranch },
      { path: '/courses', label: 'Courses', icon: GraduationCap },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { path: '/analytics', label: 'Analytics', icon: BarChart3 },
      { path: '/bi', label: 'BI Engine', icon: PieChart },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { path: '/community', label: 'Community', icon: Users },
      { path: '/marketplace', label: 'Marketplace', icon: Grid },
      { path: '/team', label: 'Team', icon: Users2 },
      { path: '/billing', label: 'Billing', icon: CreditCard },
      { path: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { user } = useAuthStore();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(
    () => Object.fromEntries(NAV_GROUPS.map(g => [g.label, true]))
  );

  const toggleGroup = (label: string) =>
    setCollapsed(prev => ({ ...prev, [label]: !prev[label] }));

  const isGroupActive = (group: NavGroup) =>
    group.items.some(item => pathname === item.path || (pathname?.startsWith(item.path + '/') ?? false));

  return (
    <aside
      className={clsx(
        'relative flex flex-col bg-gray-900 text-white transition-all duration-300 ease-in-out shrink-0',
        sidebarCollapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className={clsx('flex items-center gap-3 px-4 py-4 border-b border-gray-700/60', sidebarCollapsed && 'justify-center px-0')}>
        {sidebarCollapsed
          ? <Logo size={30} showText={false} />
          : <Logo size={30} textColor="text-white" />
        }
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto scrollbar-thin">
        {NAV_GROUPS.map((group) => {
          const isOpen = !collapsed[group.label];
          const hasActive = isGroupActive(group);

          return (
            <div key={group.label} className="mb-1">
              {/* Group header — hidden when sidebar collapsed */}
              {!sidebarCollapsed && (
                <button
                  onClick={() => toggleGroup(group.label)}
                  className={clsx(
                    'w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors',
                    hasActive ? 'text-primary-400' : 'text-gray-500 hover:text-gray-300'
                  )}
                >
                  <span>{group.label}</span>
                  <ChevronDown
                    size={12}
                    className={clsx('transition-transform duration-200', !isOpen && '-rotate-90')}
                  />
                </button>
              )}

              {/* Items */}
              {(sidebarCollapsed || isOpen) && (
                <div className={clsx('space-y-0.5 px-2', !sidebarCollapsed && 'mt-0.5')}>
                  {group.items.map(({ path, label, icon: Icon }) => {
                    const isActive = pathname === path || (pathname?.startsWith(path + '/') ?? false);
                    return (
                      <Link
                        key={path}
                        href={path}
                        title={sidebarCollapsed ? label : undefined}
                        className={clsx(
                          'flex items-center gap-3 px-2 py-2 rounded-lg text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-primary-600 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800',
                          sidebarCollapsed && 'justify-center'
                        )}
                      >
                        <Icon size={17} className="shrink-0" />
                        {!sidebarCollapsed && <span className="truncate">{label}</span>}
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Divider between groups when collapsed */}
              {sidebarCollapsed && <div className="my-1 mx-3 border-t border-gray-800" />}
            </div>
          );
        })}
      </nav>

      {/* User profile */}
      {user && (
        <div className={clsx('border-t border-gray-700/60 p-3', sidebarCollapsed && 'flex justify-center')}>
          <div className={clsx('flex items-center gap-2.5', sidebarCollapsed && 'justify-center')}>
            <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {user.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate leading-tight">{user.name}</p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-7 flex items-center justify-center w-6 h-6 rounded-full bg-gray-700 border border-gray-600 text-gray-300 hover:bg-gray-600 transition-colors shadow-sm"
        aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {sidebarCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
